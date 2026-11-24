import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  bookingNumber: string;
  eventId: mongoose.Types.ObjectId | string;
  eventTitle: string;
  userId?: mongoose.Types.ObjectId | string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'free';
  paymentMethod: 'card' | 'free' | 'invoice';
  ticketCount: number;
  tierBreakdown: Array<{
    tierId: mongoose.Types.ObjectId | string;
    tierName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, default: '' },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'free'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'free', 'invoice'],
      default: 'card',
    },
    ticketCount: { type: Number, required: true, min: 1 },
    tierBreakdown: [
      {
        tierId: { type: Schema.Types.ObjectId, ref: 'TicketTier', required: true },
        tierName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const BookingModel = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
