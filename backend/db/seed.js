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
    ['site_name', 'BooyahZone'],
    ['site_email', 'support@booyahzone.com'],
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
    ['about', 'আমাদের সম্পর্কে', '<h2>BooyahZone সম্পর্কে</h2><p>BooyahZone বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম।</p>'],
    ['terms', 'শর্তাবলী', '<h2>শর্তাবলী</h2><p>BooyahZone ব্যবহার করে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।</p>'],
    ['privacy', 'গোপনীয়তা নীতি', '<h2>গোপনীয়তা নীতি</h2><p>আমরা আপনার গোপনীয়তাকে সম্মান করি।</p>'],
    ['rules', 'টুর্নামেন্ট নিয়ম', '<h2>টুর্নামেন্ট নিয়ম</h2><p>সকল অংশগ্রহণকারীকে ফেয়ার প্লে নির্দেশিকা মেনে চলতে হবে।</p>'],
  ];
  for (const [slug, title, content] of pages) {
    await query('INSERT INTO static_pages (slug, title, content) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING', [slug, title, content]);
  }
  console.log('✅ Static pages created');

  // Sample announcement
  const admin = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (admin.rows.length) {
    await query('INSERT INTO announcements (title, content, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      ['BooyahZone-এ স্বাগতম!', '🎮 BooyahZone-এ স্বাগতম — বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম! এখনই রেজিস্টার করুন এবং জয়ী হন!', admin.rows[0].id]);
  }
  console.log('✅ Sample announcement created');

  console.log('\n🎉 Seeding complete!\nAdmin login: admin / Admin@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
