import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition.jsx';

const SECTIONS = [
  { id: 'overview', label: '📋 ওভারভিউ' },
  { id: 'github', label: '🐙 GitHub' },
  { id: 'render-db', label: '🗄️ ডেটাবেস' },
  { id: 'render-deploy', label: '🚀 Render Deploy' },
  { id: 'env-vars', label: '🔑 Environment Variables' },
  { id: 'db-init', label: '🛠️ DB Initialize' },
  { id: 'smtp-email', label: '📧 Email/SMTP' },
  { id: 'sms', label: '📱 SMS ফরওয়ার্ডিং' },
  { id: 'admin', label: '👑 Admin Panel' },
  { id: 'custom-domain', label: '🌐 Custom Domain' },
  { id: 'troubleshoot', label: '🔧 Troubleshooting' },
  { id: 'api', label: '📡 API Endpoints' },
];

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>
);

const SectionTitle = ({ id, emoji, title, subtitle }) => (
  <div id={id} className="mb-5">
    <h2 className="text-lg font-bold text-gray-900 font-orbitron">{emoji} {title}</h2>
    {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
  </div>
);

const Step = ({ num, title, children }) => (
  <div className="flex gap-3 mb-5">
    <div
      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
      style={{ background: 'linear-gradient(135deg,#FF6B00,#FF8C42)' }}
    >
      {num}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-gray-800 text-sm mb-1.5">{title}</h3>
      <div className="text-gray-600 text-sm leading-relaxed space-y-1.5">{children}</div>
    </div>
  </div>
);

const Code = ({ children }) => (
  <pre className="bg-gray-900 text-green-400 rounded-xl p-3 text-xs font-mono whitespace-pre-wrap mt-2 overflow-x-auto leading-relaxed">
    {children}
  </pre>
);

const Cmd = ({ children }) => (
  <code className="bg-gray-100 text-orange-600 px-2 py-0.5 rounded-lg text-xs font-mono">{children}</code>
);

const EnvRow = ({ name, value, desc }) => (
  <div className="py-2 border-b border-gray-50 last:border-0">
    <div className="flex items-start gap-2 flex-wrap">
      <code className="text-purple-600 text-xs font-mono font-bold whitespace-nowrap">{name}</code>
      {value && <code className="text-orange-500 text-xs font-mono whitespace-nowrap">{value}</code>}
    </div>
    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
  </div>
);

const Alert = ({ type = 'info', children }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warn: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
  };
  const icons = { info: 'ℹ️', warn: '⚠️', success: '✅', danger: '🚨' };
  return (
    <div className={`border rounded-xl p-3 text-xs leading-relaxed ${styles[type]} mt-2`}>
      {icons[type]} {children}
    </div>
  );
};

