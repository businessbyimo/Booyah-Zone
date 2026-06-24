import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate, requireAdmin);

// =================== DASHBOARD ===================
// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  const [users, tournaments, todayRevenue, pendingDeposits, pendingWithdrawals, recentActivity, weeklyRevenue, weeklyUsers] = await Promise.all([
    query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
    query("SELECT COUNT(*) FROM tournaments"),
    query("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='deposit' AND status='approved' AND created_at >= CURRENT_DATE"),
    query("SELECT COUNT(*) FROM transactions WHERE type='deposit' AND status='pending'"),
    query("SELECT COUNT(*) FROM transactions WHERE type='withdrawal' AND status='pending'"),
    query(`SELECT 'User registered' as action, username as detail, created_at FROM users ORDER BY created_at DESC LIMIT 5
           UNION ALL
           SELECT 'Deposit submitted', CONCAT(amount::text,' BDT'), created_at FROM transactions WHERE type='deposit' ORDER BY created_at DESC LIMIT 5
           ORDER BY created_at DESC LIMIT 10`),
    query(`SELECT DATE(created_at) as date, COALESCE(SUM(amount),0) as revenue FROM transactions WHERE type='deposit' AND status='approved' AND created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date`),
    query(`SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date`),
  ]);

  res.json({
    stats: {
      totalUsers: parseInt(users.rows[0].count),
      totalTournaments: parseInt(tournaments.rows[0].count),
      todayRevenue: parseFloat(todayRevenue.rows[0].total),
      pendingDeposits: parseInt(pendingDeposits.rows[0].count),
      pendingWithdrawals: parseInt(pendingWithdrawals.rows[0].count),
    },
    recentActivity: recentActivity.rows,
    weeklyRevenue: weeklyRevenue.rows,
    weeklyUsers: weeklyUsers.rows,
  });
});

// =================== USERS ===================
router.get('/users', async (req, res) => {
  const { search, role, status, page = 1, limit = 20 } = req.query;
  let where = [];
  let params = [];
  let i = 1;
  if (search) { where.push(`(username ILIKE $${i} OR email ILIKE $${i})`); params.push(`%${search}%`); i++; }
  if (role) { where.push(`role = $${i++}`); params.push(role); }
  if (status === 'banned') { where.push(`is_banned = TRUE`); }
  else if (status === 'active') { where.push(`is_banned = FALSE`); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
  const offset = (page - 1) * limit;
  params.push(limit, offset);
  const result = await query(`SELECT id, username, email, role, is_banned, balance, total_points, avatar, created_at, free_fire_id FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`, params);
  res.json({ users: result.rows, total: parseInt(total.rows[0].count) });
});

router.get('/users/:id', async (req, res) => {
  const user = await query('SELECT id, username, email, role, is_banned, balance, total_points, avatar, created_at, free_fire_id FROM users WHERE id = $1', [req.params.id]);
  const transactions = await query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [req.params.id]);
  const participations = await query(`SELECT p.*, t.name as tournament_name FROM tournament_participants p JOIN tournaments t ON p.tournament_id = t.id WHERE p.user_id = $1 ORDER BY p.registered_at DESC`, [req.params.id]);
  res.json({ user: user.rows[0], transactions: transactions.rows, participations: participations.rows });
});

router.put('/users/:id', requireSuperAdmin, async (req, res) => {
  const { username, email, role, free_fire_id } = req.body;
  await query('UPDATE users SET username=COALESCE($1,username), email=COALESCE($2,email), role=COALESCE($3,role), free_fire_id=COALESCE($4,free_fire_id) WHERE id=$5',
    [username, email, role, free_fire_id, req.params.id]);
  res.json({ message: 'User updated' });
});

router.put('/users/:id/ban', async (req, res) => {
  await query("UPDATE users SET is_banned = TRUE WHERE id = $1", [req.params.id]);
  res.json({ message: 'User banned' });
});

router.put('/users/:id/unban', async (req, res) => {
  await query("UPDATE users SET is_banned = FALSE WHERE id = $1", [req.params.id]);
  res.json({ message: 'User unbanned' });
});

router.delete('/users/:id', requireSuperAdmin, async (req, res) => {
  await query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ message: 'User deleted' });
});

router.post('/users/:id/adjust-balance', async (req, res) => {
  const { amount, note } = req.body;
  await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, req.params.id]);
  await query("INSERT INTO transactions (user_id, type, amount, status, note) VALUES ($1, 'prize', $2, 'approved', $3)",
    [req.params.id, Math.abs(amount), note || 'Manual balance adjustment']);
  res.json({ message: 'Balance adjusted' });
});

