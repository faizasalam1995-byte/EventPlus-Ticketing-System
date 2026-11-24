import express, { Request, Response } from 'express';
import {
  verifyCheckIn,
  getOrganizerMetrics,
  getSystemSummary,
} from '../services/dataService';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { broadcastCheckInVerified } from '../services/socket';

const router = express.Router();

// POST /api/checkin/verify
// Mandatory Endpoint: Check-in verification at event entry gates with one-time check-in enforcement
router.post(
  '/verify',
  authenticateToken,
  requireRole(['organizer', 'admin']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { ticketCode, gate } = req.body;

      if (!ticketCode) {
        res.status(400).json({ success: false, message: 'Ticket code is required for check-in verification.' });
        return;
      }

      const verifier = {
        name: req.user!.name,
        role: req.user!.role,
      };

      const result = await verifyCheckIn(ticketCode, verifier, gate || 'Main Entry Gate A');

      // Real-time broadcast for live organizer gate dashboards
      if (result.log) {
        broadcastCheckInVerified(result.log);
      }

      if (!result.success) {
        // Return 409 Conflict if already checked in, or 404 if invalid
        const statusCode = result.status === 'already_checked_in' ? 409 : 404;
        res.status(statusCode).json(result);
        return;
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/checkin/metrics/:eventId
// Mandatory Module: Organizer attendance dashboard metrics
router.get(
  '/metrics/:eventId',
  authenticateToken,
  requireRole(['organizer', 'admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await getOrganizerMetrics(req.params.eventId);
      if (!metrics) {
        res.status(404).json({ success: false, message: 'Event metrics not found.' });
        return;
      }
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/checkin/summary (Admin global audit)
router.get(
  '/summary',
  authenticateToken,
  requireRole(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const summary = await getSystemSummary();
      res.json({ success: true, summary });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;