export default function DeployGuide() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 pt-4 pb-6 max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 font-orbitron">📚 BooyahZone ডকুমেন্টেশন</h1>
          <p className="text-gray-500 text-sm mt-1">সম্পূর্ণ A–Z গাইডলাইন — ডিপ্লয়, SMS, Email, সব কিছু</p>
        </div>

        {/* সেকশন নেভিগেশন */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
              style={activeSection === s.id
                ? { background: 'linear-gradient(135deg,#FF6B00,#FF8C42)', color: '#fff' }
                : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="space-y-5">

          {/* ওভারভিউ */}
          <Card>
            <SectionTitle id="overview" emoji="📋" title="ওভারভিউ" subtitle="BooyahZone কী কী দিয়ে তৈরি" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Frontend', val: 'React 18 + Vite + Tailwind CSS v3' },
                { label: 'Backend', val: 'Express 5 + Node.js 20' },
                { label: 'Database', val: 'PostgreSQL' },
                { label: 'Realtime', val: 'Socket.io' },
                { label: 'Auth', val: 'JWT (Access + Refresh Token)' },
                { label: 'Payment', val: 'bKash, Nagad, Rocket (manual)' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-xs text-gray-700 font-medium mt-0.5">{val}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-green-400 text-xs font-mono font-bold mb-2">Admin Login (Default)</p>
              <p className="text-gray-300 text-xs font-mono">Username: <span className="text-orange-400">admin</span></p>
              <p className="text-gray-300 text-xs font-mono">Password: <span className="text-orange-400">Admin@123</span></p>
              <p className="text-gray-300 text-xs font-mono">URL: <span className="text-orange-400">/admin</span></p>
            </div>
            <Alert type="warn">প্রথম লগইনের পরেই পাসওয়ার্ড পরিবর্তন করো! Admin → Settings → Change Password</Alert>
          </Card>

          {/* GitHub */}
          <Card>
            <SectionTitle id="github" emoji="🐙" title="GitHub-এ কোড পুশ করো" />
            <Step num="1" title="GitHub Repository তৈরি করো">
              <p>github.com → New Repository → নাম দাও (যেমন: booyahzone) → Create</p>
            </Step>
            <Step num="2" title="Replit থেকে GitHub-এ পুশ করো">
              <p>Replit-এর Shell ট্যাবে যাও এবং নিচের কমান্ড চালাও:</p>
              <Code>{`git init
git add .
git commit -m "Initial commit — BooyahZone"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/booyahzone.git
git push -u origin main`}</Code>
              <Alert type="info">YOUR_USERNAME-এর জায়গায় তোমার GitHub username দাও</Alert>
            </Step>
            <Step num="3" title="Personal Access Token (প্রয়োজন হলে)">
              <p>GitHub → Settings → Developer Settings → Personal Access Tokens → Generate New Token (classic)</p>
              <p>Scopes: <Cmd>repo</Cmd> চেক করো। এই টোকেন দিয়ে push করো।</p>
            </Step>
          </Card>

          {/* PostgreSQL */}
          <Card>
            <SectionTitle id="render-db" emoji="🗄️" title="Render.com-এ PostgreSQL তৈরি" />
            <Step num="1" title="Render-এ লগইন করো">
              <p><strong>render.com</strong> → Sign up (GitHub দিয়ে সহজ) → Dashboard</p>
            </Step>
            <Step num="2" title="নতুন PostgreSQL তৈরি করো">
              <p>New → PostgreSQL → এভাবে পূরণ করো:</p>
              <Code>{`Name: booyahzone-db
Database: booyahzone
User: booyahzone_user
Region: Singapore (সবচেয়ে কাছে বাংলাদেশের)
Plan: Free`}</Code>
            </Step>
            <Step num="3" title="Database URL কপি করো">
              <p>Database তৈরির পরে → Info ট্যাব → <strong>Internal Database URL</strong> কপি করো</p>
              <p>এটা দেখতে এরকম হবে:</p>
              <Code>postgresql://booyahzone_user:PASSWORD@dpg-xxxxx.singapore-postgres.render.com/booyahzone</Code>
              <Alert type="warn">Internal URL ব্যবহার করো (External নয়) — একই Render account-এ থাকলে Internal বেশি দ্রুত ও নিরাপদ</Alert>
            </Step>
          </Card>

          {/* Render Deploy */}
          <Card>
            <SectionTitle id="render-deploy" emoji="🚀" title="Render Web Service Deploy" />
            <Step num="1" title="নতুন Web Service তৈরি করো">
              <p>Render Dashboard → New → Web Service → Connect GitHub Repository</p>
            </Step>
            <Step num="2" title="Build Settings পূরণ করো">
              <Code>{`Name: booyahzone
Environment: Node
Region: Singapore
Branch: main

Build Command:
cd frontend && npm install && npm run build && cd ../backend && npm install

Start Command:
node backend/server.js`}</Code>
            </Step>
            <Step num="3" title="Auto-Deploy চালু করো">
              <p>Settings → Auto-Deploy → Yes (GitHub-এ push দিলে automatically deploy হবে)</p>
            </Step>
            <Step num="4" title="Root Directory">
              <p>Root Directory খালি রাখো (ফাঁকা) — project root থেকে build হবে</p>
            </Step>
            <Alert type="info">Free tier-এ 15 মিনিট inactive থাকলে server ঘুমিয়ে পড়ে। প্রথম request-এ 30-60 সেকেন্ড লাগবে। Paid plan-এ সবসময় চালু থাকে।</Alert>
          </Card>

          {/* Environment Variables */}
          <Card>
            <SectionTitle id="env-vars" emoji="🔑" title="Environment Variables" subtitle="Render → Service → Environment ট্যাবে যোগ করো" />
            <div className="bg-gray-50 rounded-xl p-4 space-y-1 mb-4">
              <EnvRow name="DATABASE_URL" desc="Render PostgreSQL Internal URL (Step ৩ থেকে কপি করা)" />
              <EnvRow name="JWT_SECRET" desc="৬৪-character random string — নিচের command দিয়ে generate করো" />
              <EnvRow name="REFRESH_SECRET" desc="আরেকটা ৬৪-character random string (JWT_SECRET থেকে আলাদা)" />
              <EnvRow name="NODE_ENV" value="production" desc="Production mode চালু করে" />
              <EnvRow name="PORT" value="10000" desc="Render-এর default port" />
              <EnvRow name="FRONTEND_URL" desc="https://booyahzone.onrender.com (তোমার app URL)" />
              <EnvRow name="SMTP_HOST" desc="Email server host — নিচে বিস্তারিত" />
              <EnvRow name="SMTP_PORT" value="587" desc="TLS port (Gmail/Outlook উভয়ের জন্য)" />
              <EnvRow name="SMTP_USER" desc="তোমার email address" />
              <EnvRow name="SMTP_PASS" desc="Email App Password (সাধারণ পাসওয়ার্ড নয়)" />
              <EnvRow name="SMS_WEBHOOK_SECRET" desc="SMS forwarding-এর জন্য secret key (যেকোনো random string)" />
            </div>
            <p className="text-gray-600 text-xs font-semibold mb-1">JWT Secret Generate করো (Replit Shell-এ):</p>
            <Code>{`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`}</Code>
            <Alert type="warn">দুটো আলাদা command চালাও — JWT_SECRET ও REFRESH_SECRET-এর জন্য আলাদা আলাদা value নাও</Alert>
          </Card>

          {/* DB Initialize */}
          <Card>
            <SectionTitle id="db-init" emoji="🛠️" title="Database Initialize করো" subtitle="প্রথম deploy-এর পরে একবার করতে হবে" />
            <Step num="1" title="Render Shell-এ যাও">
              <p>Render Dashboard → তোমার Service → Shell ট্যাব</p>
            </Step>
            <Step num="2" title="Schema ও Seed চালাও">
              <Code>{`# Database tables তৈরি করো
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = require('fs').readFileSync('./backend/db/schema.sql', 'utf8');
pool.query(schema).then(() => { console.log('Schema created!'); pool.end(); }).catch(e => { console.error(e); pool.end(); });
"`}</Code>
              <p className="mt-2">অথবা seed.js চালাও:</p>
              <Code>node backend/db/seed.js</Code>
            </Step>
            <Step num="3" title="Admin Account তৈরি হয়ে গেছে">
              <p>Seed চালালে এই account তৈরি হয়:</p>
              <Code>{`Username: admin
Password: Admin@123
Role: admin`}</Code>
            </Step>
            <Alert type="success">Database একবার initialize হলে আর করতে হবে না। পরবর্তী deploy-এ automatically চলে।</Alert>
          </Card>

          {/* SMTP Email */}
          <Card>
            <SectionTitle id="smtp-email" emoji="📧" title="Email/SMTP Setup" subtitle="ইউজারদের email notification পাঠাতে" />

            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-3">🟡 Gmail দিয়ে (সবচেয়ে সহজ)</p>
              <Step num="1" title="Gmail 2-Step Verification চালু করো">
                <p>myaccount.google.com → Security → 2-Step Verification → Turn On</p>
              </Step>
              <Step num="2" title="App Password তৈরি করো">
                <p>myaccount.google.com → Security → App Passwords → Select app: Mail → Generate</p>
                <p>একটি 16-character password পাবে — এটাই SMTP_PASS</p>
              </Step>
              <Step num="3" title="Render-এ Environment Variables সেট করো">
                <Code>{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  (App Password)`}</Code>
              </Step>
            </div>

            <hr className="border-gray-100 my-4" />

            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-3">🔵 Outlook/Hotmail দিয়ে</p>
              <Code>{`SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-outlook-password`}</Code>
            </div>

            <hr className="border-gray-100 my-4" />

            <div>
              <p className="text-gray-700 text-sm font-bold mb-3">🟢 Brevo (SendinBlue) দিয়ে — বেশি email পাঠাতে</p>
              <Step num="1" title="Brevo-তে Account খোলো">
                <p>brevo.com → Sign Up (Free: ৩০০ email/day)</p>
              </Step>
              <Step num="2" title="SMTP Credentials নাও">
                <p>Brevo → Settings → SMTP & API → SMTP tab</p>
                <Code>{`SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email@example.com
SMTP_PASS=your-brevo-api-key (SMTP Password)`}</Code>
              </Step>
            </div>

            <Alert type="info">Email কাজ করছে কিনা test করতে: Admin Panel → Settings → Test Email পাঠাও (যদি feature থাকে), অথবা registration করে দেখো welcome email আসছে কিনা</Alert>
          </Card>

          {/* SMS Forwarding */}
          <Card>
            <SectionTitle id="sms" emoji="📱" title="SMS ফরওয়ার্ডিং Setup" subtitle="bKash/Nagad SMS auto-detect করতে" />
            <Alert type="info">এই feature চালু থাকলে কোনো ইউজার bKash/Nagad দিয়ে payment করলে সেই SMS automatically BooyahZone-এ পৌঁছায় এবং ডিপোজিট confirm হয়।</Alert>

            <div className="mt-4">
              <p className="text-gray-700 text-sm font-bold mb-3">📲 Android ফোনে Setup (SMS to URL Forwarder)</p>

              <Step num="1" title="App ইন্সটল করো">
                <p>F-Droid থেকে <strong>SMS to URL Forwarder</strong> অথবা Google Play থেকে <strong>SMS Forwarder</strong> ইন্সটল করো</p>
                <Alert type="warn">এই app সবসময় তোমার bKash/Nagad SIM কার্ড যে ফোনে আছে সেই ফোনে ইন্সটল করো</Alert>
              </Step>

              <Step num="2" title="Webhook Secret তৈরি করো">
                <p>Admin Panel → Settings → SMS Webhook Secret-এ যেকোনো random string দাও:</p>
                <Code>my_secret_webhook_key_2025</Code>
                <p>এই same value Render Environment-এ দাও: <Cmd>SMS_WEBHOOK_SECRET=my_secret_webhook_key_2025</Cmd></p>
              </Step>

              <Step num="3" title="SMS Forwarder App Configure করো">
                <p>App খোলো → Add Rule → এভাবে পূরণ করো:</p>
                <Code>{`URL: https://your-app.onrender.com/api/sms-webhook

Method: POST

Headers:
Content-Type: application/json

Body Template:
{
  "from": "%from%",
  "body": "%body%",
  "secret": "my_secret_webhook_key_2025"
}

Filter (SMS Sender):
bKash এর জন্য: 01779-054726
Nagad এর জন্য: 16167
Rocket এর জন্য: 16216`}</Code>
              </Step>

              <Step num="4" title="Test করো">
                <p>নিজেকে একটি ছোট payment করো এবং Admin Panel → Payments-এ দেখো auto-detect হয়েছে কিনা</p>
              </Step>
            </div>

            <Alert type="warn">
              SMS forwarding কাজ করতে হলে ফোনটি সবসময় ইন্টারনেটে connected থাকতে হবে এবং app-এর background permission থাকতে হবে।
            </Alert>
          </Card>

          {/* Admin Panel */}
          <Card>
            <SectionTitle id="admin" emoji="👑" title="Admin Panel ব্যবহার" />

            <div className="space-y-3">
              {[
                {
                  title: '🏠 Dashboard',
                  desc: 'মোট ইউজার, টুর্নামেন্ট, পেমেন্ট, আজকের revenue সহ সব statistics দেখা যায়।',
                },
                {
                  title: '⚔️ Tournaments',
                  desc: 'নতুন টুর্নামেন্ট তৈরি করো। নাম, Map, Entry Fee, Prize Pool, Start Time, Max Participants সেট করো। Room ID/Password টুর্নামেন্ট শুরুর আগে দাও।',
                },
                {
                  title: '👥 Users',
                  desc: 'সব ইউজার দেখো। Balance যোগ/কমাও। Ban/Unban করো। Role পরিবর্তন করো (admin/user)।',
                },
                {
                  title: '💰 Payments',
                  desc: 'Deposit ও Withdraw requests দেখো। Approve বা Reject করো। প্রতিটি request-এ ইউজারের payment screenshot দেখা যায়।',
                },
                {
                  title: '🎮 Matches',
                  desc: 'টুর্নামেন্টের match results ও scores দাও। Winner নির্বাচন করো এবং prize automatically wallet-এ যায়।',
                },
                {
                  title: '📢 Content',
                  desc: 'Announcements (Homepage ticker), Static Pages (About, Terms, Privacy, Rules) তৈরি ও edit করো।',
                },
                {
                  title: '⚙️ Settings',
                  desc: 'Site name, payment numbers (bKash/Nagad/Rocket), minimum deposit/withdraw, SMS webhook secret, maintenance mode সেট করো।',
                },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm font-bold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Custom Domain */}
          <Card>
            <SectionTitle id="custom-domain" emoji="🌐" title="Custom Domain Setup" subtitle="booyahzone.com ধরনের নিজস্ব domain যোগ করো" />
            <Step num="1" title="Domain কিনো">
              <p>Namecheap, GoDaddy, বা Porkbun থেকে domain কিনো (বার্ষিক ৮০০-১৫০০ টাকা)</p>
            </Step>
            <Step num="2" title="Render-এ Custom Domain যোগ করো">
              <p>Render → Your Service → Settings → Custom Domains → Add Domain</p>
              <p>তোমার domain লিখো: <Cmd>booyahzone.com</Cmd></p>
              <p>Render একটি CNAME value দেবে — কপি করো</p>
            </Step>
            <Step num="3" title="DNS Settings Update করো">
              <p>তোমার Domain Provider-এ যাও → DNS Management → নতুন Record যোগ করো:</p>
              <Code>{`Type: CNAME
Host: www (অথবা @)
Value: your-service.onrender.com (Render থেকে দেওয়া)
TTL: 3600`}</Code>
            </Step>
            <Step num="4" title="SSL Certificate">
              <p>Render automatically free SSL (HTTPS) দেয়। DNS propagate হতে ২৪-৪৮ ঘণ্টা লাগতে পারে।</p>
            </Step>
            <Alert type="info">FRONTEND_URL Environment Variable-এ নতুন domain দাও: <Cmd>https://booyahzone.com</Cmd></Alert>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <SectionTitle id="troubleshoot" emoji="🔧" title="সমস্যা সমাধান" />
            <div className="space-y-3">
              {[
                {
                  prob: 'App চালু হচ্ছে না',
                  sol: 'Render Logs চেক করো। সব Environment Variables দেওয়া আছে কিনা দেখো। Node version 20+ আছে কিনা চেক করো (Settings → Node Version)।',
                },
                {
                  prob: 'Database connection error',
                  sol: 'DATABASE_URL-এ Internal URL ব্যবহার করেছ? URL-এর শেষে ?ssl=true যোগ করে দেখো। Database ও Web Service একই Render account-এ আছে?',
                },
                {
                  prob: 'Frontend লোড হচ্ছে না (blank page)',
                  sol: 'Build Command সঠিক? cd frontend && npm install && npm run build চালাচ্ছে? Render Logs-এ build error আছে?',
                },
                {
                  prob: 'Admin login হচ্ছে না',
                  sol: 'Database seed.js চালিয়েছ? Default password: Admin@123। Database-এ admin user আছে কিনা চেক করো।',
                },
                {
                  prob: 'Email যাচ্ছে না',
                  sol: 'Gmail হলে App Password ব্যবহার করেছ (সাধারণ password নয়)? SMTP_HOST, PORT, USER, PASS সঠিক? Gmail Less Secure App Access বন্ধ করা থাকলে সমস্যা হবে।',
                },
                {
                  prob: 'SMS forwarding কাজ করছে না',
                  sol: 'App-এর background permission আছে? Webhook URL সঠিক? SMS_WEBHOOK_SECRET match করছে? Render logs-এ /api/sms-webhook request আসছে?',
                },
                {
                  prob: 'Render free tier — app ধীর',
                  sol: 'Free tier ১৫ মিনিট idle থাকলে sleep করে। UptimeRobot বা Cron-job.org দিয়ে প্রতি ১৪ মিনিটে ping পাঠাও — সবসময় জাগিয়ে রাখবে।',
                },
                {
                  prob: 'Replit-এ changes দেখা যাচ্ছে না',
                  sol: 'Frontend dev server port 5000-এ চলে। Backend-এর preview port 3001-এ build করা files থাকে। নতুন design দেখতে npm run build করো বা webview port 5000-এ সেট করো।',
                },
              ].map(({ prob, sol }) => (
                <div key={prob} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm font-bold text-red-600 mb-1">❌ {prob}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">✅ {sol}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* API Endpoints */}
          <Card>
            <SectionTitle id="api" emoji="📡" title="সব API Endpoints" subtitle="Base URL: https://your-app.onrender.com/api" />
            <div className="space-y-4">
              {[
                {
                  group: '🔐 Authentication', endpoints: [
                    { m: 'POST', path: '/auth/register', desc: 'নতুন ইউজার তৈরি' },
                    { m: 'POST', path: '/auth/login', desc: 'লগইন (access + refresh token)' },
                    { m: 'POST', path: '/auth/logout', desc: 'লগআউট' },
                    { m: 'POST', path: '/auth/refresh', desc: 'Access token refresh' },
                    { m: 'GET', path: '/auth/me', desc: 'নিজের তথ্য' },
                    { m: 'PUT', path: '/auth/profile', desc: 'Profile update' },
                    { m: 'PUT', path: '/auth/change-password', desc: 'পাসওয়ার্ড পরিবর্তন' },
                    { m: 'POST', path: '/auth/forgot-password', desc: 'Password reset email' },
                    { m: 'POST', path: '/auth/reset-password', desc: 'নতুন পাসওয়ার্ড সেট' },
                  ]
                },
                {
                  group: '⚔️ Tournaments', endpoints: [
                    { m: 'GET', path: '/tournaments', desc: 'সব টুর্নামেন্ট (filter, search, pagination)' },
                    { m: 'GET', path: '/tournaments/upcoming', desc: 'আসন্ন টুর্নামেন্ট (homepage)' },
                    { m: 'GET', path: '/tournaments/:id', desc: 'একটি টুর্নামেন্টের বিস্তারিত' },
                    { m: 'POST', path: '/tournaments/:id/join', desc: 'টুর্নামেন্টে যোগ দাও' },
                    { m: 'GET', path: '/tournaments/:id/results', desc: 'টুর্নামেন্টের result' },
                  ]
                },
                {
                  group: '💰 Payments', endpoints: [
                    { m: 'POST', path: '/payments/deposit', desc: 'Deposit request পাঠাও' },
                    { m: 'POST', path: '/payments/withdraw', desc: 'Withdraw request পাঠাও' },
                    { m: 'GET', path: '/payments/transactions', desc: 'Transaction history' },
                    { m: 'POST', path: '/sms-webhook', desc: 'SMS auto-forward webhook' },
                  ]
                },
                {
                  group: '🏆 Leaderboard', endpoints: [
                    { m: 'GET', path: '/leaderboard', desc: 'Leaderboard (weekly/monthly/alltime)' },
                    { m: 'GET', path: '/leaderboard/top5', desc: 'Top 5 (homepage)' },
                  ]
                },
                {
                  group: '🌐 Public', endpoints: [
                    { m: 'GET', path: '/public/stats', desc: 'Site statistics' },
                    { m: 'GET', path: '/public/announcements', desc: 'Announcements' },
                    { m: 'GET', path: '/pages/:slug', desc: 'Static pages (about, terms...)' },
                  ]
                },
                {
                  group: '🔔 Notifications', endpoints: [
                    { m: 'GET', path: '/notifications', desc: 'নিজের notifications' },
                    { m: 'PUT', path: '/notifications/read-all', desc: 'সব read mark করো' },
                  ]
                },
                {
                  group: '👑 Admin (Protected)', endpoints: [
                    { m: 'GET', path: '/admin/dashboard', desc: 'Dashboard stats' },
                    { m: 'GET', path: '/admin/users', desc: 'সব ইউজার' },
                    { m: 'PUT', path: '/admin/users/:id', desc: 'ইউজার update (balance, role, ban)' },
                    { m: 'POST', path: '/admin/tournaments', desc: 'নতুন টুর্নামেন্ট' },
                    { m: 'PUT', path: '/admin/tournaments/:id', desc: 'টুর্নামেন্ট update' },
                    { m: 'DELETE', path: '/admin/tournaments/:id', desc: 'টুর্নামেন্ট delete' },
                    { m: 'GET', path: '/admin/participants', desc: 'সব participants' },
                    { m: 'GET', path: '/admin/payments', desc: 'সব payments' },
                    { m: 'PUT', path: '/admin/payments/:id/approve', desc: 'Payment approve' },
                    { m: 'PUT', path: '/admin/payments/:id/reject', desc: 'Payment reject' },
                    { m: 'POST', path: '/admin/matches/:id/results', desc: 'Match results দাও' },
                    { m: 'GET', path: '/admin/settings', desc: 'Site settings' },
                    { m: 'PUT', path: '/admin/settings', desc: 'Settings update' },
                    { m: 'POST', path: '/admin/announcements', desc: 'নতুন announcement' },
                    { m: 'PUT', path: '/admin/pages/:slug', desc: 'Static page update' },
                  ]
                },
              ].map(({ group, endpoints }) => (
                <div key={group}>
                  <p className="text-xs font-bold text-gray-600 mb-2">{group}</p>
                  <div className="space-y-1">
                    {endpoints.map(({ m, path, desc }) => {
                      const colors = { GET: '#16a34a', POST: '#2563eb', PUT: '#d97706', DELETE: '#dc2626' };
                      return (
                        <div key={`${m}-${path}`} className="flex items-start gap-2 text-xs">
                          <span className="font-mono font-bold flex-shrink-0 w-12 text-right" style={{ color: colors[m] }}>{m}</span>
                          <span className="font-mono text-gray-700 flex-shrink-0">{path}</span>
                          <span className="text-gray-400">— {desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}
