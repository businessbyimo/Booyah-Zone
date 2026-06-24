import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// POST /api/sms-webhook - receives forwarded SMS from admin's phone
router.post('/', async (req, res) => {
  const { from, text, timestamp } = req.body;
  const secret = req.headers['x-webhook-secret'] || req.query.secret;

  // Validate webhook secret
  const secretSetting = await query("SELECT value FROM site_settings WHERE key = 'sms_webhook_secret'");
  const expectedSecret = secretSetting.rows[0]?.value;
  if (expectedSecret && secret !== expectedSecret) {
    return res.status(403).json({ error: 'Invalid webhook secret' });
  }

  console.log(`SMS received from ${from}: ${text}`);

  try {
    // Parse bKash SMS pattern: "TrxID: AB12345678 Tk 500.00 received from 01XXXXXXXXX"
    // Parse Nagad SMS pattern: "TrxID AB12345678 - 500.00 Tk received from 01XXXXXXXXX"
    let trxId = null;
    let amount = null;
    let senderNumber = null;

    // bKash pattern
    const bkashMatch = text.match(/TrxID[:\s]+([A-Z0-9]+).*?Tk\s+([\d.]+)\s+received.*?(\d{11})/i);
    if (bkashMatch) {
      trxId = bkashMatch[1];
      amount = parseFloat(bkashMatch[2]);
      senderNumber = bkashMatch[3];
    }

    // Nagad pattern
    if (!trxId) {
      const nagadMatch = text.match(/TrxID\s+([A-Z0-9]+).*?([\d.]+)\s*Tk.*?(\d{11})/i);
      if (nagadMatch) {
        trxId = nagadMatch[1];
        amount = parseFloat(nagadMatch[2]);
        senderNumber = nagadMatch[3];
      }
    }

    // Generic TrxID extraction
    if (!trxId) {
      const genericMatch = text.match(/([A-Z]{2,4}\d{8,12})/);
      if (genericMatch) trxId = genericMatch[1];
      const amountMatch = text.match(/Tk\s*([\d,]+\.?\d*)/i);
      if (amountMatch) amount = parseFloat(amountMatch[1].replace(',', ''));
      const phoneMatch = text.match(/(\+?880\d{10}|\d{11})/);
      if (phoneMatch) senderNumber = phoneMatch[1];
    }

    if (!trxId || !amount) {
      return res.json({ message: 'Could not parse SMS', parsed: { trxId, amount, senderNumber } });
    }

    // Find matching pending deposit
    const pending = await query(
      "SELECT * FROM transactions WHERE type = 'deposit' AND status = 'pending' AND (transaction_id = $1 OR account_number = $2) AND ABS(amount - $3) < 1",
      [trxId, senderNumber, amount]
    );

    if (pending.rows.length) {
      const txn = pending.rows[0];
      await query("UPDATE transactions SET status = 'approved', transaction_id = $1, updated_at = NOW() WHERE id = $2", [trxId, txn.id]);
      await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [txn.amount, txn.user_id]);
      await query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)", [
        txn.user_id, 'Deposit Approved', `Your deposit of ${txn.amount} BDT has been approved automatically.`
      ]);
      console.log(`Auto-approved deposit ${txn.id} for user ${txn.user_id}`);
    }

    res.json({ message: 'SMS processed', parsed: { trxId, amount, senderNumber }, autoApproved: pending.rows.length > 0 });
  } catch (err) {
    console.error('SMS webhook error:', err);
    res.status(500).json({ error: 'Processing failed' });
  }
});

export default router;
