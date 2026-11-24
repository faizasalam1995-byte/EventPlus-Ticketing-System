import React, { useState, useEffect } from 'react';
import { Ticket } from '../types';
import { useAuth } from '../context/AuthContext';
import { TicketPassModal } from '../components/TicketPassModal';
import {
  Ticket as TicketIcon,
  QrCode,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Printer,
  Sparkles,
} from 'lucide-react';

interface MyTicketsPageProps {
  onRefresh?: () => void;
}

export const MyTicketsPage: React.FC<MyTicketsPageProps> = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchMyTickets = async () => {
    setLoading(true);
    try {
      const email = user?.email || 'attendee@eventpulse.com';
      const res = await fetch(`/api/tickets/me?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [user]);

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <TicketIcon className="w-4 h-4" />
            <span>Attendee Wallet & Passes</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 font-sans mt-1">
            My Event Passes & QR Codes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Present your unique scannable QR pass at the entrance gate for instant one-time entry.
          </p>
        </div>

        <button
          onClick={fetchMyTickets}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Passes</span>
        </button>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Fetching your verified digital passes...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <TicketIcon className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="font-bold text-slate-200">No Passes Issued Yet</h3>
          <p className="text-xs">Browse upcoming events and reserve your ticket to receive your QR code pass.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {ticket.tierName}
                    </span>
                    <h3 className="font-bold text-base text-slate-100 mt-0.5 leading-snug">
                      {ticket.eventTitle}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                      ticket.isCheckedIn
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {ticket.isCheckedIn ? 'CHECKED IN (USED)' : 'ACTIVE / READY'}
                  </span>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{new Date(ticket.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{ticket.eventCity}</span>
                  </div>
                </div>

                {/* Ticket Code and QR Preview */}
                <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="bg-white p-1 rounded-lg w-16 h-16 shrink-0 flex items-center justify-center">
                    <img
                      src={ticket.qrCodeDataUrl}
                      alt={ticket.ticketCode}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Ticket Code</p>
                    <p className="font-mono font-bold text-sm text-indigo-300 tracking-wider truncate">
                      {ticket.ticketCode}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Attendee: <span className="text-white font-medium">{ticket.attendeeName}</span>
                    </p>
                  </div>
                </div>

                {ticket.isCheckedIn && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Scanned at {new Date(ticket.checkInTime || ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button: View Pass */}
              <button
                onClick={() => setSelectedTicket(ticket)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>View Full Digital Pass & QR</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Pass Modal */}
      <TicketPassModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
};
