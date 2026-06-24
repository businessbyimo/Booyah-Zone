import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { FiUsers, FiDollarSign, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { GiTrophy, GiCrossedSwords } from 'react-icons/gi';
import api from '../utils/api.js';
import HeroSection from '../components/HeroSection.jsx';
import TournamentCard from '../components/TournamentCard.jsx';
import PageTransition from '../components/PageTransition.jsx';

const StatCard = ({ icon, label, value, gradient }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl"
        style={{ background: gradient + '20', color: gradient.includes('FF6B00') ? '#FF6B00' : gradient.includes('7C3AED') ? '#7C3AED' : '#F59E0B' }}
      >
        {icon}
      </div>
      <p className="text-2xl font-orbitron font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-xs mt-1">{label}</p>
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
  const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <PageTransition>
      <HeroSection />

      {announcements.length > 0 && (
        <div
          className="py-3 overflow-hidden"
          style={{ background: 'linear-gradient(90deg,#FF6B00,#7C3AED)', color: '#fff' }}
        >
          <div className="flex items-center gap-3 px-4">
            <span className="flex-shrink-0 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">📢 সংবাদ</span>
            <div className="overflow-hidden flex-1">
              <motion.div
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                className="inline-block whitespace-nowrap text-sm font-medium"
              >
                {announcements.map(a => (
                  <span key={a.id} className="mr-16">⚡ {a.title}: {a.content.replace(/<[^>]*>/g, '')}</span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 max-w-2xl mx-auto">
        <section className="pt-6 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<FiUsers />} label="মোট খেলোয়াড়" value={stats.totalUsers?.toLocaleString() || '০'} gradient="linear-gradient(135deg,#FF6B00,#FF8C42)" />
            <StatCard icon={<GiCrossedSwords />} label="টুর্নামেন্ট" value={stats.totalTournaments?.toLocaleString() || '০'} gradient="linear-gradient(135deg,#7C3AED,#A855F7)" />
            <StatCard icon={<GiTrophy />} label="পুরস্কার" value={`৳${Number(stats.totalPrizes || 0).toLocaleString()}`} gradient="linear-gradient(135deg,#F59E0B,#FCD34D)" />
          </div>
        </section>

        {upcoming.length > 0 && (
          <section className="py-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-orbitron">⚔️ আসন্ন টুর্নামেন্ট</h2>
                <p className="text-xs text-gray-500 mt-0.5">স্লট শেষ হওয়ার আগেই রেজিস্টার করুন!</p>
              </div>
              <Link to="/tournaments" className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-xl">সব দেখুন</Link>
            </div>

            <div className="overflow-hidden rounded-2xl">
              <motion.div
                animate={{ x: `-${carouselIdx * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex"
              >
                {upcoming.map((t, i) => (
                  <div key={t.id} className="min-w-full px-0.5">
                    <TournamentCard tournament={t} index={i} />
                  </div>
                ))}
              </motion.div>
            </div>

            {upcoming.length > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={prev}
                  disabled={carouselIdx === 0}
                  className="p-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-30 shadow-sm"
                >
                  <FiChevronLeft className="text-gray-600 text-sm" />
                </button>
                {upcoming.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIdx(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: i === carouselIdx ? 20 : 8,
                      height: 8,
                      background: i === carouselIdx ? '#FF6B00' : '#E5E7EB',
                    }}
                  />
                ))}
                <button
                  onClick={next}
                  disabled={carouselIdx >= upcoming.length - 1}
                  className="p-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-30 shadow-sm"
                >
                  <FiChevronRight className="text-gray-600 text-sm" />
                </button>
              </div>
            )}
          </section>
        )}

        {top5.length > 0 && (
          <section className="py-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-orbitron">🏆 শীর্ষ খেলোয়াড়</h2>
                <p className="text-xs text-gray-500 mt-0.5">BooyahZone চ্যাম্পিয়নরা</p>
              </div>
              <Link to="/leaderboard" className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-xl">সম্পূর্ণ</Link>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {top5.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center justify-between px-4 py-3 ${i < top5.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-7 text-center">{rankEmojis[i]}</span>
                    {player.avatar ? (
                      <img src={player.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-orange-200" />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-orbitron font-bold text-sm text-white"
                        style={{ background: i === 0 ? 'linear-gradient(135deg,#F59E0B,#FCD34D)' : i === 1 ? 'linear-gradient(135deg,#9CA3AF,#D1D5DB)' : i === 2 ? 'linear-gradient(135deg,#FF6B00,#FF8C42)' : 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
                      >
                        {player.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{player.username}</p>
                      {player.free_fire_id && <p className="text-[11px] text-gray-400">ID: {player.free_fire_id}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-orbitron font-bold text-base" style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#FF6B00' : '#7C3AED' }}>
                      {player.total_points.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">পয়েন্ট</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="py-5 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-6 text-center overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg,#1a1a2e,#0f3460,#533483)' }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%,#FF6B00 0%,transparent 60%)' }}
            />
            <h2 className="font-orbitron font-bold text-xl text-white mb-2 relative z-10">প্রস্তুত তো? 🔥</h2>
            <p className="text-gray-400 text-sm mb-5 relative z-10">হাজারো খেলোয়াড়ের সাথে প্রতিযোগিতা করো।</p>
            <Link
              to="/register"
              className="inline-block font-bold text-white px-8 py-3 rounded-2xl text-sm relative z-10"
              style={{ background: 'linear-gradient(135deg,#FF6B00,#FF8C42)', boxShadow: '0 8px 24px rgba(255,107,0,0.4)' }}
            >
              এখনই যোগ দিন — বিনামূল্যে!
            </Link>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
}
