import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiTrophyLine, RiUserLine, RiArrowRightLine, RiLiveLine, RiMegaphoneLine } from 'react-icons/ri';
import api from '../utils/api.js';
import TournamentCard from '../components/TournamentCard.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

const rankColors = ['#f59e0b', '#9ca3af', '#f97316', '#22d3ee', '#d946ef'];
const rankBg = ['rgba(245,158,11,0.15)', 'rgba(156,163,175,0.15)', 'rgba(249,115,22,0.15)', 'rgba(34,211,238,0.15)', 'rgba(217,70,239,0.15)'];
const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

export default function Home() {
  const { user } = useAuth();
  const { onEvent } = useSocket() || {};
  const [upcoming, setUpcoming] = useState([]);
  const [top5, setTop5] = useState([]);
  const [stats, setStats] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [liveT, setLiveT] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const startX = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/tournaments/upcoming'),
      api.get('/leaderboard/top5'),
      api.get('/public/stats'),
      api.get('/public/announcements'),
      api.get('/tournaments?status=ongoing&limit=3'),
    ]).then(([t, lb, st, an, live]) => {
      setUpcoming(t.data || []);
      setTop5(lb.data || []);
      setStats(st.data || {});
      setAnnouncements(an.data || []);
      setLiveT(live.data?.tournaments || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!onEvent) return;
    const off = onEvent('tournament:updated', () => {
      api.get('/tournaments/upcoming').then(r => setUpcoming(r.data || [])).catch(() => {});
    });
    return off;
  }, [onEvent]);

  const handleSwipeStart = (e) => { startX.current = e.touches?.[0]?.clientX || e.clientX; };
  const handleSwipeEnd = (e) => {
    if (startX.current === null) return;
    const endX = e.changedTouches?.[0]?.clientX || e.clientX;
    const diff = startX.current - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCarouselIdx(i => Math.min(upcoming.length - 1, i + 1));
      else setCarouselIdx(i => Math.max(0, i - 1));
    }
    startX.current = null;
  };

  return (
    <PageTransition>
      <div className="px-4 max-w-lg mx-auto pb-2">
        {user && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-4 mt-2 relative overflow-hidden border border-white/8"
            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(217,70,239,0.06))' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #22d3ee, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl border-2 border-cyan-400/30 overflow-hidden bg-dark-600 flex items-center justify-center flex-shrink-0">
                {user.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : <RiUserLine className="text-cyan-400 text-xl" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">স্বাগতম ফিরে,</p>
                <h2 className="font-orbitron font-bold text-white text-base truncate">
                  {user.username} <span className="text-lg">👋</span>
                </h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-yellow-400 font-rajdhani font-bold">৳{Number(user.balance || 0).toFixed(2)}</span>
                  <span className="text-xs text-cyan-400 font-rajdhani font-bold">🏆 {user.total_points || 0} পয়েন্ট</span>
                </div>
              </div>
              <Link to="/deposit" className="btn-primary text-xs px-3 py-2 flex-shrink-0">+ ডিপোজিট</Link>
            </div>
          </motion.div>
        )}

        {announcements.length > 0 && (
          <div className="rounded-xl mb-4 overflow-hidden" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <div className="flex items-center gap-2 px-3 py-2">
              <RiMegaphoneLine className="text-cyan-400 flex-shrink-0 text-sm" />
              <div className="overflow-hidden flex-1">
                <div className="whitespace-nowrap animate-[ticker_20s_linear_infinite] inline-block text-xs text-gray-300">
                  {announcements.map(a => (
                    <span key={a.id} className="mr-12">⚡ {a.title}: {a.content?.replace(/<[^>]*>/g, '')}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {liveT.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RiLiveLine className="text-green-400 live-pulse" />
                <h2 className="font-orbitron font-bold text-sm text-white">লাইভ টুর্নামেন্ট</h2>
              </div>
              <Link to="/tournaments?status=ongoing" className="text-xs text-green-400">সব দেখুন →</Link>
            </div>
            <div className="space-y-2">
              {liveT.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <div className="w-2 h-2 rounded-full bg-green-400 live-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-400">{t.current_participants}/{t.max_participants} জন</p>
                  </div>
                  <Link to={`/tournament/${t.id}`} className="text-xs font-bold text-black px-2.5 py-1 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    দেখুন
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-orbitron font-bold text-sm text-white">⚔️ আসন্ন টুর্নামেন্ট</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">স্লট শেষ হওয়ার আগেই রেজিস্টার করুন!</p>
              </div>
              <Link to="/tournaments" className="flex items-center gap-1 text-xs text-cyan-400">
                সব <RiArrowRightLine />
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl"
              onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}
              onMouseDown={handleSwipeStart} onMouseUp={handleSwipeEnd}>
              <motion.div
                animate={{ x: `-${carouselIdx * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex">
                {upcoming.map((t, i) => (
                  <div key={t.id} className="min-w-full px-0.5">
                    <TournamentCard tournament={t} index={i} />
                  </div>
                ))}
              </motion.div>
            </div>

            {upcoming.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {upcoming.map((_, i) => (
                  <button key={i} onClick={() => setCarouselIdx(i)}
                    className="rounded-full transition-all duration-300"
                    style={{ width: i === carouselIdx ? 20 : 6, height: 6, background: i === carouselIdx ? '#22d3ee' : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
            )}
          </section>
        )}

        {top5.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-orbitron font-bold text-sm text-white">🏆 শীর্ষ খেলোয়াড়</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">BooyahZone চ্যাম্পিয়নরা</p>
              </div>
              <Link to="/leaderboard" className="flex items-center gap-1 text-xs text-cyan-400">
                সম্পূর্ণ <RiArrowRightLine />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: '#13131F' }}>
              {top5.map((player, i) => (
                <motion.div key={player.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className={`flex items-center gap-3 px-4 py-3 ${i < top5.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <span className="text-lg w-6 text-center">{rankEmojis[i]}</span>
                  {player.avatar
                    ? <img src={player.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    : <div className="w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-bold text-xs text-white flex-shrink-0"
                        style={{ background: rankBg[i], border: `1px solid ${rankColors[i]}30` }}>
                        {player.username?.[0]?.toUpperCase()}
                      </div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{player.username}</p>
                    {player.free_fire_id && <p className="text-[10px] text-gray-500">FF: {player.free_fire_id}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-rajdhani font-bold text-base" style={{ color: rankColors[i] }}>
                      {player.total_points?.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-500">পয়েন্ট</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '👥', label: 'খেলোয়াড়', value: stats.totalUsers?.toLocaleString() || '০' },
              { icon: '⚔️', label: 'টুর্নামেন্ট', value: stats.totalTournaments?.toLocaleString() || '০' },
              { icon: '💰', label: 'পুরস্কার', value: `৳${Number(stats.totalPrizes || 0).toLocaleString()}` },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-3 text-center border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <p className="font-rajdhani font-black text-lg text-white">{s.value}</p>
                <p className="text-[9px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {!user && (
          <div className="rounded-3xl p-5 text-center mb-4 border border-white/8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(217,70,239,0.06))' }}>
            <h2 className="font-orbitron font-bold text-base text-white mb-2">প্রস্তুত তো? 🔥</h2>
            <p className="text-gray-400 text-xs mb-4">হাজারো খেলোয়াড়ের সাথে প্রতিযোগিতা করো।</p>
            <Link to="/register" className="btn-primary inline-block text-sm px-6 py-2.5">
              ⚔️ যোগ দিন — বিনামূল্যে!
            </Link>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
