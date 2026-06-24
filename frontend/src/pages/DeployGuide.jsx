import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition.jsx';

const Step = ({ num, title, children }) => (
  <div className="flex gap-4 mb-6">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-orbitron font-bold text-sm">{num}</div>
    <div>
      <h3 className="font-orbitron font-bold text-white text-lg mb-2">{title}</h3>
      <div className="text-gray-300 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  </div>
);

const Code = ({ children }) => (
  <code className="block bg-dark-900 border border-dark-500 rounded-lg p-3 text-cyan-300 text-sm font-mono whitespace-pre-wrap mt-2">{children}</code>
);

const EnvVar = ({ name, desc }) => (
  <div className="flex items-start gap-2 py-1.5 border-b border-dark-600/30">
    <code className="text-fuchsia-400 text-sm font-mono whitespace-nowrap">{name}</code>
    <span className="text-gray-400 text-sm">— {desc}</span>
  </div>
);

export default function DeployGuide() {
  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="section-title">🚀 Deploy Guide</h1>
          <p className="text-gray-400">Complete guide to deploy BooyahZone on Render.com</p>
        </div>

        <div className="space-y-6">
          <div className="card neon-border">
            <h2 className="font-orbitron font-bold text-xl text-white mb-4">📋 Prerequisites</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> GitHub account (free)</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Render.com account (free)</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> PostgreSQL database (Render provides free PostgreSQL)</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Node.js 20+ knowledge</li>
            </ul>
          </div>

          <div className="card neon-border">
            <h2 className="font-orbitron font-bold text-xl text-white mb-6">📦 Step-by-Step Setup</h2>

            <Step num="1" title="Push Code to GitHub">
              <p>Create a new GitHub repository and push your code:</p>
              <Code>{`git init
git add .
git commit -m "Initial commit — BooyahZone"
git remote add origin https://github.com/YOUR_USERNAME/booyahzone.git
git push -u origin main`}</Code>
            </Step>

            <Step num="2" title="Create PostgreSQL Database on Render">
              <p>1. Go to <strong className="text-white">render.com</strong> → New → PostgreSQL</p>
              <p>2. Choose <strong className="text-white">Free</strong> plan</p>
              <p>3. Set name: <code className="text-cyan-400">booyahzone-db</code></p>
              <p>4. After creation, copy the <strong className="text-white">Internal Database URL</strong></p>
            </Step>

            <Step num="3" title="Create Web Service on Render">
              <p>1. Go to <strong className="text-white">render.com</strong> → New → Web Service</p>
              <p>2. Connect your GitHub repository</p>
              <p>3. Set these build settings:</p>
              <Code>{`Name: booyahzone
Environment: Node
Region: Singapore (closest to Bangladesh)
Branch: main
Build Command: cd frontend && npm install && npm run build && cd ../backend && npm install
Start Command: cd backend && node server.js`}</Code>
            </Step>

            <Step num="4" title="Set Environment Variables">
              <p>In your Render Web Service, go to <strong className="text-white">Environment</strong> tab and add:</p>
              <div className="bg-dark-900 rounded-lg p-4 mt-2 space-y-1">
                <EnvVar name="DATABASE_URL" desc="Your Render PostgreSQL Internal URL" />
                <EnvVar name="JWT_SECRET" desc="Random 64-char string for JWT signing" />
                <EnvVar name="REFRESH_SECRET" desc="Another random 64-char string" />
                <EnvVar name="NODE_ENV" desc="production" />
                <EnvVar name="PORT" desc="10000 (Render's default)" />
                <EnvVar name="FRONTEND_URL" desc="https://your-app.onrender.com" />
                <EnvVar name="SMTP_HOST" desc="SMTP server host (e.g., smtp.gmail.com)" />
                <EnvVar name="SMTP_PORT" desc="587" />
                <EnvVar name="SMTP_USER" desc="Your email address" />
                <EnvVar name="SMTP_PASS" desc="Your email app password" />
              </div>
              <p className="mt-2 text-xs text-gray-500">Generate JWT secrets: <code className="text-cyan-400">node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"</code></p>
            </Step>

            <Step num="5" title="Initialize Database Schema">
              <p>After first deployment, run the seed script via Render Shell:</p>
              <Code>{`# In Render Dashboard → your service → Shell
cd backend && node db/seed.js`}</Code>
              <p>This creates the admin account: <code className="text-cyan-400">admin / Admin@123</code></p>
            </Step>

            <Step num="6" title="SMS Forwarding Setup (Optional — for auto-deposit)">
              <p>1. Install <strong className="text-white">SMS to URL Forwarder</strong> from F-Droid on your Android phone</p>
              <p>2. Set webhook URL to:</p>
              <Code>https://your-app.onrender.com/api/sms-webhook?secret=YOUR_WEBHOOK_SECRET</Code>
              <p>3. Set <code className="text-cyan-400">sms_webhook_secret</code> in Admin → Settings</p>
            </Step>
          </div>

          <div className="card neon-border">
            <h2 className="font-orbitron font-bold text-xl text-white mb-4">🔧 Troubleshooting</h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-dark-700/50 rounded-lg">
                <p className="text-white font-semibold">App not starting?</p>
                <p className="text-gray-400">Check Render logs. Ensure all env variables are set. Verify Node.js version is 20+.</p>
              </div>
              <div className="p-3 bg-dark-700/50 rounded-lg">
                <p className="text-white font-semibold">Database connection error?</p>
                <p className="text-gray-400">Make sure DATABASE_URL is the Internal URL (not External). Add <code className="text-cyan-400">?ssl=true</code> if needed.</p>
              </div>
              <div className="p-3 bg-dark-700/50 rounded-lg">
                <p className="text-white font-semibold">Frontend not loading?</p>
                <p className="text-gray-400">Ensure the build command runs <code className="text-cyan-400">cd frontend && npm run build</code> before starting the server.</p>
              </div>
              <div className="p-3 bg-dark-700/50 rounded-lg">
                <p className="text-white font-semibold">Free tier limitations</p>
                <p className="text-gray-400">Render free tier spins down after 15 min inactivity. First request may take 30-60 seconds. Upgrade for always-on.</p>
              </div>
            </div>
          </div>

          <div className="card neon-border bg-gradient-to-br from-cyan-600/10 to-fuchsia-600/10">
            <h2 className="font-orbitron font-bold text-xl text-white mb-2">🎉 Default Admin Credentials</h2>
            <div className="bg-dark-900 rounded-lg p-4 font-mono text-sm">
              <p><span className="text-gray-500">URL: </span><span className="text-cyan-400">https://your-app.onrender.com/admin</span></p>
              <p><span className="text-gray-500">Username: </span><span className="text-green-400">admin</span></p>
              <p><span className="text-gray-500">Password: </span><span className="text-green-400">Admin@123</span></p>
            </div>
            <p className="text-yellow-400 text-xs mt-2">⚠️ Change your password immediately after first login!</p>
          </div>

          <div className="card neon-border">
            <h2 className="font-orbitron font-bold text-xl text-white mb-4">📡 All API Endpoints</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                'POST /api/auth/register', 'POST /api/auth/login', 'POST /api/auth/logout', 'POST /api/auth/refresh',
                'GET /api/auth/me', 'PUT /api/auth/profile', 'PUT /api/auth/change-password',
                'POST /api/auth/forgot-password', 'POST /api/auth/reset-password',
                'GET /api/tournaments', 'GET /api/tournaments/upcoming', 'GET /api/tournaments/:id',
                'POST /api/tournaments/:id/join', 'GET /api/tournaments/:id/results',
                'POST /api/payments/deposit', 'POST /api/payments/withdraw', 'GET /api/payments/transactions',
                'GET /api/leaderboard', 'GET /api/leaderboard/top5',
                'GET /api/notifications', 'PUT /api/notifications/read-all',
                'POST /api/chatbot/message', 'POST /api/sms-webhook',
                'GET /api/public/stats', 'GET /api/public/announcements',
                'GET /api/admin/dashboard', 'GET /api/admin/users', 'POST /api/admin/tournaments',
                'GET /api/admin/participants', 'GET /api/admin/payments', 'PUT /api/admin/payments/:id/approve',
                'POST /api/admin/matches/:id/results', 'GET /api/admin/settings', 'PUT /api/admin/settings',
              ].map(ep => (
                <div key={ep} className={`p-1.5 rounded text-gray-400 ${ep.startsWith('GET') ? 'text-green-400/70' : ep.startsWith('POST') ? 'text-cyan-400/70' : ep.startsWith('PUT') ? 'text-yellow-400/70' : 'text-red-400/70'}`}>
                  {ep}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
