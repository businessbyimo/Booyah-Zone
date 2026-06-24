import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageTransition from '../components/PageTransition.jsx';

const FILTERS = [
  { value: 'alltime', label: 'সর্বকালের' },
  { value: 'monthly', label: 'মাসিক' },
  { value: 'weekly', label: 'সাপ্তাহিক' },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [filter, setFilter] = useState('alltime');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard?filter=${filter}`).then(res => {
      setLeaders(res.data.leaderboard);
    }).finally(() => setLoading(false));
  }, [filter]);

  const rankEmoji = (rank) => {
    if (rank == 1) return '🥇';
    if (rank == 2) return '🥈';
    if (rank == 3) return '🥉';
    return `#${rank}`;
  };

  const podiumGradient = (rank) => {
    if (rank === 1) return 'linear-gradient(135deg,#F59E0B,#FCD34D)';
    if (rank === 2) return 'linear-gradient(135deg,#9CA3AF,#D1D5DB)';
    return 'linear-gradient(135deg,#FF6B00,#FF8C42)';
  };

  const AnimatedPoints = ({ value }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
      if (inView && ref.current) {
        gsap.fromTo(ref.current, { textContent: 0 }, {
          textContent: value, duration: 1.5, ease: 'power2.out',
          snap: { textContent: 1 },
          onUpdate() { if (ref.current) ref.current.textContent = Math.round(ref.current.textContent).toLocaleString(); }
        });
      }
    }, [inView, value]);
    return <span ref={ref}>০</span>;
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 pt-4 pb-6 max-w-2xl mx-auto">
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-gray-900 font-orbitron">🏆 লিডারবোর্ড</h1>
          <p className="text-gray-500 text-sm mt-0.5">BooyahZone-এর চ্যাম্পিয়নরা, পয়েন্ট অনুযায়ী র্যাঙ্কড</p>
        </div>

        <div className="flex justify-center gap-2 mb-5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={filter === f.value
                ? { background: 'linear-gradient(135deg,#FF6B00,#FF8C42)', color: '#fff', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }
                : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {!loading && leaders.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-6">
            {[{ player: leaders[1], rank: 2 }, { player: leaders[0], rank: 1 }, { player: leaders[2], rank: 3 }].map(({ player: p, rank }, i) => {
              if (!p) return null;
              const heights = [80, 104, 64];
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-orbitron font-bold text-base mb-1.5 overflow-hidden"
                    style={{ background: podiumGradient(rank) }}
                  >
                    {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : p.username[0].toUpperCase()}
                  </div>
                  <p className="text-gray-800 text-xs font-semibold text-center truncate w-20">{p.username}</p>
                  <p className="text-[10px] text-gray-500 font-medium mb-1">{Number(p.total_points).toLocaleString()} পয়েন্ট</p>
                  <div
                    className="w-20 rounded-t-xl flex items-start justify-center pt-2"
                    style={{ height: heights[i], background: podiumGradient(rank) + '30', border: '1px solid ' + (rank === 1 ? '#F59E0B' : rank === 2 ? '#9CA3AF' : '#FF6B00') + '40' }}
                  >
                    <span className="text-xl">{rankEmoji(rank)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-100 rounded-full" style={{ borderTopColor: '#FF6B00', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs">
                  <th className="py-3 pl-4 text-left w-14">র্যাংক</th>
                  <th className="py-3 text-left">খেলোয়াড়</th>
                  <th className="py-3 text-center hidden sm:table-cell">ফ্রি ফায়ার আইডি</th>
                  <th className="py-3 pr-4 text-right">পয়েন্ট</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0"
                    style={{ background: p.id === user?.id ? 'rgba(255,107,0,0.04)' : 'transparent' }}
                  >
                    <td className="py-3 pl-4">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-orbitron font-bold"
                        style={p.rank <= 3
                          ? { background: podiumGradient(p.rank) + '20', color: p.rank === 1 ? '#F59E0B' : p.rank === 2 ? '#9CA3AF' : '#FF6B00' }
                          : { background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB' }
                        }
                      >
                        {p.rank <= 3 ? rankEmoji(p.rank) : p.rank}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: p.id === user?.id ? 'linear-gradient(135deg,#FF6B00,#FF8C42)' : 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
                          >
                            {p.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold" style={{ color: p.id === user?.id ? '#FF6B00' : '#111827' }}>
                            {p.username} {p.id === user?.id && <span className="text-[10px] text-orange-400">(আপনি)</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-gray-400 text-xs hidden sm:table-cell">{p.free_fire_id || '-'}</td>
                    <td className="py-3 pr-4 text-right font-orbitron font-bold text-orange-500 text-sm">
                      <AnimatedPoints value={p.total_points} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && leaders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🏆</p>
            <p className="text-gray-400">এখনো কোনো তথ্য নেই</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
