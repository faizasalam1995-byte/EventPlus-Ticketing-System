import React, { useState, useEffect } from 'react';
import { CheckInLog, CheckInVerifyResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scan,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';

export const CheckInScannerPage: React.FC = () => {
  const { user, token } = useAuth();
  const { playScanSound, lastEvent } = useSocket();

  const [ticketCodeInput, setTicketCodeInput] = useState('');
  const [selectedGate, setSelectedGate] = useState('Main Turnstile Gate A');
  const [scanResult, setScanResult] = useState<CheckInVerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recentScans, setRecentScans] = useState<CheckInLog[]>([]);

  // Fetch recent check-ins
  const fetchRecentLogs = async () => {
    try {
      const res = await fetch('/api/checkin/metrics/6740a2010000000000000001', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.metrics?.recentCheckIns) {
        setRecentScans(data.metrics.recentCheckIns);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, [token]);

  // Listen to WebSocket check-ins in real-time
  useEffect(() => {
    if (lastEvent && lastEvent.type === 'checkin:verified') {
      const newLog = lastEvent.payload;
      setRecentScans((prev) => [newLog, ...prev.filter((l) => l._id !== newLog._id)]);
    }
  }, [lastEvent]);

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || ticketCodeInput).trim().toUpperCase();
    if (!code || isVerifying) return;

    setIsVerifying(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/checkin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketCode: code,
          gate: selectedGate,
        }),
      });

      const data = await res.json();
      setScanResult(data);

      if (data.status === 'verified') {
        playScanSound('verified');
        if (data.log) {
          setRecentScans((prev) => [data.log, ...prev]);
        }
      } else if (data.status === 'already_checked_in') {
        playScanSound('already_checked_in');
      } else {
        playScanSound('invalid');
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        status: 'invalid',
        message: err.message || 'Verification network error.',
      });
      playScanSound('invalid');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Scan className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-100 font-sans">
                Gate Check-In & Ticket Verifier
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified Operator: <span className="text-white font-semibold">{user?.name}</span> • One-Time Entry Protocol Active
            </p>
          </div>
        </div>

        {/* Gate Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Active Gate:</span>
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Main Turnstile Gate A">Main Turnstile Gate A</option>
            <option value="VIP Priority Gate 1">VIP Priority Gate 1</option>
            <option value="Workshop Entry Gate C">Workshop Entry Gate C</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner & Manual Input Panel (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-400" />
                Scan or Enter Ticket Code
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan attendee QR code with handheld barcode reader or enter the alphanumeric code.
              </p>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={ticketCodeInput}
                onChange={(e) => setTicketCodeInput(e.target.value)}
                placeholder="Enter Ticket Code e.g. EP-AI-9021-VIP1"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={isVerifying || !ticketCodeInput.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Evaluation Presets */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                1-Click Demonstration Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTicketCodeInput('EP-AI-9021-VIP1');
                    handleVerify('EP-AI-9021-VIP1');
                  }}
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-left text-xs transition-colors"
                >
                  <p className="font-bold">Test Valid Pass</p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">EP-AI-9021-VIP1</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTicketCodeInput('EP-AI-9022-GA1');
                    handleVerify('EP-AI-9022-GA1');
                  }}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-left text-xs transition-colors"
                >
                  <p className="font-bold">Test Duplicate Scan</p>
                  <p className="text-[10px] text-amber-400 font-mono mt-0.5">EP-AI-9022-GA1</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTicketCodeInput('EP-FAKE-9999');
                    handleVerify('EP-FAKE-9999');
                  }}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-left text-xs transition-colors"
                >
                  <p className="font-bold">Test Invalid Code</p>
                  <p className="text-[10px] text-rose-400 font-mono mt-0.5">EP-FAKE-9999</p>
                </button>
              </div>
            </div>

            {/* SCAN RESULT BANNER */}
            {scanResult && (
              <div
                className={`p-5 rounded-2xl border transition-all animate-in fade-in duration-300 ${
                  scanResult.status === 'verified'
                    ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30'
                    : scanResult.status === 'already_checked_in'
                    ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/30'
                    : 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.status === 'verified' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
                  ) : scanResult.status === 'already_checked_in' ? (
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1.5 flex-1">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`text-base font-black uppercase tracking-wider ${
                          scanResult.status === 'verified'
                            ? 'text-emerald-400'
                            : scanResult.status === 'already_checked_in'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {scanResult.status === 'verified'
                          ? '✅ ACCESS GRANTED — TICKET VERIFIED'
                          : scanResult.status === 'already_checked_in'
                          ? '⚠️ ENTRY DENIED — DUPLICATE CHECK-IN'
                          : '❌ ENTRY REJECTED — INVALID TICKET'}
                      </h3>
                      <span className="text-[11px] text-slate-400">{selectedGate}</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {scanResult.message}
                    </p>

                    {scanResult.ticket && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Attendee</span>
                          <p className="font-bold text-white truncate">{scanResult.ticket.attendeeName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Tier</span>
                          <p className="font-bold text-indigo-400 truncate">{scanResult.ticket.tierName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Seat Number</span>
                          <p className="font-bold text-white">{scanResult.ticket.seatNumber || 'General Entry'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Price Paid</span>
                          <p className="font-bold text-emerald-400">${scanResult.ticket.price.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Gate Feed Sidebar (1 Col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Live Gate Stream
              </h3>
              <button
                onClick={fetchRecentLogs}
                className="text-slate-400 hover:text-white"
                title="Refresh stream"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {recentScans.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No check-ins logged yet today.
                </p>
              ) : (
                recentScans.map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-200 truncate pr-2">
                        {log.attendeeName || 'Attendee'}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          log.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {log.status === 'verified' ? 'Verified' : 'Duplicate'}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-400 font-mono truncate">{log.ticketCode}</p>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>{log.tierName || 'Pass'}</span>
                      <span>{new Date(log.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
