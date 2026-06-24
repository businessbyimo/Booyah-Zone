import express from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tournaments - list with filters and pagination
router.get('/', async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];
  let i = 1;

  if (status) { where.push(`t.status = $${i++}`); params.push(status); }
  if (search) { where.push(`t.name ILIKE $${i++}`); params.push(`%${search}%`); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await query(`SELECT COUNT(*) FROM tournaments t ${whereClause}`, params);
  params.push(limit, offset);
  const result = await query(
    `SELECT t.*, u.username as created_by_name FROM tournaments t LEFT JOIN users u ON t.created_by = u.id ${whereClause} ORDER BY t.created_at DESC LIMIT $${i++} OFFSET $${i++}`,
    params
  );
  res.json({ tournaments: result.rows, total: parseInt(total.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/tournaments/upcoming - for homepage carousel
router.get('/upcoming', async (req, res) => {
  const result = await query(`SELECT * FROM tournaments WHERE status = 'upcoming' ORDER BY start_time ASC LIMIT 6`);
  res.json(result.rows);
});

// GET /api/tournaments/:id
router.get('/:id', async (req, res) => {
  const result = await query(`
    SELECT t.*, u.username as created_by_name
    FROM tournaments t LEFT JOIN users u ON t.created_by = u.id
    WHERE t.id = $1`, [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Tournament not found' });

  const participants = await query(`
    SELECT p.*, u.username, u.avatar, u.free_fire_id
    FROM participants p JOIN users u ON p.user_id = u.id
    WHERE p.tournament_id = $1 ORDER BY p.registered_at ASC`, [req.params.id]);

  const matches = await query(`SELECT * FROM matches WHERE tournament_id = $1 ORDER BY round, match_number`, [req.params.id]);

  res.json({ ...result.rows[0], participants: participants.rows, matches: matches.rows });
});

// POST /api/tournaments/:id/join
router.post('/:id/join', authenticate, async (req, res) => {
  const { team_name } = req.body;
  const tournamentId = req.params.id;
  const userId = req.user.id;

  try {
    const t = await query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
    if (!t.rows.length) return res.status(404).json({ error: 'Tournament not found' });
    const tournament = t.rows[0];

    if (tournament.status !== 'upcoming') return res.status(400).json({ error: 'Tournament is not accepting registrations' });
    if (tournament.current_participants >= tournament.max_participants) return res.status(400).json({ error: 'Tournament is full' });

    const existing = await query('SELECT id FROM participants WHERE tournament_id = $1 AND user_id = $2', [tournamentId, userId]);
    if (existing.rows.length) return res.status(409).json({ error: 'Already registered' });

    // Check balance for entry fee
    if (parseFloat(tournament.entry_fee) > 0) {
      const userBalance = await query('SELECT balance FROM users WHERE id = $1', [userId]);
      if (parseFloat(userBalance.rows[0].balance) < parseFloat(tournament.entry_fee)) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      await query('UPDATE users SET balance = balance - $1 WHERE id = $2', [tournament.entry_fee, userId]);
      await query(
        "INSERT INTO transactions (user_id, type, amount, status, note) VALUES ($1, 'fee', $2, 'approved', $3)",
        [userId, tournament.entry_fee, `Entry fee for ${tournament.name}`]
      );
    }

    await query('INSERT INTO participants (tournament_id, user_id, team_name) VALUES ($1, $2, $3)', [tournamentId, userId, team_name || null]);
    await query('UPDATE tournaments SET current_participants = current_participants + 1 WHERE id = $1', [tournamentId]);

    // Notify user
    await query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)", [
      userId, 'Tournament Registration', `You have successfully registered for ${tournament.name}. Awaiting approval.`
    ]);

    res.json({ message: 'Successfully joined tournament' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

// GET /api/tournaments/:id/results
router.get('/:id/results', async (req, res) => {
  const result = await query(`
    SELECT mr.*, u.username, u.avatar, m.match_number, m.round
    FROM match_results mr
    JOIN users u ON mr.user_id = u.id
    JOIN matches m ON mr.match_id = m.id
    WHERE m.tournament_id = $1
    ORDER BY m.round, m.match_number, mr.placement`, [req.params.id]);
  res.json(result.rows);
});

export default router;
