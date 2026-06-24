import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RiTeamLine, RiMoneyDollarCircleLine, RiTrophyLine, RiTimeLine, RiArrowUpLine, RiGamepadLine } from 'react-icons/ri';
import api from '../../utils/api.js';
import { format } from 'date-fns';

const ttStyle = { background: '#13131F', border: '1px solid rgba(34,211,238,0.2)', color: '#e2e8f0', borderRadius: '12px', fontSize: '11px' };

const StatCard = ({ icon: Icon, label, value, color, change, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="rounded-2xl p-4 border border-white/8"
    style={{ background: '#13131F' }}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon className="text-base" style={{ color }} />
      </div>
      {change !== undefined && (
        <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: change >= 0 ? '#10b981' : '#ef4444' }}>
          <RiArrowUpLine className={change < 0 ? 'rotate-180' : ''} />{Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="font-rajdhani font-black text-2xl text-white">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </motion.div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/admin/dashboard').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  const { stats, recentActivity, weeklyRevenue, weeklyUsers } = data || {};

  const CARDS = [
    { icon: RiTeamLine, label: 'মোট ইউজার', value: stats?.totalUsers?.toLocaleString() || '0', color: '#22d3ee', change: stats?.userGrowth, delay: 0 },
    { icon: RiTrophyLine, label: 'টুর্নামেন্ট', value: stats?.totalTournaments || '0', color: '#d946ef', delay: 0.08 },
    { icon: RiMoneyDollarCircleLine, label: 'আজকের আয়', value: `৳${Number(stats?.todayRevenue || 0).toFixed(0)}`, color: '#10b981', delay: 0.16 },
    { icon: RiTimeLine, label: 'পেন্ডিং ডিপোজিট', value: stats?.pendingDeposits || '0', color: '#f59e0b', delay: 0.24 },
    { icon: RiTimeLine, label: 'পেন্ডিং উইথড্র', value: stats?.pendingWithdrawals || '0', color: '#ef4444', delay: 0.32 },
    { icon: RiGamepadLine, label: 'চলমান টুর্নামেন্ট', value: stats?.ongoingTournaments || '0', color: '#22c55e', delay: 0.4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-orbitron font-bold text-xl text-white">ড্যাশবোর্ড</h2>
        <p className="text-gray-500 text-xs mt-0.5">BooyahZone রিয়েলটাইম ওভারভিউ</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {CARDS.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 border border-white/8" style={{ background: '#13131F' }}>
          <h3 className="font-semibold text-white text-sm mb-4">📈 সাপ্তাহিক আয় (৳)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="revenue" fill="url(#rev)" radius={[4,4,0,0]} />
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity={0.5} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-4 border border-white/8" style={{ background: '#13131F' }}>
          <h3 className="font-semibold text-white text-sm mb-4">👥 সাপ্তাহিক নিবন্ধন</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyUsers || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ttStyle} />
              <Line type="monotone" dataKey="users" stroke="#d946ef" strokeWidth={2} dot={{ fill: '#d946ef', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {recentActivity?.length > 0 && (
        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#13131F' }}>
          <h3 className="font-semibold text-white text-sm p-4 border-b border-white/5">🕐 সাম্প্রতিক কার্যক্রম</h3>
          <div className="divide-y divide-white/5">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: a.type === 'deposit' ? '#10b981' : a.type === 'withdrawal' ? '#ef4444' : '#22d3ee' }} />
                <p className="text-gray-300 text-xs flex-1">{a.description}</p>
                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                  {a.created_at ? format(new Date(a.created_at), 'HH:mm') : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
