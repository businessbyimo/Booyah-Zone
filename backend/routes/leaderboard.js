import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET /api/leaderboard?filter=weekly|monthly|alltime
router.get('/', async (req, res) => {
  const { filter = 'alltime', page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  let dateFilter = '';
  if (filter === 'weekly') dateFilter = "AND mr.updated_at >= NOW() - INTERVAL '7 days'";
  else if (filter === 'monthly') dateFilter = "AND mr.updated_at >= NOW() - INTERVAL '30 days'";

  let sql;
  if (filter === 'alltime') {
    sql = `SELECT u.id, u.username, u.avatar, u.total_points, u.free_fire_id,
           ROW_NUMBER() OVER (ORDER BY u.total_points DESC) as rank
           FROM users u WHERE u.role = 'user' AND u.is_banned = FALSE
           ORDER BY u.total_points DESC LIMIT $1 OFFSET $2`;
  } else {
    sql = `SELECT u.id, u.username, u.avatar, u.free_fire_id,
           COALESCE(SUM(mr.total_points), 0) as total_points,
           ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(mr.total_points), 0) DESC) as rank
           FROM users u
           LEFT JOIN match_results mr ON mr.user_id = u.id ${dateFilter}
           WHERE u.role = 'user' AND u.is_banned = FALSE
           GROUP BY u.id, u.username, u.avatar, u.free_fire_id
           ORDER BY total_points DESC LIMIT $1 OFFSET $2`;
  }

  const result = await query(sql, [limit, offset]);
  const total = await query("SELECT COUNT(*) FROM users WHERE role = 'user' AND is_banned = FALSE");
  res.json({ leaderboard: result.rows, total: parseInt(total.rows[0].count) });
});

// GET /api/leaderboard/top5 - for homepage
router.get('/top5', async (req, res) => {
  const result = await query(
    "SELECT id, username, avatar, total_points, free_fire_id FROM users WHERE role = 'user' AND is_banned = FALSE ORDER BY total_points DESC LIMIT 5"
  );
  res.json(result.rows);
});

export default router;
