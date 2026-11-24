import React from 'react';
import { Ticket } from '../types';
import { Printer, X, CheckCircle, AlertTriangle, Calendar, MapPin, Copy, Download, Sparkles } from 'lucide-react';

interface TicketPassModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(ticket.eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(ticket.eventDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const copyCode = () => {
    navigator.clipboard.writeText(ticket.ticketCode);
    alert(`Copied ticket code "${ticket.ticketCode}" to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Top Action Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Digital Event Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Pass Container */}
        <div id="printable-receipt" className="p-6 bg-slate-950 text-slate-100 flex flex-col">
          {/* Ticket Header & Status */}
          <div className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-indigo-500/30 shadow-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  EVENTPULSE VERIFIED PASS
                </span>
                <h2 className="text-lg font-black text-white font-sans leading-tight mt-0.5">
                  {ticket.eventTitle}
                </h2>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                  ticket.isCheckedIn
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}
              >
                {ticket.isCheckedIn ? 'CHECKED IN (USED)' : 'ACTIVE VALID PASS'}
              </span>
            </div>

            {/* Event Time & Location */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-start gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{formattedDate}</p>
                  <p className="text-[11px] text-slate-400">{formattedTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{ticket.eventCity}</p>
                  <p className="text-[11px] text-slate-400 truncate">{ticket.eventVenue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tear-Off Dotted Line Divider */}
          <div className="relative py-4 flex items-center justify-between">
            <div className="w-4 h-8 bg-slate-900 rounded-r-full -ml-6 border-r border-slate-700" />
            <div className="flex-1 border-b-2 border-dashed border-slate-800 mx-2" />
            <div className="w-4 h-8 bg-slate-900 rounded-l-full -mr-6 border-l border-slate-700" />
          </div>

          {/* Attendee & QR Code Area */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-center">
            {/* Scannable QR Code */}
            <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto shadow-inner flex items-center justify-center">
              <img
                src={ticket.qrCodeDataUrl}
                alt={`QR code for ${ticket.ticketCode}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Ticket Code with Copy Button */}
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Unique Ticket Code</p>
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-slate-950 border border-slate-700 rounded-xl">
                <span className="font-mono font-bold text-sm text-indigo-300 tracking-wider">
                  {ticket.ticketCode}
                </span>
                <button
                  onClick={copyCode}
                  className="text-slate-400 hover:text-white p-0.5"
                  title="Copy Code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Attendee Details Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-left text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Attendee</p>
                <p className="font-bold text-slate-100 truncate mt-0.5">{ticket.attendeeName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Tier</p>
                <p className="font-bold text-indigo-400 truncate mt-0.5">{ticket.tierName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Seat / Entry</p>
                <p className="font-bold text-slate-200 mt-0.5">{ticket.seatNumber || 'General Entry'}</p>
              </div>
            </div>

            {ticket.isCheckedIn && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left text-[11px] text-amber-300">
                <span className="font-semibold">Check-In Timestamp:</span>{' '}
                {new Date(ticket.checkInTime || ticket.updatedAt).toLocaleString()} (Verified by {ticket.checkedInBy || 'Gate Staff'})
              </div>
            )}
          </div>

          {/* Footer Barcode / Security Note */}
          <div className="text-center pt-4 text-slate-500 text-[10px] space-y-1">
            <p className="font-semibold text-slate-400">Present this QR code at the event entry turnstiles.</p>
            <p>Protected by EventPulse One-Time Check-In Verification Engine.</p>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Close Pass
          </button>
        </div>
      </div>
    </div>
  );
};
