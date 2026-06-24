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

  const rankStyle = (rank) => {
    if (rank == 1) return 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400';
    if (rank == 2) return 'bg-gray-300/10 border-gray-300/40 text-gray-300';
    if (rank == 3) return 'bg-orange-400/10 border-orange-400/40 text-orange-400';
    return 'bg-dark-700/30 border-dark-500 text-gray-400';
  };

  const rankEmoji = (rank) => {
    if (rank == 1) return '🥇';
    if (rank == 2) return '🥈';
    if (rank == 3) return '🥉';
    return `#${rank}`;
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
      <div className="min-h-screen pt-24 pb-16 max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="section-title">🏆 লিডারবোর্ড</h1>
          <p className="text-gray-400">BooyahZone-এর চ্যাম্পিয়নরা, পয়েন্ট অনুযায়ী র্যাঙ্কড</p>
        </div>
        <div className="flex justify-center space-x-2 mb-8">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${filter === f.value ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-cyan-500/30'}`}>
              {f.label}
            </button>
          ))}
        </div>
        {/* টপ ৩ পডিয়াম */}
        {!loading && leaders.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {[leaders[1], leaders[0], leaders[2]].map((p, i) => {
              const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
              const heights = ['h-24', 'h-32', 'h-20'];
              const colors = ['bg-gray-400/20', 'bg-yellow-400/20', 'bg-orange-400/20'];
              const textColors = ['text-gray-300', 'text-yellow-400', 'text-orange-400'];
              return p && (
                <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border-2 border-cyan-500/50 bg-dark-700 flex items-center justify-center text-xl font-orbitron font-bold text-white mb-2 overflow-hidden">
                    {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : p.username[0].toUpperCase()}
                  </div>
                  <p className="text-white text-sm font-semibold text-center truncate w-20">{p.username}</p>
                  <p className={`text-xs font-orbitron font-bold ${textColors[i]}`}>{Number(p.total_points).toLocaleString()} পয়েন্ট</p>
                  <div className={`${heights[i]} w-20 ${colors[i]} rounded-t-lg flex items-start justify-center pt-2 mt-2 border border-current ${textColors[i]}`}>
                    <span className="text-2xl">{rankEmoji(rank)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div>
        ) : (
          <div className="card neon-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600 text-gray-500 text-sm">
                    <th className="pb-3 pl-4 text-left w-12">র্যাংক</th>
                    <th className="pb-3 text-left">খেলোয়াড়</th>
                    <th className="pb-3 text-center">ফ্রি ফায়ার আইডি</th>
                    <th className="pb-3 pr-4 text-right">পয়েন্ট</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((p, i) => (
                    <motion.tr key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b border-dark-600/30 transition-colors ${p.id === user?.id ? 'bg-cyan-500/10' : 'hover:bg-dark-700/30'}`}>
                      <td className="py-3 pl-4">
                        <span className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-orbitron font-bold ${rankStyle(p.rank)}`}>
                          {p.rank <= 3 ? rankEmoji(p.rank) : p.rank}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                              {p.username[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className={`font-semibold ${p.id === user?.id ? 'text-cyan-400' : 'text-white'}`}>
                              {p.username} {p.id === user?.id && <span className="text-xs">(আপনি)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center text-gray-500 text-sm">{p.free_fire_id || '-'}</td>
                      <td className="py-3 pr-4 text-right font-orbitron font-bold text-cyan-400">
                        <AnimatedPoints value={p.total_points} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!loading && leaders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-gray-400 text-lg">এখনো কোনো তথ্য নেই</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
