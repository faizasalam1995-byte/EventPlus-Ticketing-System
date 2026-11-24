import express, { Request, Response } from 'express';
import { handleAiEventQuery } from '../services/aiService';

const router = express.Router();

// POST /api/ai/assistant
// Bonus Feature: AI Event Assistant for discovery, VIP perks comparison, and venue FAQs
router.post('/assistant', async (req: Request, res: Response): Promise<void> => {
  try {
    const promptText = req.body.prompt || req.body.message || '';
    const response = await handleAiEventQuery(promptText);
    res.json({ success: true, ...response });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
