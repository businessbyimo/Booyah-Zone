import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiTrophyLine, RiMedalLine, RiBarChartLine } from 'react-icons/ri';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageTransition from '../components/PageTransition.jsx';

const FILTERS = [
  { value: 'alltime', label: 'সর্বকালের' },
  { value: 'monthly', label: 'মাসিক' },
  { value: 'weekly', label: 'সাপ্তাহিক' },
];

const RANK_COLOR = ['#f59e0b', '#9ca3af', '#cd7c3a'];
const RANK_BG = ['rgba(245,158,11,0.1)', 'rgba(156,163,175,0.08)', 'rgba(205,124,58,0.1)'];

const RankBadge = ({ rank }) => {
  if (rank === 1) return <RiTrophyLine style={{ color: '#f59e0b', fontSize: 18 }} />;
  if (rank === 2) return <RiMedalLine style={{ color: '#9ca3af', fontSize: 18 }} />;
  if (rank === 3) return <RiMedalLine style={{ color: '#cd7c3a', fontSize: 18 }} />;
  return <span className="font-orbitron font-bold text-xs" style={{ color: '#4b5563' }}>#{rank}</span>;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('alltime');
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/leaderboard?filter=${filter}`)
      .then(res => {
        setLeaders(res.data.leaderboard || []);
        setMyRank(res.data.myRank || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const Podium = () => {
    const top3 = leaders.slice(0, 3);
    if (top3.length < 1) return null;
    const order = [1, 0, 2];
    const heights = [72, 96, 60];

    return (
      <div className="flex items-end justify-center gap-3 mb-6 px-4">
        {order.map((idx, pos) => {
          const p = top3[idx];
          if (!p) return <div key={pos} className="flex-1" />;
          const rank = idx + 1;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pos * 0.1 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-orbitron font-black text-sm"
                  style={{
                    background: RANK_BG[idx],
                    border: `1px solid ${RANK_COLOR[idx]}30`,
                    color: RANK_COLOR[idx],
                    boxShadow: `0 4px 16px ${RANK_COLOR[idx]}25`,
                  }}
                >
                  {p.username?.[0]?.toUpperCase()}
                </div>
                <div
                  className="absolute -top-2 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#0d0d1a', border: `1px solid ${RANK_COLOR[idx]}40` }}
                >
                  <span className="font-orbitron font-black text-[9px]" style={{ color: RANK_COLOR[idx] }}>
                    {rank}
                  </span>
                </div>
              </div>
              <p className="text-white text-[11px] font-semibold text-center truncate w-full px-1 mb-0.5">
                {p.username}
              </p>
              <p className="font-rajdhani font-bold text-xs mb-1.5" style={{ color: RANK_COLOR[idx] }}>
                {(p.total_points || 0).toLocaleString()} pts
              </p>
              <div
                className="w-full rounded-t-xl flex items-end justify-center py-2"
                style={{
                  height: heights[pos],
                  background: RANK_BG[idx],
                  border: `1px solid ${RANK_COLOR[idx]}18`,
                  borderBottom: 'none',
                }}
              />
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center gap-2 mb-4">
          <RiTrophyLine className="text-amber-400 text-xl" />
          <div>
            <h1 className="font-orbitron font-bold text-sm text-white">লিডারবোর্ড</h1>
            <p className="text-[10px] text-gray-500">BooyahZone র‍্যাংকিং</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center mb-5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-1.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                background: filter === f.value ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.03)',
                borderColor: filter === f.value ? 'rgba(34,211,238,0.35)' : 'rgba(255,255,255,0.07)',
                color: filter === f.value ? '#22d3ee' : '#6b7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl shimmer" />
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-16">
            <RiBarChartLine className="text-4xl text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">এখনো কোনো ডেটা নেই</p>
          </div>
        ) : (
          <>
            {leaders.length >= 3 && <Podium />}

            {myRank && (
              <div
                className="mb-3 p-3 rounded-2xl border"
                style={{
                  background: 'rgba(34,211,238,0.06)',
                  borderColor: 'rgba(34,211,238,0.18)',
                }}
              >
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">আপনার অবস্থান</p>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-cyan-400 text-sm">#{myRank.rank}</span>
                  <span className="text-white font-semibold text-sm">{user?.username}</span>
                  <span className="ml-auto font-rajdhani font-bold text-cyan-400">
                    {(myRank.total_points || 0).toLocaleString()} pts
                  </span>
                </div>
              </div>
            )}

            <div
              className="rounded-2xl overflow-hidden border border-white/[0.06]"
              style={{ background: '#0d0d1a' }}
            >
              {leaders.map((p, i) => {
                const isMe = user && p.id === user.id;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < leaders.length - 1 ? 'border-b border-white/[0.04]' : ''
                    } ${isMe ? 'border-l-2 border-cyan-400' : ''}`}
                    style={{ background: isMe ? 'rgba(34,211,238,0.05)' : 'transparent' }}
                  >
                    <div className="w-7 flex items-center justify-center">
                      <RankBadge rank={i + 1} />
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-orbitron font-bold text-xs flex-shrink-0"
                      style={{
                        background: i < 3 ? RANK_BG[i] : 'rgba(255,255,255,0.04)',
                        color: i < 3 ? RANK_COLOR[i] : '#6b7280',
                        border: `1px solid ${i < 3 ? RANK_COLOR[i] + '20' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {p.avatar ? (
                        <img src={p.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        p.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isMe ? 'text-cyan-400' : 'text-white'}`}>
                        {p.username}
                        {isMe && (
                          <span className="ml-1 text-[9px] text-cyan-600 font-normal">(আপনি)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        {p.matches_played || 0} ম্যাচ · {p.wins || 0} জয়
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-rajdhani font-bold text-sm"
                        style={{ color: i < 3 ? RANK_COLOR[i] : '#22d3ee' }}
                      >
                        {(p.total_points || 0).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-gray-600">পয়েন্ট</p>
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
