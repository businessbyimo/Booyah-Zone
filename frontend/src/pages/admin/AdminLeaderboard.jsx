import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const rankEmoji = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

export default function AdminLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('alltime');
  const [resetting, setResetting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/leaderboard?filter=${filter}&limit=50`).then(r => setLeaders(r.data?.leaderboard || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const resetMonthly = async () => {
    if (!window.confirm('মাসিক লিডারবোর্ড রিসেট করবেন?')) return;
    setResetting(true);
    try {
      await api.post('/admin/leaderboard/reset-monthly');
      toast.success('মাসিক লিডারবোর্ড রিসেট হয়েছে!');
      load();
    } catch { toast.error('ব্যর্থ হয়েছে'); }
    finally { setResetting(false); }
  };

  const FILTERS = [{ v: 'alltime', l: 'সর্বকালের' }, { v: 'monthly', l: 'মাসিক' }, { v: 'weekly', l: 'সাপ্তাহিক' }];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-orbitron font-bold text-xl text-white">লিডারবোর্ড ম্যানেজমেন্ট</h2>
        <motion.button whileTap={{ scale: 0.97 }} onClick={resetMonthly} disabled={resetting}
          className="px-4 py-2 rounded-xl text-sm font-bold text-red-400 border border-red-500/30 disabled:opacity-50"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          {resetting ? 'রিসেট হচ্ছে...' : '🔄 মাসিক রিসেট'}
        </motion.button>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTERS.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{
              background: filter === f.v ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: filter === f.v ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.1)',
              color: filter === f.v ? '#22d3ee' : '#9ca3af',
            }}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs text-gray-500">র্যাংক</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500">খেলোয়াড়</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500">পয়েন্ট</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500">ম্যাচ</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500">জয়</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(10)].map((_,i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(5)].map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded shimmer w-16"/></td>)}
                </tr>
              )) : leaders.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-bold text-base">{rankEmoji(i + 1)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{p.username}</p>
                    <p className="text-[10px] text-gray-500">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-rajdhani font-bold text-cyan-400 text-base">
                    {(p.total_points || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">{p.matches_played || 0}</td>
                  <td className="px-4 py-3 text-right text-green-400">{p.wins || 0}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!loading && leaders.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">কোনো ডেটা নেই</p>
          )}
        </div>
      </div>
    </div>
  );
}
