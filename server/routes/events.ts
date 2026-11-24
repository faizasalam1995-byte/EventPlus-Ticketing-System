import express, { Request, Response } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  createBookingWithTickets,
} from '../services/dataService';
import { authenticateToken, optionalAuth, requireRole, AuthRequest } from '../middleware/auth';
import { broadcastEventPublished, broadcastTicketBooked } from '../services/socket';

const router = express.Router();

// GET /api/events
// Mandatory Module: Categories and search filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const city = req.query.city as string | undefined;
    const search = req.query.search as string | undefined;
    const status = (req.query.status as string | undefined) || 'published';

    const events = await getAllEvents({ category, city, search, status });
    res.json({ success: true, count: events.length, events });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }
    res.json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/events
// Mandatory Module: Event CRUD by Organizer / Admin
router.post(
  '/',
  authenticateToken,
  requireRole(['organizer', 'admin']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, category, venue, city, address, startDate, endDate, image, tiers, tags } =
        req.body;

      if (!title || !description || !venue || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Missing required event fields: title, description, venue, and dates are mandatory.',
        });
        return;
      }

      if (!tiers || tiers.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Event must have at least one ticket tier configured.',
        });
        return;
      }

      const newEvent = await createEvent(
        {
          title,
          description,
          category: category || 'Technology & AI',
          venue,
          city: city || 'Karachi',
          address: address || '',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
          tiers,
          tags: tags || [],
        },
        req.user!
      );

      // Real-time broadcast
      broadcastEventPublished(newEvent);

      res.status(201).json({
        success: true,
        message: `Event "${newEvent.title}" published successfully!`,
        event: newEvent,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/events/:id
router.put(
  '/:id',
  authenticateToken,
  requireRole(['organizer', 'admin']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const updated = await updateEvent(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }
      res.json({ success: true, message: 'Event updated successfully.', event: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/events/:id
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['organizer', 'admin']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await deleteEvent(req.params.id);
      res.json({ success: true, message: 'Event archived/deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/events/:id/bookings
// Mandatory Modules: Simulated Checkout, Reservation Limits, Atomic Capacity & QR Ticket Issuance
router.post('/:id/bookings', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerName, customerEmail, customerPhone, paymentMethod, items } = req.body;

    if (!customerName || !customerEmail || !items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and selected ticket tiers are required for registration.',
      });
      return;
    }

    const bookingResult = await createBookingWithTickets({
      eventId: req.params.id,
      userId: req.user ? req.user.id : undefined,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod: paymentMethod || 'card',
      items,
    });

    // Real-time broadcast: instant seat decrement across all screens
    broadcastTicketBooked({
      eventId: req.params.id,
      ticketCount: bookingResult.booking.ticketCount,
      tierBreakdown: bookingResult.booking.tierBreakdown,
      bookingNumber: bookingResult.booking.bookingNumber,
    });

    res.status(201).json({
      success: true,
      message: `Reservation confirmed! ${bookingResult.tickets.length} ticket(s) issued.`,
      booking: bookingResult.booking,
      tickets: bookingResult.tickets,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Booking failed due to capacity or reservation constraints.',
    });
  }
});

export default router;
