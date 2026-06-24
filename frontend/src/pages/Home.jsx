import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiTrophyLine, RiUserLine, RiArrowRightLine, RiLiveLine, RiMegaphoneLine,
  RiTeamLine, RiSwordLine, RiMoneyDollarCircleLine, RiFlashlightLine,
} from 'react-icons/ri';
import api from '../utils/api.js';
import TournamentCard from '../components/TournamentCard.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

const rankColors = ['#f59e0b', '#9ca3af', '#cd7c3a', '#22d3ee', '#d946ef'];
const rankBg = [
  'rgba(245,158,11,0.1)',
  'rgba(156,163,175,0.08)',
  'rgba(205,124,58,0.1)',
  'rgba(34,211,238,0.1)',
  'rgba(217,70,239,0.1)',
];

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

  const STAT_ITEMS = [
    { icon: RiTeamLine, label: 'খেলোয়াড়', value: stats.totalUsers?.toLocaleString() || '০', color: '#22d3ee' },
    { icon: RiSwordLine, label: 'টুর্নামেন্ট', value: stats.totalTournaments?.toLocaleString() || '০', color: '#d946ef' },
    { icon: RiMoneyDollarCircleLine, label: 'পুরস্কার', value: `৳${Number(stats.totalPrizes || 0).toLocaleString()}`, color: '#f59e0b' },
  ];

  return (
    <PageTransition>
      <div className="px-4 max-w-lg mx-auto pb-2">
        {user && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-4 mt-2 relative overflow-hidden border border-white/[0.07]"
            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.07), rgba(217,70,239,0.05))' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15"
              style={{ background: 'radial-gradient(circle, #22d3ee, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl border border-cyan-400/20 overflow-hidden bg-dark-600 flex items-center justify-center flex-shrink-0">
                {user.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : <RiUserLine className="text-cyan-400 text-xl" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">স্বাগতম ফিরে</p>
                <h2 className="font-orbitron font-bold text-white text-sm truncate mt-0.5">
                  {user.username}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-amber-400 font-rajdhani font-bold">৳{Number(user.balance || 0).toFixed(2)}</span>
                  <span className="text-xs text-cyan-400 font-rajdhani font-bold flex items-center gap-1">
                    <RiTrophyLine className="text-xs" /> {user.total_points || 0} pts
                  </span>
                </div>
              </div>
              <Link to="/deposit"
                className="text-xs font-semibold px-3 py-2 rounded-xl flex-shrink-0 transition-all"
                style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}>
                + ডিপোজিট
              </Link>
            </div>
          </motion.div>
        )}

        {announcements.length > 0 && (
          <div className="rounded-xl mb-4 overflow-hidden"
            style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.12)' }}>
            <div className="flex items-center gap-2 px-3 py-2">
              <RiMegaphoneLine className="text-cyan-400/70 flex-shrink-0 text-sm" />
              <div className="overflow-hidden flex-1">
                <div className="whitespace-nowrap animate-[ticker_20s_linear_infinite] inline-block text-xs text-gray-400">
                  {announcements.map(a => (
                    <span key={a.id} className="mr-12">
                      <RiFlashlightLine className="inline text-amber-400 mr-1 text-xs" />
                      {a.title}: {a.content?.replace(/<[^>]*>/g, '')}
                    </span>
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
              <Link to="/tournaments?status=ongoing" className="text-xs text-green-400">সব দেখুন</Link>
            </div>
            <div className="space-y-2">
              {liveT.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.18)' }}>
                  <div className="w-2 h-2 rounded-full bg-green-400 live-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-500">{t.current_participants}/{t.max_participants} জন</p>
                  </div>
                  <Link to={`/tournament/${t.id}`}
                    className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
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
                <div className="flex items-center gap-1.5">
                  <RiSwordLine className="text-cyan-400 text-sm" />
                  <h2 className="font-orbitron font-bold text-sm text-white">আসন্ন টুর্নামেন্ট</h2>
                </div>
                <p className="text-[10px] text-gray-600 mt-0.5">স্লট শেষ হওয়ার আগেই রেজিস্টার করুন</p>
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
                    style={{
                      width: i === carouselIdx ? 20 : 6,
                      height: 6,
                      background: i === carouselIdx ? '#22d3ee' : 'rgba(255,255,255,0.12)',
                    }} />
                ))}
              </div>
            )}
          </section>
        )}

        {top5.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <RiTrophyLine className="text-amber-400 text-sm" />
                <div>
                  <h2 className="font-orbitron font-bold text-sm text-white">শীর্ষ খেলোয়াড়</h2>
                </div>
              </div>
              <Link to="/leaderboard" className="flex items-center gap-1 text-xs text-cyan-400">
                সম্পূর্ণ <RiArrowRightLine />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: '#0d0d1a' }}>
              {top5.map((player, i) => (
                <motion.div key={player.id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className={`flex items-center gap-3 px-4 py-3 ${i < top5.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                  <div className="w-5 text-center">
                    {i === 0 && <RiTrophyLine style={{ color: '#f59e0b', fontSize: 16 }} />}
                    {i === 1 && <RiTrophyLine style={{ color: '#9ca3af', fontSize: 16 }} />}
                    {i === 2 && <RiTrophyLine style={{ color: '#cd7c3a', fontSize: 16 }} />}
                    {i >= 3 && <span className="font-orbitron font-bold text-[10px]" style={{ color: '#4b5563' }}>#{i+1}</span>}
                  </div>
                  {player.avatar
                    ? <img src={player.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
                    : <div className="w-8 h-8 rounded-xl flex items-center justify-center font-orbitron font-bold text-xs flex-shrink-0"
                        style={{ background: rankBg[i], border: `1px solid ${rankColors[i]}20`, color: rankColors[i] }}>
                        {player.username?.[0]?.toUpperCase()}
                      </div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{player.username}</p>
                    {player.free_fire_id && <p className="text-[10px] text-gray-600">FF: {player.free_fire_id}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-rajdhani font-bold text-base" style={{ color: rankColors[i] }}>
                      {player.total_points?.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-600">পয়েন্ট</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-4">
          <div className="grid grid-cols-3 gap-3">
            {STAT_ITEMS.map((s, i) => (
              <div key={i} className="rounded-2xl p-3 text-center border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <s.icon className="text-xl mx-auto mb-1.5" style={{ color: s.color }} />
                <p className="font-rajdhani font-black text-lg text-white leading-none">{s.value}</p>
                <p className="text-[9px] text-gray-600 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {!user && (
          <div className="rounded-2xl p-5 text-center mb-4 border border-white/[0.06] relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.07), rgba(217,70,239,0.05))' }}>
            <div className="absolute inset-0 opacity-10"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #22d3ee, transparent 70%)' }} />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RiFlashlightLine className="text-amber-400 text-lg" />
                <h2 className="font-orbitron font-bold text-sm text-white">প্রস্তুত?</h2>
              </div>
              <p className="text-gray-500 text-xs mb-4">হাজারো খেলোয়াড়ের সাথে প্রতিযোগিতায় অংশ নিন।</p>
              <Link to="/register"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #22d3ee, #0891b2)', color: '#000' }}>
                <RiSwordLine />
                বিনামূল্যে যোগ দিন
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
