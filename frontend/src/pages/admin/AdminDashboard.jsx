import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiUsers, FiDollarSign, FiTrendingUp, FiClock } from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';
import api from '../../utils/api.js';
import { format } from 'date-fns';

const KPICard = ({ icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card neon-border flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl flex-shrink-0`}>{icon}</div>
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-orbitron font-bold text-2xl text-white">{value}</p>
    </div>
  </motion.div>
);

const customTooltipStyle = { background: '#0a0a1f', border: '1px solid #22d3ee33', color: '#e2e8f0', borderRadius: '8px', fontSize: '12px' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
    const interval = setInterval(() => {
      api.get('/admin/dashboard').then(r => setData(r.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div>;

  const { stats, recentActivity, weeklyRevenue, weeklyUsers } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-orbitron font-bold text-2xl text-white mb-1">Dashboard</h2>
        <p className="text-gray-500 text-sm">Real-time overview of FF Arena</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard icon={<FiUsers className="text-cyan-400" />} label="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} color="bg-cyan-500/10" delay={0} />
        <KPICard icon={<GiCrossedSwords className="text-fuchsia-400" />} label="Tournaments" value={stats?.totalTournaments || 0} color="bg-fuchsia-500/10" delay={0.1} />
        <KPICard icon={<FiDollarSign className="text-green-400" />} label="Today's Revenue" value={`৳${stats?.todayRevenue?.toFixed(0) || 0}`} color="bg-green-500/10" delay={0.2} />
        <KPICard icon={<FiClock className="text-yellow-400" />} label="Pending Deposits" value={stats?.pendingDeposits || 0} color="bg-yellow-500/10" delay={0.3} />
        <KPICard icon={<FiTrendingUp className="text-red-400" />} label="Pending Withdrawals" value={stats?.pendingWithdrawals || 0} color="bg-red-500/10" delay={0.4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card neon-border">
          <h3 className="font-orbitron font-bold text-white mb-4 text-sm">📈 Weekly Revenue (৳)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={d => d ? format(new Date(d), 'MMM dd') : ''} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="revenue" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card neon-border">
          <h3 className="font-orbitron font-bold text-white mb-4 text-sm">👥 New Users (Daily)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyUsers || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={d => d ? format(new Date(d), 'MMM dd') : ''} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#e879f9" strokeWidth={2} dot={{ fill: '#e879f9', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card neon-border">
        <h3 className="font-orbitron font-bold text-white mb-4 text-sm">⚡ Recent Activity</h3>
        {!recentActivity?.length ? (
          <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2 border-b border-dark-600/30 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-gray-300"><span className="text-cyan-400">{a.action}</span> — {a.detail}</span>
                </div>
                <span className="text-gray-600 text-xs">{a.created_at ? format(new Date(a.created_at), 'HH:mm') : ''}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
