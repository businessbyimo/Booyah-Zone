import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, free_fire_id } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  try {
    const exists = await query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Username or email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (username, email, password, free_fire_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashed, free_fire_id || null]
    );
    const user = result.rows[0];
    const { accessToken, refreshToken } = generateTokens(user);
    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);
    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ error: 'Credentials required' });
  try {
    const result = await query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [identifier]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    if (user.status === 'banned') return res.status(403).json({ error: 'Account banned' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);
    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    const { password: _, refresh_token: __, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const result = await query('SELECT * FROM users WHERE id = $1 AND refresh_token = $2', [decoded.id, refreshToken]);
    if (!result.rows.length) return res.status(403).json({ error: 'Invalid refresh token' });
    const user = result.rows[0];
    const { accessToken, refreshToken: newRefresh } = generateTokens(user);
    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefresh, user.id]);
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [req.user.id]);
  res.json({ message: 'Logged out' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await query('SELECT id, email, username FROM users WHERE email = $1', [email]);
    if (!result.rows.length) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour
    await query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [token, expiry, user.id]);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const smtpHost = (await query("SELECT value FROM site_settings WHERE key = 'smtp_host'")).rows[0]?.value;
    if (smtpHost) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt((await query("SELECT value FROM site_settings WHERE key = 'smtp_port'")).rows[0]?.value || '587'),
        auth: {
          user: (await query("SELECT value FROM site_settings WHERE key = 'smtp_user'")).rows[0]?.value,
          pass: (await query("SELECT value FROM site_settings WHERE key = 'smtp_pass'")).rows[0]?.value,
        }
      });
      await transporter.sendMail({
        from: (await query("SELECT value FROM site_settings WHERE key = 'smtp_from'")).rows[0]?.value || 'noreply@tournament.com',
        to: email,
        subject: 'Password Reset',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`
      });
    }
    res.json({ message: 'If that email exists, a reset link has been sent.', resetLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const result = await query('SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > $2', [token, Date.now()]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired reset token' });
    const hashed = await bcrypt.hash(password, 12);
    await query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [hashed, result.rows[0].id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const result = await query('SELECT id, username, email, free_fire_id, balance, total_points, role, status, avatar, must_change_password, created_at FROM users WHERE id = $1', [req.user.id]);
  res.json(result.rows[0]);
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  const { username, free_fire_id } = req.body;
  try {
    await query('UPDATE users SET username = COALESCE($1, username), free_fire_id = COALESCE($2, free_fire_id) WHERE id = $3', [username, free_fire_id, req.user.id]);
    const updated = await query('SELECT id, username, email, free_fire_id, balance, total_points, role, status, avatar FROM users WHERE id = $1', [req.user.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = $1, must_change_password = FALSE WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Change failed' });
  }
});

export default router;
