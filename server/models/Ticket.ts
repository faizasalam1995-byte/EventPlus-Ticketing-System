import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketCode: string;
  bookingId: mongoose.Types.ObjectId | string;
  eventId: mongoose.Types.ObjectId | string;
  eventTitle: string;
  eventDate: Date;
  eventVenue: string;
  eventCity: string;
  tierId: mongoose.Types.ObjectId | string;
  tierName: string;
  attendeeName: string;
  attendeeEmail: string;
  price: number;
  isCheckedIn: boolean;
  checkInTime?: Date;
  checkedInBy?: string;
  qrCodeDataUrl: string;
  seatNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    ticketCode: { type: String, required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventVenue: { type: String, required: true },
    eventCity: { type: String, required: true },
    tierId: { type: Schema.Types.ObjectId, ref: 'TicketTier', required: true },
    tierName: { type: String, required: true },
    attendeeName: { type: String, required: true, trim: true },
    attendeeEmail: { type: String, required: true, trim: true, lowercase: true },
    price: { type: Number, required: true, min: 0 },
    isCheckedIn: { type: Boolean, default: false, index: true },
    checkInTime: { type: Date },
    checkedInBy: { type: String },
    qrCodeDataUrl: { type: String, required: true },
    seatNumber: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const TicketModel = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', ticketSchema);
