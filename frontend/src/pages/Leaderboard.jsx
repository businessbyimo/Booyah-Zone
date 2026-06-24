import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageTransition from '../components/PageTransition.jsx';

const FILTERS = [
  { value: 'alltime', label: 'সর্বকালের' },
  { value: 'monthly', label: 'মাসিক' },
  { value: 'weekly', label: 'সাপ্তাহিক' },
];

const RANK_COLOR = ['#f59e0b', '#9ca3af', '#f97316'];
const RANK_BG = ['rgba(245,158,11,0.15)', 'rgba(156,163,175,0.15)', 'rgba(249,115,22,0.15)'];
const RANK_EMOJI = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('alltime');
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard?filter=${filter}`).then(res => {
      setLeaders(res.data.leaderboard || []);
      setMyRank(res.data.myRank || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  const Podium = () => {
    const top3 = leaders.slice(0, 3);
    if (top3.length < 1) return null;
    const order = [1, 0, 2];
    const heights = [80, 100, 65];

    return (
      <div className="flex items-end justify-center gap-2 mb-6 px-4">
        {order.map((idx, pos) => {
          const p = top3[idx];
          if (!p) return <div key={pos} className="flex-1" />;
          const rank = idx + 1;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pos * 0.12 }}
              className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-orbitron font-black text-sm text-black"
                  style={{ background: RANK_COLOR[idx], boxShadow: `0 6px 20px ${RANK_COLOR[idx]}50` }}>
                  {p.username?.[0]?.toUpperCase()}
                </div>
                <span className="absolute -top-2 -right-1 text-base">{RANK_EMOJI[idx]}</span>
              </div>
              <p className="text-white text-xs font-semibold text-center truncate w-full px-1">{p.username}</p>
              <p className="text-[10px] font-rajdhani font-bold mb-1" style={{ color: RANK_COLOR[idx] }}>
                {(p.total_points || 0).toLocaleString()}
              </p>
              <div className="w-full rounded-t-xl flex items-end justify-center py-2 border border-t-0"
                style={{ height: heights[pos], background: RANK_BG[idx], borderColor: `${RANK_COLOR[idx]}25` }}>
                <span className="font-orbitron font-black text-xl" style={{ color: RANK_COLOR[idx] }}>#{rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="text-center mb-4">
          <h1 className="font-orbitron font-bold text-base text-white">🏆 লিডারবোর্ড</h1>
          <p className="text-xs text-gray-500 mt-0.5">BooyahZone চ্যাম্পিয়নরা</p>
        </div>

        <div className="flex gap-2 justify-center mb-5">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
              style={{
                background: filter === f.value ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.04)',
                borderColor: filter === f.value ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.08)',
                color: filter === f.value ? '#22d3ee' : '#9ca3af',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(10)].map((_,i)=><div key={i} className="h-14 rounded-2xl shimmer"/>)}</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-400">এখনো ডেটা নেই</p>
          </div>
        ) : (
          <>
            {leaders.length >= 3 && <Podium />}

            {myRank && (
              <div className="mb-3 p-3 rounded-2xl border"
                style={{ background: 'rgba(34,211,238,0.08)', borderColor: 'rgba(34,211,238,0.2)' }}>
                <p className="text-xs text-gray-400 mb-0.5">আপনার র্যাংক</p>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-cyan-400">#{myRank.rank}</span>
                  <span className="text-white font-semibold text-sm">{user?.username}</span>
                  <span className="ml-auto font-rajdhani font-bold text-cyan-400">{(myRank.total_points || 0).toLocaleString()} pts</span>
                </div>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: '#13131F' }}>
              {leaders.map((p, i) => {
                const isMe = user && p.id === user.id;
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 px-4 py-3 ${i < leaders.length - 1 ? 'border-b border-white/5' : ''} ${isMe ? 'border-l-2 border-cyan-400' : ''}`}
                    style={{ background: isMe ? 'rgba(34,211,238,0.06)' : 'transparent' }}>
                    <div className="w-8 text-center font-bold text-sm"
                      style={{ color: i < 3 ? RANK_COLOR[i] : '#6b7280' }}>
                      {i < 3 ? RANK_EMOJI[i] : `#${i + 1}`}
                    </div>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-orbitron font-bold text-xs flex-shrink-0"
                      style={{ background: i < 3 ? RANK_BG[i] : 'rgba(255,255,255,0.05)', color: i < 3 ? RANK_COLOR[i] : '#9ca3af' }}>
                      {p.avatar
                        ? <img src={p.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                        : p.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isMe ? 'text-cyan-400' : 'text-white'}`}>
                        {p.username} {isMe && <span className="text-[10px] text-cyan-500">(আপনি)</span>}
                      </p>
                      <p className="text-[10px] text-gray-500">{p.matches_played || 0} ম্যাচ · {p.wins || 0} জয়</p>
                    </div>
                    <div className="text-right">
                      <p className="font-rajdhani font-bold text-base" style={{ color: i < 3 ? RANK_COLOR[i] : '#22d3ee' }}>
                        {(p.total_points || 0).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-gray-500">পয়েন্ট</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
