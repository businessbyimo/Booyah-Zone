import bcrypt from 'bcryptjs';
import { query } from './index.js';

export const initDatabase = async () => {
  console.log('🔧 Initializing database schema...');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','moderator','admin')),
      free_fire_id VARCHAR(50),
      full_name VARCHAR(100),
      phone VARCHAR(20),
      avatar TEXT,
      balance DECIMAL(12,2) DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      matches_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      is_banned BOOLEAN DEFAULT FALSE,
      must_change_password BOOLEAN DEFAULT FALSE,
      email_verified BOOLEAN DEFAULT FALSE,
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      refresh_token TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      rules TEXT,
      map VARCHAR(50) DEFAULT 'Bermuda',
      mode VARCHAR(20) DEFAULT 'Squad',
      entry_fee DECIMAL(10,2) DEFAULT 0,
      prize_pool DECIMAL(12,2) DEFAULT 0,
      prize_1st DECIMAL(10,2),
      prize_2nd DECIMAL(10,2),
      prize_3rd DECIMAL(10,2),
      max_participants INTEGER DEFAULT 100,
      current_participants INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      room_id VARCHAR(50),
      room_password VARCHAR(50),
      banner_url TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tournament_participants (
      id SERIAL PRIMARY KEY,
      tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      team_name VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','checked_in','completed')),
      registered_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(tournament_id, user_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
      match_number INTEGER NOT NULL,
      round VARCHAR(50) DEFAULT 'Round 1',
      start_time TIMESTAMP,
      status VARCHAR(20) DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS match_results (
      id SERIAL PRIMARY KEY,
      match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
      participant_id INTEGER REFERENCES tournament_participants(id),
      user_id INTEGER REFERENCES users(id),
      placement INTEGER,
      kill_points INTEGER DEFAULT 0,
      placement_points INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(match_id, participant_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('deposit','withdrawal','fee','prize','adjustment')),
      amount DECIMAL(12,2) NOT NULL,
      method VARCHAR(20),
      phone_number VARCHAR(20),
      transaction_id VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','failed')),
      note TEXT,
      reject_reason TEXT,
      processed_by INTEGER REFERENCES users(id),
      processed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS static_pages (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(200),
      content TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      username VARCHAR(50),
      action VARCHAR(100),
      details JSONB,
      ip_address VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ All tables ready');

  const adminPass = await bcrypt.hash('Admin@123', 12);
  await query(`
    INSERT INTO users (username, email, password, role, must_change_password)
    VALUES ('admin', 'admin@booyahzone.com', $1, 'admin', FALSE)
    ON CONFLICT (username) DO NOTHING
  `, [adminPass]);

  const defaultSettings = [
    ['site_name', 'BooyahZone'],
    ['site_email', 'support@booyahzone.com'],
    ['bkash_number', '01XXXXXXXXX'],
    ['nagad_number', '01XXXXXXXXX'],
    ['rocket_number', '01XXXXXXXXX'],
    ['min_deposit', '50'],
    ['min_withdrawal', '100'],
    ['sms_webhook_secret', 'booyahzone-webhook-secret'],
  ];
  for (const [key, value] of defaultSettings) {
    await query('INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [key, value]);
  }

  const pages = [
    ['about', 'আমাদের সম্পর্কে', '<h2>BooyahZone সম্পর্কে</h2><p>BooyahZone বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম।</p>'],
    ['terms', 'শর্তাবলী', '<h2>শর্তাবলী</h2><p>BooyahZone ব্যবহার করে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।</p>'],
    ['privacy', 'গোপনীয়তা নীতি', '<h2>গোপনীয়তা নীতি</h2><p>আমরা আপনার গোপনীয়তাকে সম্মান করি।</p>'],
    ['rules', 'টুর্নামেন্ট নিয়ম', '<h2>টুর্নামেন্ট নিয়ম</h2><p>সকল অংশগ্রহণকারীকে ফেয়ার প্লে নির্দেশিকা মেনে চলতে হবে।</p>'],
  ];
  for (const [slug, title, content] of pages) {
    await query('INSERT INTO static_pages (slug, title, content) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING', [slug, title, content]);
  }

  const admin = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (admin.rows.length) {
    await query(
      'INSERT INTO announcements (title, content, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      ['BooyahZone-এ স্বাগতম!', '🎮 BooyahZone-এ স্বাগতম — বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম! এখনই রেজিস্টার করুন এবং জয়ী হন!', admin.rows[0].id]
    );
  }

  console.log('✅ Database initialization complete. Admin: admin / Admin@123');
};
