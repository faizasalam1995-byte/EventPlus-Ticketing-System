import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketTier extends Document {
  eventId: mongoose.Types.ObjectId | string;
  name: string;
  price: number;
  capacity: number;
  soldCount: number;
  perks: string[];
  maxPerBooking: number;
  description?: string;
}

export const ticketTierSchema = new Schema<ITicketTier>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    soldCount: { type: Number, default: 0, min: 0 },
    perks: [{ type: String }],
    maxPerBooking: { type: Number, default: 5, min: 1 },
    description: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const TicketTierModel =
  mongoose.models.TicketTier || mongoose.model<ITicketTier>('TicketTier', ticketTierSchema);
