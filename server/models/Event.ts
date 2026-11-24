import mongoose, { Schema, Document } from 'mongoose';
import { ticketTierSchema, ITicketTier } from './TicketTier';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  address: string;
  startDate: Date;
  endDate: Date;
  image: string;
  organizerId: mongoose.Types.ObjectId | string;
  organizerName: string;
  status: 'published' | 'draft' | 'completed' | 'cancelled';
  totalCapacity: number;
  totalSold: number;
  tiers: ITicketTier[];
  tags: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Technology & AI',
        'Music & Festivals',
        'Business & Networking',
        'Workshops & Education',
        'Food & Culinary',
        'Arts & Culture',
        'Sports & Wellness',
      ],
      default: 'Technology & AI',
    },
    venue: { type: String, required: true },
    city: { type: String, required: true, default: 'Karachi' },
    address: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    image: { type: String, default: '' },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizerName: { type: String, required: true },
    status: {
      type: String,
      enum: ['published', 'draft', 'completed', 'cancelled'],
      default: 'published',
      required: true,
    },
    totalCapacity: { type: Number, required: true, min: 1 },
    totalSold: { type: Number, default: 0, min: 0 },
    tiers: [ticketTierSchema],
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const EventModel = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
