import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckIn extends Document {
  ticketId: mongoose.Types.ObjectId | string;
  ticketCode: string;
  eventId: mongoose.Types.ObjectId | string;
  eventTitle: string;
  attendeeName: string;
  tierName: string;
  verifiedAt: Date;
  verifiedByName: string;
  verifiedByRole: string;
  status: 'verified' | 'already_checked_in' | 'invalid';
  gate: string;
}

const checkInSchema = new Schema<ICheckIn>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    ticketCode: { type: String, required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    eventTitle: { type: String, default: '' },
    attendeeName: { type: String, default: '' },
    tierName: { type: String, default: '' },
    verifiedAt: { type: Date, default: Date.now },
    verifiedByName: { type: String, required: true },
    verifiedByRole: { type: String, required: true },
    status: {
      type: String,
      enum: ['verified', 'already_checked_in', 'invalid'],
      required: true,
    },
    gate: { type: String, default: 'Main Entry Gate A' },
  },
  {
    timestamps: true,
  }
);

export const CheckInModel = mongoose.models.CheckIn || mongoose.model<ICheckIn>('CheckIn', checkInSchema);
