import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { EventItem, AttendanceMetrics, CheckInLog } from '../types';

interface OrganizerDashboardPageProps {
  onNavigateToScanner: () => void;
  onNavigateToCreateEvent: () => void;
}

export const OrganizerDashboardPage: React.FC<OrganizerDashboardPageProps> = ({
  onNavigateToScanner,
  onNavigateToCreateEvent,
}) => {
  const { user } = useAuth();
  const { isConnected, lastCheckIn } = useSocket();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [metrics, setMetrics] = useState<AttendanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [recentLogs, setRecentLogs] = useState<CheckInLog[]>([]);

  // Fetch events list
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && data.events.length > 0) {
        setEvents(data.events);
        setSelectedEventId(data.events[0]._id);
        fetchMetrics(data.events[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (eventId: string) => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('eventpulse_token');
      const res = await fetch(`/api/checkin/metrics/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
        setRecentLogs(data.metrics.recentCheckIns || []);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Real-time listener: when a checkin occurs via socket, prepend log and update count
  useEffect(() => {
    if (lastCheckIn) {
      setRecentLogs((prev) => [lastCheckIn, ...prev.slice(0, 19)]);
      if (selectedEventId && lastCheckIn.eventId === selectedEventId) {
        setMetrics((prev) => {
          if (!prev) return null;
          const newCheckedIn = prev.totalCheckedIn + 1;
          const newRate = prev.totalSold > 0 ? Math.round((newCheckedIn / prev.totalSold) * 100) : 0;
          return {
            ...prev,
            totalCheckedIn: newCheckedIn,
            checkInRate: newRate,
          };
        });
      }
    }
  }, [lastCheckIn, selectedEventId]);

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedEventId(id);
    fetchMetrics(id);
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Organizer Command Hub
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isConnected ? 'Real-Time Gate Sync' : 'Polling Mode'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Attendance & Revenue Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live capacity monitoring, gate check-in logs, and ticket tier sales for {user?.name || 'Organizer'}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToScanner}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Open Gate Scanner
            </button>
            <button
              onClick={onNavigateToCreateEvent}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Publish New Event
            </button>
          </div>
        </div>

        {/* Event Selector bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Active Event:
            </label>
            <select
              value={selectedEventId}
              onChange={handleEventChange}
              className="w-full sm:w-80 bg-slate-800/90 border border-slate-700 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({ev.city})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => selectedEventId && fetchMetrics(selectedEventId)}
              disabled={refreshing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Sync Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Capacity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Venue Capacity</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {metrics.totalCapacity}
              </span>
              <span className="text-xs text-slate-500">seats</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Venue: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEvent?.venue}</span>
            </div>
          </div>

          {/* Sold Tickets */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Tickets Sold</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {metrics.totalSold}
              </span>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {Math.round((metrics.totalSold / (metrics.totalCapacity || 1)) * 100)}% capacity
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Math.round((metrics.totalSold / (metrics.totalCapacity || 1)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Checked-In Attendance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Gate Check-Ins</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {metrics.totalCheckedIn}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {metrics.checkInRate}% turnout
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.checkInRate)}%` }}
              />
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ${metrics.revenue.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">USD</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Collected</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Tier Breakdown & Live Check-in Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tier Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ticket Tier Performance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sales capacity vs physical check-ins per tier</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
              {metrics?.tierBreakdown.length || 0} Tiers Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Tier Name</th>
                  <th className="pb-3 text-center">Allocated</th>
                  <th className="pb-3 text-center">Sold</th>
                  <th className="pb-3 text-center">Checked-In</th>
                  <th className="pb-3 text-right">Fill Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics?.tierBreakdown.map((tier, idx) => {
                  const fillPct = tier.capacity > 0 ? Math.round((tier.sold / tier.capacity) * 100) : 0;
                  const checkInPct = tier.sold > 0 ? Math.round((tier.checkedIn / tier.sold) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{tier.tierName}</div>
                        <div className="text-xs text-slate-400">Entry Gate Verified</div>
                      </td>
                      <td className="py-4 text-center font-semibold text-slate-600 dark:text-slate-300">
                        {tier.capacity}
                      </td>
                      <td className="py-4 text-center font-semibold text-purple-600 dark:text-purple-400">
                        {tier.sold}
                      </td>
                      <td className="py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {tier.checkedIn} <span className="text-xs font-normal text-slate-400">({checkInPct}%)</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="w-32 ml-auto">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>{fillPct}%</span>
                            <span>{tier.capacity - tier.sold} left</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                fillPct >= 90 ? 'bg-rose-500' : fillPct >= 50 ? 'bg-purple-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(100, fillPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Check-in Gate Stream (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live Gate Stream</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">WebSocket real-time entries</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {recentLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-xs">No scan events yet. Open gate scanner to verify attendee tickets.</p>
              </div>
            ) : (
              recentLogs.map((log, index) => {
                const isVerified = log.status === 'verified';
                return (
                  <div
                    key={log._id || index}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isVerified
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {log.ticketCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isVerified
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {isVerified ? 'Admitted' : 'Duplicate Scan'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {log.attendeeName}
                      <span className="text-slate-400 font-normal ml-2">({log.tierName})</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{log.gate || 'Main Gate'}</span>
                      <span>
                        {new Date(log.verifiedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
