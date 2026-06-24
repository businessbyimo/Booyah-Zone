import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET /api/public/announcements - active announcements
router.get('/announcements', async (req, res) => {
  const result = await query('SELECT * FROM announcements WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 10');
  res.json(result.rows);
});

// GET /api/public/stats - site stats for homepage
router.get('/stats', async (req, res) => {
  const [users, tournaments, prizes] = await Promise.all([
    query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
    query("SELECT COUNT(*) FROM tournaments"),
    query("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type = 'prize' AND status = 'approved'"),
  ]);
  res.json({
    totalUsers: parseInt(users.rows[0].count),
    totalTournaments: parseInt(tournaments.rows[0].count),
    totalPrizes: parseFloat(prizes.rows[0].total),
  });
});

// GET /api/public/pages/:slug - static page content
router.get('/pages/:slug', async (req, res) => {
  const result = await query('SELECT * FROM static_pages WHERE slug = $1', [req.params.slug]);
  if (!result.rows.length) return res.status(404).json({ error: 'Page not found' });
  res.json(result.rows[0]);
});

export default router;
