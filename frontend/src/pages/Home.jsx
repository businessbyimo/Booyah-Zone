import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiUsers, FiTrendingUp, FiDollarSign, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { GiTrophy, GiCrossedSwords } from 'react-icons/gi';
import api from '../utils/api.js';
import HeroSection from '../components/HeroSection.jsx';
import TournamentCard from '../components/TournamentCard.jsx';
import PageTransition from '../components/PageTransition.jsx';

gsap.registerPlugin(ScrollTrigger);

const StatCard = ({ icon, label, value, color }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
      className="card neon-border text-center">
      <div className={`text-4xl mb-2 ${color}`}>{icon}</div>
      <motion.p className="text-3xl font-orbitron font-bold text-white"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
        {value}
      </motion.p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </motion.div>
  );
};

export default function Home() {
  const [upcoming, setUpcoming] = useState([]);
  const [top5, setTop5] = useState([]);
  const [stats, setStats] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/tournaments/upcoming'),
      api.get('/leaderboard/top5'),
      api.get('/public/stats'),
      api.get('/public/announcements'),
    ]).then(([t, lb, st, an]) => {
      setUpcoming(t.data);
      setTop5(lb.data);
      setStats(st.data);
      setAnnouncements(an.data);
    }).catch(() => {});
  }, []);

  const prev = () => setCarouselIdx(i => Math.max(0, i - 1));
  const next = () => setCarouselIdx(i => Math.min(upcoming.length - 1, i + 1));

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];
  const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <PageTransition>
      {/* Hero */}
      <HeroSection />

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-6 bg-dark-800/50 border-y border-cyan-500/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <span className="flex-shrink-0 px-3 py-1 bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-orbitron font-bold rounded">📢 NEWS</span>
              <div className="overflow-hidden whitespace-nowrap">
                <motion.div
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="inline-block text-gray-300 text-sm"
                >
                  {announcements.map((a, i) => (
                    <span key={a.id} className="mr-16">⚡ {a.title}: {a.content.replace(/<[^>]*>/g, '')}</span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={<FiUsers />} label="Total Players" value={stats.totalUsers?.toLocaleString() || '0'} color="text-cyan-400" />
          <StatCard icon={<GiCrossedSwords />} label="Total Tournaments" value={stats.totalTournaments?.toLocaleString() || '0'} color="text-fuchsia-400" />
          <StatCard icon={<FiDollarSign />} label="Prizes Distributed" value={`৳${Number(stats.totalPrizes || 0).toLocaleString()}`} color="text-yellow-400" />
        </div>
      </section>

      {/* Upcoming Tournaments Carousel */}
      {upcoming.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">⚔️ Upcoming Tournaments</h2>
              <p className="text-gray-400">Register now before slots fill up!</p>
            </div>
            <Link to="/tournaments" className="btn-secondary text-sm">View All</Link>
          </div>
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                animate={{ x: `-${carouselIdx * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex"
              >
                {upcoming.map((t, i) => (
                  <div key={t.id} className="min-w-full sm:min-w-[50%] lg:min-w-[33.333%] px-2">
                    <TournamentCard tournament={t} index={i} />
                  </div>
                ))}
              </motion.div>
            </div>
            {upcoming.length > 1 && (
              <div className="flex justify-center space-x-3 mt-6">
                <button onClick={prev} disabled={carouselIdx === 0} className="p-2 rounded-lg bg-dark-700 border border-dark-500 hover:border-cyan-500 disabled:opacity-30 transition-all">
                  <FiChevronLeft className="text-white" />
                </button>
                {upcoming.map((_, i) => (
                  <button key={i} onClick={() => setCarouselIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === carouselIdx ? 'bg-cyan-400 w-4' : 'bg-dark-500'}`} />
                ))}
                <button onClick={next} disabled={carouselIdx >= upcoming.length - 1} className="p-2 rounded-lg bg-dark-700 border border-dark-500 hover:border-cyan-500 disabled:opacity-30 transition-all">
                  <FiChevronRight className="text-white" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Top 5 Leaderboard */}
      {top5.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">🏆 Top Players</h2>
              <p className="text-gray-400">Hall of Fame — Champions of FF Arena</p>
            </div>
            <Link to="/leaderboard" className="btn-secondary text-sm">Full Board</Link>
          </div>
          <div className="card neon-border">
            {top5.map((player, i) => (
              <motion.div key={player.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-4 ${i < top5.length - 1 ? 'border-b border-dark-600' : ''} hover:bg-dark-700/50 transition-colors rounded-lg`}>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl w-8 text-center">{rankEmojis[i]}</span>
                  {player.avatar ? (
                    <img src={player.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/50" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-orbitron font-bold text-sm ${i === 0 ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : i === 1 ? 'border-gray-300 bg-gray-300/10 text-gray-300' : 'border-orange-400 bg-orange-400/10 text-orange-400'}`}>
                      {player.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{player.username}</p>
                    {player.free_fire_id && <p className="text-xs text-gray-500">ID: {player.free_fire_id}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-orbitron font-bold text-xl ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-cyan-400'}`}>
                    {player.total_points.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden p-12 text-center bg-gradient-to-br from-cyan-600/20 via-dark-700 to-fuchsia-600/20 border border-cyan-500/30">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <h2 className="font-orbitron font-bold text-4xl text-white mb-4 relative z-10">Ready to Dominate?</h2>
          <p className="text-gray-300 text-xl mb-8 relative z-10">Join thousands of players competing for real cash prizes.</p>
          <div className="flex justify-center gap-4 relative z-10">
            <Link to="/register" className="btn-primary text-lg px-10 py-4">Join Now — It's Free!</Link>
          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
}
