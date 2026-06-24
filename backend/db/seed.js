import bcrypt from 'bcryptjs';
import { query } from './index.js';
import dotenv from 'dotenv';
dotenv.config();

const seed = async () => {
  console.log('🌱 Seeding database...');

  // Default admin account
  const adminPass = await bcrypt.hash('Admin@123', 12);
  await query(`
    INSERT INTO users (username, email, password, role, must_change_password)
    VALUES ('admin', 'admin@example.com', $1, 'admin', TRUE)
    ON CONFLICT (username) DO NOTHING
  `, [adminPass]);
  console.log('✅ Admin account created: admin / Admin@123');

  // Default site settings
  const defaultSettings = [
    ['site_name', 'FF Arena'],
    ['site_email', 'support@ffarena.com'],
    ['bkash_number', '01XXXXXXXXX'],
    ['nagad_number', '01XXXXXXXXX'],
    ['rocket_number', '01XXXXXXXXX'],
    ['min_deposit', '50'],
    ['min_withdrawal', '100'],
    ['sms_webhook_secret', 'your-webhook-secret-here'],
  ];

  for (const [key, value] of defaultSettings) {
    await query('INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [key, value]);
  }
  console.log('✅ Default settings applied');

  // Default static pages
  const pages = [
    ['about', 'About Us', '<h2>About FF Arena</h2><p>FF Arena is the ultimate Free Fire tournament platform in Bangladesh.</p>'],
    ['terms', 'Terms & Conditions', '<h2>Terms & Conditions</h2><p>By using FF Arena, you agree to our terms.</p>'],
    ['privacy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>We take your privacy seriously.</p>'],
    ['rules', 'Tournament Rules', '<h2>Tournament Rules</h2><p>All participants must follow fair play guidelines.</p>'],
  ];
  for (const [slug, title, content] of pages) {
    await query('INSERT INTO static_pages (slug, title, content) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING', [slug, title, content]);
  }
  console.log('✅ Static pages created');

  // Sample announcement
  const admin = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (admin.rows.length) {
    await query('INSERT INTO announcements (title, content, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      ['Welcome to FF Arena!', '🎮 Welcome to FF Arena — the best Free Fire tournament platform! Register now and start winning!', admin.rows[0].id]);
  }
  console.log('✅ Sample announcement created');

  console.log('\n🎉 Seeding complete!\nAdmin login: admin / Admin@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