// =================== TOURNAMENTS ===================
router.get('/tournaments', async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  let where = status ? `WHERE status = $1` : '';
  const params = status ? [status, limit, (page - 1) * limit] : [limit, (page - 1) * limit];
  const result = await query(`SELECT t.*, u.username as created_by_name FROM tournaments t LEFT JOIN users u ON t.created_by = u.id ${where} ORDER BY created_at DESC LIMIT $${status ? 2 : 1} OFFSET $${status ? 3 : 2}`, params);
  const total = await query(`SELECT COUNT(*) FROM tournaments ${where}`, status ? [status] : []);
  res.json({ tournaments: result.rows, total: parseInt(total.rows[0].count) });
});

router.post('/tournaments', async (req, res) => {
  const { name, description, rules, map, entry_fee, prize_pool, prize_1st, prize_2nd, prize_3rd, max_participants, start_time, end_time } = req.body;
  const result = await query(
    'INSERT INTO tournaments (name, description, rules, map, entry_fee, prize_pool, prize_1st, prize_2nd, prize_3rd, max_participants, start_time, end_time, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
    [name, description, rules, map, entry_fee || 0, prize_pool, prize_1st || 0, prize_2nd || 0, prize_3rd || 0, max_participants, start_time, end_time || null, req.user.id]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/tournaments/:id', async (req, res) => {
  const { name, description, rules, map, entry_fee, prize_pool, prize_1st, prize_2nd, prize_3rd, max_participants, start_time, end_time, status } = req.body;
  await query('UPDATE tournaments SET name=COALESCE($1,name), description=COALESCE($2,description), rules=COALESCE($3,rules), map=COALESCE($4,map), entry_fee=COALESCE($5,entry_fee), prize_pool=COALESCE($6,prize_pool), prize_1st=COALESCE($7,prize_1st), prize_2nd=COALESCE($8,prize_2nd), prize_3rd=COALESCE($9,prize_3rd), max_participants=COALESCE($10,max_participants), start_time=COALESCE($11,start_time), end_time=COALESCE($12,end_time), status=COALESCE($13,status) WHERE id=$14',
    [name, description, rules, map, entry_fee, prize_pool, prize_1st, prize_2nd, prize_3rd, max_participants, start_time, end_time, status, req.params.id]);
  res.json({ message: 'Tournament updated' });
});

router.delete('/tournaments/:id', requireSuperAdmin, async (req, res) => {
  await query('DELETE FROM tournaments WHERE id = $1', [req.params.id]);
  res.json({ message: 'Tournament deleted' });
});

router.post('/tournaments/:id/generate-bracket', async (req, res) => {
  const tid = req.params.id;
  const participants = await query("SELECT user_id FROM tournament_participants WHERE tournament_id = $1 AND status = 'approved'", [tid]);
  const count = participants.rows.length;
  if (count < 2) return res.status(400).json({ error: 'Need at least 2 approved participants' });

  // Simple single elimination bracket
  const rounds = Math.ceil(Math.log2(count));
  let matchNum = 1;
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    for (let m = 0; m < matchesInRound; m++) {
      await query('INSERT INTO matches (tournament_id, match_number, round) VALUES ($1, $2, $3)', [tid, matchNum++, `Round ${round}`]);
    }
  }
  res.json({ message: `Bracket generated with ${matchNum - 1} matches`, rounds });
});

// =================== PARTICIPANTS ===================
router.get('/participants', async (req, res) => {
  const { tournament_id, status } = req.query;
  let where = [];
  let params = [];
  let i = 1;
  if (tournament_id) { where.push(`p.tournament_id = $${i++}`); params.push(tournament_id); }
  if (status) { where.push(`p.status = $${i++}`); params.push(status); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const result = await query(`SELECT p.*, u.username, u.email, u.avatar, u.free_fire_id, t.name as tournament_name FROM tournament_participants p JOIN users u ON p.user_id = u.id JOIN tournaments t ON p.tournament_id = t.id ${whereClause} ORDER BY p.registered_at DESC`, params);
  res.json(result.rows);
});

router.put('/participants/:id/approve', async (req, res) => {
  await query("UPDATE tournament_participants SET status = 'approved' WHERE id = $1", [req.params.id]);
  const p = await query('SELECT * FROM tournament_participants WHERE id = $1', [req.params.id]);
  const t = await query('SELECT name FROM tournaments WHERE id = $1', [p.rows[0].tournament_id]);
  await query("INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)", [p.rows[0].user_id, 'Registration Approved', `Your registration for ${t.rows[0].name} has been approved!`]);
  res.json({ message: 'Participant approved' });
});

router.put('/participants/:id/reject', async (req, res) => {
  const p = await query('SELECT * FROM tournament_participants WHERE id = $1', [req.params.id]);
  const participant = p.rows[0];
  const t = await query('SELECT * FROM tournaments WHERE id = $1', [participant.tournament_id]);
  // Refund entry fee if any
  if (parseFloat(t.rows[0].entry_fee) > 0) {
    await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [t.rows[0].entry_fee, participant.user_id]);
  }
  await query("UPDATE tournament_participants SET status = 'rejected' WHERE id = $1", [req.params.id]);
  await query('UPDATE tournaments SET current_participants = current_participants - 1 WHERE id = $1', [participant.tournament_id]);
  await query("INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)", [participant.user_id, 'Registration Rejected', `Your registration for ${t.rows[0].name} was rejected.`]);
  res.json({ message: 'Participant rejected' });
});

