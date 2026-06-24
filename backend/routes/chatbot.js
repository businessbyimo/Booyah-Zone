import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

const SITE_CONTEXT = `You are BooyahZone's official AI assistant for a Free Fire Tournament Management platform called "BooyahZone". 
You know everything about this website:
- Users can register, join tournaments, manage their wallet (deposit/withdraw via bKash, Nagad, Rocket)
- Tournaments have entry fees, prize pools, brackets, and live results
- Leaderboard shows top players by points
- Dashboard shows wallet balance, match history, transaction history
- Payment: Send money to admin's bKash/Nagad/Rocket, then submit TrxID on the payment page
- Withdrawal: Submit request with account number, admin manually approves within 24h
- Admin manages tournaments, users, payments, match results, announcements
- Contact/support: The developer is Sakib. Facebook: https://www.facebook.com/2ndJohnnySins
- Only answer questions about THIS website. For unrelated topics, politely decline.
- If asked about developer, admin, or owner: say the name is Sakib.
- If asked for contact: provide Sakib's Facebook link: https://www.facebook.com/2ndJohnnySins
`;

// POST /api/chatbot/message
router.post('/message', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    // Build context-aware prompt
    const historyText = history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n');
    const fullPrompt = `${SITE_CONTEXT}\n\nConversation history:\n${historyText}\n\nUser: ${message}\nAssistant:`;

    const encodedQuestion = encodeURIComponent(fullPrompt);
    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/opera?ask=${encodedQuestion}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const botMessage = data.message || "I'm having trouble connecting. Please try again.";

    res.json({
      message: botMessage,
      follow_up_questions: data.follow_up_questions || [],
    });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.json({
      message: "I'm currently experiencing issues. Please contact Sakib at https://www.facebook.com/2ndJohnnySins for help.",
      follow_up_questions: [],
    });
  }
});

export default router;
