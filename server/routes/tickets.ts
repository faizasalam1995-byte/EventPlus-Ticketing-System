import express, { Request, Response } from 'express';
import {
  getTicketsByAttendee,
  getTicketByCode,
} from '../services/dataService';
import { authenticateToken, optionalAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/tickets/me
// Mandatory Endpoint: Attendee views their booked tickets and scannable QR passes
router.get('/me', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = (req.query.email as string) || (req.user ? req.user.email : 'attendee@eventpulse.com');
    const tickets = await getTicketsByAttendee(email);
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tickets/code/:code
router.get('/code/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await getTicketByCode(req.params.code);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket code not found.' });
      return;
    }
    res.json({ success: true, ticket });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
