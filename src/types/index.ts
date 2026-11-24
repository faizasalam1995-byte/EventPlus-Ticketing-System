export type UserRole = 'attendee' | 'organizer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  createdAt?: string;
}

export interface TicketTier {
  _id: string;
  eventId?: string;
  name: string;
  price: number;
  capacity: number;
  soldCount: number;
  perks: string[];
  maxPerBooking: number;
  description?: string;
}

export type EventStatus = 'published' | 'draft' | 'completed' | 'cancelled';

export interface EventItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  address: string;
  startDate: string;
  endDate: string;
  image: string;
  organizerId: string;
  organizerName: string;
  status: EventStatus;
  totalCapacity: number;
  totalSold: number;
  tiers: TicketTier[];
  tags: string[];
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  eventId: string;
  eventTitle: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'free';
  paymentMethod: 'card' | 'free' | 'invoice';
  ticketCount: number;
  tierBreakdown: Array<{
    tierId: string;
    tierName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketCode: string; // e.g. EP-TKT-9842-A1B2
  bookingId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
  tierId: string;
  tierName: string;
  attendeeName: string;
  attendeeEmail: string;
  price: number;
  isCheckedIn: boolean;
  checkInTime?: string;
  checkedInBy?: string;
  qrCodeDataUrl: string;
  seatNumber?: string;
  createdAt: string;
}

export interface CheckInLog {
  _id: string;
  ticketId: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  tierName: string;
  verifiedAt: string;
  verifiedByName: string;
  verifiedByRole: string;
  status: 'verified' | 'already_checked_in' | 'invalid';
  gate?: string;
}

export interface CheckInVerifyResponse {
  success: boolean;
  status: 'verified' | 'already_checked_in' | 'invalid';
  message: string;
  ticket?: Ticket;
  log?: CheckInLog;
}

export interface AttendanceMetrics {
  eventId: string;
  eventTitle: string;
  totalCapacity: number;
  totalSold: number;
  totalCheckedIn: number;
  checkInRate: number; // percentage e.g. 78%
  revenue: number;
  tierBreakdown: Array<{
    tierName: string;
    capacity: number;
    sold: number;
    checkedIn: number;
  }>;
  recentCheckIns: CheckInLog[];
}
