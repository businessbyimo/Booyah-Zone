import { query } from './index.js';
import dotenv from 'dotenv';
dotenv.config();

const createSchema = async () => {
  console.log('🔧 Creating database schema...');

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
  console.log('✅ users table');

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
  console.log('✅ tournaments table');

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
  console.log('✅ tournament_participants table');

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
  console.log('✅ matches table');

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
  console.log('✅ match_results table');

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
  console.log('✅ transactions table');

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
  console.log('✅ notifications table');

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
  console.log('✅ announcements table');

  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ site_settings table');

  await query(`
    CREATE TABLE IF NOT EXISTS static_pages (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(200),
      content TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ static_pages table');

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
  console.log('✅ system_logs table');

  console.log('\n🎉 Schema creation complete!');
  process.exit(0);
};

createSchema().catch(err => { console.error('❌ Schema error:', err.message); process.exit(1); });
