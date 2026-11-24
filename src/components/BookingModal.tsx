import React, { useState } from 'react';
import { EventItem, TicketTier } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Ticket,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  Sparkles,
} from 'lucide-react';

interface BookingModalProps {
  event: EventItem | null;
  onClose: () => void;
  onBookingSuccess: (bookingData: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onBookingSuccess }) => {
  const { user } = useAuth();

  const [selectedTierId, setSelectedTierId] = useState<string>(
    event && event.tiers.length > 0 ? event.tiers[0]._id : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(user?.name || 'Zainab Ahmed');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'attendee@eventpulse.com');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+92 300 1234567');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'free' | 'invoice'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!event) return null;

  const currentTier = event.tiers.find((t) => t._id === selectedTierId) || event.tiers[0];
  const remainingSeats = currentTier ? Math.max(0, currentTier.capacity - currentTier.soldCount) : 0;
  const isSoldOut = remainingSeats <= 0;
  const maxAllowed = currentTier ? Math.min(currentTier.maxPerBooking, remainingSeats) : 1;

  const totalAmount = currentTier ? currentTier.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSoldOut) {
      setErrorMessage(`Tier "${currentTier?.name}" is sold out. Please select another tier.`);
      return;
    }

    if (quantity > maxAllowed) {
      setErrorMessage(`You cannot select more than ${maxAllowed} ticket(s) for this tier.`);
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Please provide your full name and email for ticket delivery.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod: totalAmount === 0 ? 'free' : paymentMethod,
        items: [
          {
            tierId: currentTier._id,
            quantity: Number(quantity),
          },
        ],
      };

      const res = await fetch(`/api/events/${event._id}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('eventpulse_token')
            ? { Authorization: `Bearer ${localStorage.getItem('eventpulse_token')}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Booking failed due to reservation limits or sold-out seats.');
      }

      onBookingSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Booking error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-850 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Simulated Checkout
              </span>
              <h2 className="text-base font-black text-white font-sans leading-tight">
                Reserve Tickets
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Event Quick Info */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-sm text-slate-100">{event.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {new Date(event.startDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {event.city} • {event.venue}
              </span>
            </div>
          </div>

          {/* Tier Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Ticket Tier:
            </label>
            <div className="space-y-2">
              {event.tiers.map((tier) => {
                const isSelected = selectedTierId === tier._id;
                const remaining = Math.max(0, tier.capacity - tier.soldCount);
                const soldOut = remaining <= 0;

                return (
                  <div
                    key={tier._id}
                    onClick={() => {
                      if (!soldOut) {
                        setSelectedTierId(tier._id);
                        setQuantity(1);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      soldOut
                        ? 'bg-slate-950/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-100">{tier.name}</h4>
                          {soldOut ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Sold Out
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                              {remaining} left
                            </span>
                          )}
                        </div>
                        {tier.description && (
                          <p className="text-[11px] text-slate-400 mt-1">{tier.description}</p>
                        )}
                        {tier.perks && tier.perks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {tier.perks.map((p, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                              >
                                ✓ {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-black text-sm text-indigo-300 shrink-0 ml-3">
                        {tier.price === 0 ? 'FREE' : `$${tier.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector with Reservation Limit Validation */}
          {!isSoldOut && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Number of Tickets:
                </label>
                <span className="text-[11px] text-slate-400">
                  Max {currentTier.maxPerBooking} per booking
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-base hover:bg-slate-700"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAllowed, quantity + 1))}
                  disabled={quantity >= maxAllowed}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 disabled:text-slate-600 flex items-center justify-center font-bold text-base hover:bg-slate-700"
                >
                  +
                </button>
                <span className="text-xs text-slate-400 ml-2">
                  (${currentTier.price.toFixed(2)} x {quantity} ={' '}
                  <span className="font-bold text-white">${totalAmount.toFixed(2)}</span>)
                </span>
              </div>
            </div>
          )}

          {/* Customer Contact Details */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Ticket Delivery & Attendee Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Phone Number:
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Email Address (where QR code pass is sent):
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Simulated Payment Method (No real payments required) */}
          {totalAmount > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Option (Simulated — No Real Card Required):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Simulated Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('invoice')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === 'invoice'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Corporate Pass</span>
                </button>
              </div>
            </div>
          )}

          {/* Total & Submit */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Total Registration Fee:</span>
              <span className="text-xl font-black text-indigo-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isSoldOut}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Generating Unique QR Code Passes...</span>
              ) : isSoldOut ? (
                <span>Tier Sold Out</span>
              ) : (
                <>
                  <span>Confirm Reservation & Issue Passes (${totalAmount.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
