import express from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/payments/deposit - user submits deposit request
router.post('/deposit', authenticate, async (req, res) => {
  const { amount, method, sender_number, transaction_id } = req.body;
  if (!amount || !method || !transaction_id) {
    return res.status(400).json({ error: 'পরিমাণ, পেমেন্ট মেথড ও ট্রানজেকশন আইডি দিন' });
  }
  const settings = await query("SELECT key, value FROM site_settings WHERE key IN ('min_deposit')");
  const minDeposit = parseFloat(settings.rows.find(r => r.key === 'min_deposit')?.value || '10');
  if (parseFloat(amount) < minDeposit) return res.status(400).json({ error: `Minimum deposit is ${minDeposit} BDT` });

  // Check for duplicate transaction ID
  const dup = await query('SELECT id FROM transactions WHERE transaction_id = $1', [transaction_id]);
  if (dup.rows.length) return res.status(409).json({ error: 'Transaction ID already used' });

  try {
    const result = await query(
      "INSERT INTO transactions (user_id, type, amount, method, account_number, transaction_id, status, note) VALUES ($1, 'deposit', $2, $3, $4, $5, 'pending', $6) RETURNING *",
      [req.user.id, amount, method, sender_number, transaction_id, `Deposit via ${method}`]
    );
    await query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)", [
      req.user.id, 'Deposit Request', `Your deposit of ${amount} BDT via ${method} is under review.`
    ]);
    res.json({ message: 'Deposit request submitted', transaction: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit deposit' });
  }
});

// POST /api/payments/withdraw - user submits withdrawal request
router.post('/withdraw', authenticate, async (req, res) => {
  const { amount, method, account_number } = req.body;
  if (!amount || !method || !account_number) return res.status(400).json({ error: 'All fields required' });

  const settings = await query("SELECT key, value FROM site_settings WHERE key IN ('min_withdrawal')");
  const minWithdraw = parseFloat(settings.rows.find(r => r.key === 'min_withdrawal')?.value || '50');
  if (parseFloat(amount) < minWithdraw) return res.status(400).json({ error: `Minimum withdrawal is ${minWithdraw} BDT` });

  const userResult = await query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
  if (parseFloat(userResult.rows[0].balance) < parseFloat(amount)) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  try {
    // Reserve balance
    await query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, req.user.id]);
    const result = await query(
      "INSERT INTO transactions (user_id, type, amount, method, account_number, status, note) VALUES ($1, 'withdrawal', $2, $3, $4, 'pending', $5) RETURNING *",
      [req.user.id, amount, method, account_number, `Withdrawal to ${account_number} via ${method}`]
    );
    await query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)", [
      req.user.id, 'Withdrawal Request', `Your withdrawal of ${amount} BDT to ${account_number} is pending.`
    ]);
    res.json({ message: 'Withdrawal request submitted', transaction: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit withdrawal' });
  }
});

// GET /api/payments/transactions - user's transaction history
router.get('/transactions', authenticate, async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = ['user_id = $1'];
  let params = [req.user.id];
  let i = 2;
  if (type) { where.push(`type = $${i++}`); params.push(type); }
  if (status) { where.push(`status = $${i++}`); params.push(status); }
  const whereClause = `WHERE ${where.join(' AND ')}`;
  params.push(limit, offset);
  const result = await query(
    `SELECT * FROM transactions ${whereClause} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`,
    params
  );
  const total = await query(`SELECT COUNT(*) FROM transactions WHERE user_id = $1`, [req.user.id]);
  res.json({ transactions: result.rows, total: parseInt(total.rows[0].count) });
});

// GET /api/payments/pending-deposits - user's pending deposits
router.get('/pending-deposits', authenticate, async (req, res) => {
  const result = await query(
    "SELECT * FROM transactions WHERE user_id = $1 AND type = 'deposit' AND status = 'pending' ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json(result.rows);
});

// GET /api/payments/settings - get payment method info (bKash/Nagad numbers)
router.get('/settings', async (req, res) => {
  const result = await query("SELECT key, value FROM site_settings WHERE key IN ('bkash_number','nagad_number','rocket_number','min_deposit','min_withdrawal')");
  const settings = {};
  result.rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

export default router;
