# BooyahZone — ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম

বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট ম্যানেজমেন্ট প্ল্যাটফর্ম।

## প্রজেক্ট স্ট্রাকচার

- **frontend/** — React 18 + Vite + Tailwind CSS v3 (port 5000)
- **backend/** — Express 5 + PostgreSQL + Socket.io (port 3001)

## Workflows

- **Start application** — `cd frontend && npm run dev` (port 5000, webview)
- **Backend API** — `node backend/server.js` (port 3001, console)

## Admin Login

- Username: `admin`
- Password: `Admin@123`

## Key Features

- ফ্রি ফায়ার টুর্নামেন্ট তৈরি ও ম্যানেজমেন্ট
- bKash/Nagad/Rocket পেমেন্ট (ম্যানুয়াল অনুমোদন)
- ডিজিটাল ওয়ালেট সিস্টেম
- লিডারবোর্ড ও পয়েন্ট সিস্টেম
- রিয়েল-টাইম আপডেট (Socket.io)
- AI চ্যাটবট সাপোর্ট
- পূর্ণ অ্যাডমিন প্যানেল

## Deployment (Render.com)

Backend service: `node backend/server.js`
Build command: `cd frontend && npm install && npm run build`

Environment variables needed:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT access token secret
- `REFRESH_SECRET` — JWT refresh token secret

## User Preferences

- Website language: Bangla (বাংলা)
- Site name: BooyahZone
- Logo: /public/logo-nobg.png (background removed)
- Color scheme: Dark theme with cyan (#22d3ee) and fuchsia (#d946ef)