router.put('/participants/:id/checkin', async (req, res) => {
  await query("UPDATE tournament_participants SET status = 'checked_in' WHERE id = $1", [req.params.id]);
  res.json({ message: 'Player checked in' });
});

// =================== MATCHES ===================
router.get('/matches', async (req, res) => {
  const { tournament_id } = req.query;
  const result = await query(`SELECT m.*, t.name as tournament_name FROM matches m JOIN tournaments t ON m.tournament_id = t.id ${tournament_id ? 'WHERE m.tournament_id = $1' : ''} ORDER BY m.round, m.match_number`, tournament_id ? [tournament_id] : []);
  res.json(result.rows);
});

router.post('/matches', async (req, res) => {
  const { tournament_id, match_number, round, start_time } = req.body;
  const result = await query('INSERT INTO matches (tournament_id, match_number, round, start_time) VALUES ($1,$2,$3,$4) RETURNING *', [tournament_id, match_number, round, start_time]);
  res.status(201).json(result.rows[0]);
});

router.put('/matches/:id/status', async (req, res) => {
  const { status } = req.body;
  await query('UPDATE matches SET status = $1 WHERE id = $2', [status, req.params.id]);
  res.json({ message: 'Match status updated' });
});

router.post('/matches/:id/results', async (req, res) => {
  const matchId = req.params.id;
  const { results } = req.body; // [{user_id, placement, kill_points}]

  try {
    // Clear existing results
    await query('DELETE FROM match_results WHERE match_id = $1', [matchId]);

    const match = await query('SELECT tournament_id FROM matches WHERE id = $1', [matchId]);
    const tournamentId = match.rows[0].tournament_id;
    const tournament = await query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
    const t = tournament.rows[0];

    // Placement points mapping
    const placementPoints = { 1: 10, 2: 7, 3: 5, 4: 4, 5: 3, 6: 2 };

    for (const r of results) {
      const pp = placementPoints[r.placement] || 1;
      const totalPoints = pp + parseInt(r.kill_points || 0);
      const isWinner = r.placement === 1;

      await query('INSERT INTO match_results (match_id, user_id, placement, kill_points, total_points, is_winner) VALUES ($1,$2,$3,$4,$5,$6)',
        [matchId, r.user_id, r.placement, r.kill_points || 0, totalPoints, isWinner]);

      // Update user total points
      await query('UPDATE users SET total_points = total_points + $1 WHERE id = $2', [totalPoints, r.user_id]);

      // Prize distribution based on placement
      let prize = 0;
      if (r.placement === 1 && parseFloat(t.prize_1st) > 0) prize = parseFloat(t.prize_1st);
      else if (r.placement === 2 && parseFloat(t.prize_2nd) > 0) prize = parseFloat(t.prize_2nd);
      else if (r.placement === 3 && parseFloat(t.prize_3rd) > 0) prize = parseFloat(t.prize_3rd);

      if (prize > 0) {
        await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [prize, r.user_id]);
        await query("INSERT INTO transactions (user_id, type, amount, status, note) VALUES ($1,'prize',$2,'approved',$3)",
          [r.user_id, prize, `Prize for placement ${r.placement} in ${t.name}`]);
        await query("INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)",
          [r.user_id, '🏆 Prize Awarded', `Congratulations! You won ${prize} BDT for placement ${r.placement} in ${t.name}!`]);
      }
    }

    await query("UPDATE matches SET status = 'completed', end_time = NOW() WHERE id = $1", [matchId]);
    res.json({ message: 'Results saved and prizes distributed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save results' });
  }
});

router.get('/matches/:id/results', async (req, res) => {
  const result = await query(`SELECT mr.*, u.username, u.avatar FROM match_results mr JOIN users u ON mr.user_id = u.id WHERE mr.match_id = $1 ORDER BY mr.placement`, [req.params.id]);
  res.json(result.rows);
});

// =================== PAYMENTS ===================
router.get('/payments', async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  let where = [];
  let params = [];
  let i = 1;
  if (type) { where.push(`t.type = $${i++}`); params.push(type); }
  if (status) { where.push(`t.status = $${i++}`); params.push(status); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  params.push(limit, offset);
  const result = await query(`SELECT t.*, u.username, u.email FROM transactions t JOIN users u ON t.user_id = u.id ${whereClause} ORDER BY t.created_at DESC LIMIT $${i++} OFFSET $${i++}`, params);
  const total = await query(`SELECT COUNT(*) FROM transactions t ${whereClause}`, params.slice(0, -2));
  res.json({ transactions: result.rows, total: parseInt(total.rows[0].count) });
});

router.put('/payments/:id/approve', async (req, res) => {
  const txn = await query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
  if (!txn.rows.length) return res.status(404).json({ error: 'Transaction not found' });
  const t = txn.rows[0];
  if (t.status !== 'pending') return res.status(400).json({ error: 'Transaction already processed' });

  await query("UPDATE transactions SET status = 'approved', updated_at = NOW() WHERE id = $1", [req.params.id]);
  if (t.type === 'deposit') {
    await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [t.amount, t.user_id]);
  }
  await query("INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)",
    [t.user_id, `${t.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Approved`, `Your ${t.type} of ${t.amount} BDT has been approved.`]);
  res.json({ message: 'Transaction approved' });
});

router.put('/payments/:id/reject', async (req, res) => {
  const { reason } = req.body;
  const txn = await query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
  const t = txn.rows[0];
  if (t.status !== 'pending') return res.status(400).json({ error: 'Transaction already processed' });

  await query("UPDATE transactions SET status = 'rejected', note = $1, updated_at = NOW() WHERE id = $2", [reason || t.note, req.params.id]);
  // Refund balance for withdrawal rejections
  if (t.type === 'withdrawal') {
    await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [t.amount, t.user_id]);
  }
  await query("INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)",
    [t.user_id, `${t.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Rejected`, `Your ${t.type} of ${t.amount} BDT was rejected. ${reason || ''}`]);
  res.json({ message: 'Transaction rejected' });
});

// =================== CONTENT ===================
router.get('/announcements', async (req, res) => {
  const result = await query('SELECT * FROM announcements ORDER BY created_at DESC');
  res.json(result.rows);
});

router.post('/announcements', async (req, res) => {
  const { title, content } = req.body;
  const result = await query('INSERT INTO announcements (title, content, created_by) VALUES ($1,$2,$3) RETURNING *', [title, content, req.user.id]);
  res.status(201).json(result.rows[0]);
});

router.put('/announcements/:id', async (req, res) => {
  const { title, content, is_active } = req.body;
  await query('UPDATE announcements SET title=COALESCE($1,title), content=COALESCE($2,content), is_active=COALESCE($3,is_active), updated_at=NOW() WHERE id=$4', [title, content, is_active, req.params.id]);
  res.json({ message: 'Announcement updated' });
});

router.delete('/announcements/:id', async (req, res) => {
  await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
  res.json({ message: 'Announcement deleted' });
});

router.get('/pages', async (req, res) => {
  const result = await query('SELECT * FROM static_pages ORDER BY slug');
  res.json(result.rows);
});

router.put('/pages/:slug', async (req, res) => {
  const { title, content } = req.body;
  await query('INSERT INTO static_pages (slug, title, content) VALUES ($1,$2,$3) ON CONFLICT (slug) DO UPDATE SET title=$2, content=$3, updated_at=NOW()', [req.params.slug, title, content]);
  res.json({ message: 'Page updated' });
});

// =================== SETTINGS ===================
router.get('/settings', async (req, res) => {
  const result = await query('SELECT key, value FROM site_settings');
  const settings = {};
  result.rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

router.put('/settings', requireSuperAdmin, async (req, res) => {
  const { settings } = req.body; // { key: value, ... }
  for (const [key, value] of Object.entries(settings)) {
    await query('INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()', [key, value]);
  }
  res.json({ message: 'Settings updated' });
});

router.post('/moderators', requireSuperAdmin, async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 12);
  const result = await query("INSERT INTO users (username, email, password, role) VALUES ($1,$2,$3,'moderator') RETURNING id, username, email, role", [username, email, hashed]);
  res.status(201).json(result.rows[0]);
});

export default router;
