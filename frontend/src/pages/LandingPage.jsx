import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { RiSwordLine, RiTrophyLine, RiShieldCheckLine, RiLiveLine, RiTeamLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import api from '../utils/api.js';

const TYPING = ['চূড়ান্ত যুদ্ধে যোগ দিন', 'রিয়েল ক্যাশ পুরস্কার জিতুন', 'ফ্রি ফায়ার চ্যাম্পিয়ন হোন', 'শীর্ষে উঠুন'];

function CountUp({ to, duration = 1500 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.floor(to * progress));
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{val.toLocaleString()}</span>;
}

function TypeWriter() {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const str = TYPING[idx];
    const speed = deleting ? 30 : 70;
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(str.slice(0, charIdx + 1));
        if (charIdx + 1 === str.length) setTimeout(() => setDeleting(true), 1800);
        else setCharIdx(c => c + 1);
      } else {
        setText(str.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setIdx(i => (i + 1) % TYPING.length); }
        else setCharIdx(c => c - 1);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, idx]);

  return (
    <span className="text-cyan-400 font-orbitron">
      {text}<span className="animate-pulse text-fuchsia-400">|</span>
    </span>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalTournaments: 0, totalPrizes: 0 });
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    api.get('/public/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/tournaments/upcoming').then(r => setTournaments(r.data?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen app-bg">
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <img src="/logo-nobg.png" alt="BooyahZone" className="h-10 w-auto"
            onError={e => { e.target.style.display = 'none'; }} />
          <div className="flex gap-2">
            <Link to="/login" className="text-xs font-semibold text-gray-300 border border-white/20 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
              লগইন
            </Link>
            <Link to="/register" className="text-xs font-bold text-black px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
              রেজিস্টার
            </Link>
          </div>
        </div>

        <section className="px-5 pt-8 pb-10 text-center max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <img src="/logo-nobg.png" alt="BooyahZone" className="h-24 w-auto mx-auto mb-5 float-anim"
              onError={e => { e.target.style.display = 'none'; }} />

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold"
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', color: '#67e8f9' }}>
              🎮 বাংলাদেশ · ফ্রি ফায়ার টুর্নামেন্ট
            </div>

            <h1 className="font-orbitron font-black text-2xl text-white mb-3 leading-tight">
              <TypeWriter />
            </h1>

            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              রেজিস্টার করুন, প্রতিযোগিতা করুন এবং{' '}
              <span className="text-yellow-400 font-bold">রিয়েল ক্যাশ পুরস্কার</span> জিতুন।
              হাজারো খেলোয়াড়ের সাথে লড়াই করুন!
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link to="/register">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-bold text-black text-sm"
                  style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', boxShadow: '0 8px 32px rgba(34,211,238,0.35)' }}>
                  ⚔️ এখনই রেজিস্টার করুন — বিনামূল্যে!
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm border"
                  style={{ borderColor: 'rgba(217,70,239,0.5)', color: '#e879f9', background: 'rgba(217,70,239,0.08)' }}>
                  🔑 লগইন করুন
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="px-5 pb-8">
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              { icon: '👥', label: 'খেলোয়াড়', value: stats.totalUsers, suffix: '+' },
              { icon: '⚔️', label: 'টুর্নামেন্ট', value: stats.totalTournaments, suffix: '' },
              { icon: '💰', label: 'পুরস্কার (৳)', value: stats.totalPrizes, suffix: '+' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="rounded-2xl p-3 text-center border border-white/8"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="font-rajdhani font-black text-xl text-white">
                  <CountUp to={Number(s.value) || 0} />{s.suffix}
                </p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-5 pb-8 max-w-lg mx-auto">
          <h2 className="font-orbitron font-bold text-sm text-white mb-4 text-center">কেন BooyahZone?</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: RiMoneyDollarCircleLine, title: 'রিয়েল ক্যাশ', desc: 'সরাসরি ওয়ালেটে পুরস্কার', color: '#22d3ee' },
              { icon: RiShieldCheckLine, title: 'নিরাপদ পেমেন্ট', desc: 'bKash, Nagad, Rocket', color: '#d946ef' },
              { icon: RiLiveLine, title: 'রিয়েল-টাইম', desc: 'লাইভ আপডেট ও স্কোর', color: '#f59e0b' },
              { icon: RiTeamLine, title: 'Squad মোড', desc: 'Solo, Duo, Squad সব', color: '#10b981' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-2xl p-4 border border-white/8"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <f.icon className="text-2xl mb-2" style={{ color: f.color }} />
                <p className="font-semibold text-white text-xs mb-0.5">{f.title}</p>
                <p className="text-[10px] text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {tournaments.length > 0 && (
          <section className="px-5 pb-10 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-orbitron font-bold text-sm text-white">⚔️ আসন্ন টুর্নামেন্ট</h2>
              <Link to="/login" className="text-xs text-cyan-400">সব দেখুন →</Link>
            </div>
            <div className="space-y-2">
              {tournaments.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
                    <RiTrophyLine className="text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-500">পুরস্কার: ৳{Number(t.prize_pool).toLocaleString()}</p>
                  </div>
                  <Link to="/login" className="text-[10px] font-bold text-black px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                    যোগ দিন
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-2xl text-center border border-cyan-400/20"
              style={{ background: 'rgba(34,211,238,0.05)' }}>
              <p className="text-sm text-gray-300 mb-3">সব টুর্নামেন্ট দেখতে এবং যোগ দিতে লগইন করুন</p>
              <Link to="/login" className="btn-primary text-sm px-6 py-2.5 inline-block">
                লগইন করুন →
              </Link>
            </div>
          </section>
        )}

        <div className="px-5 pb-16 text-center max-w-lg mx-auto">
          <div className="rounded-3xl p-6 border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h2 className="font-orbitron font-bold text-lg text-white mb-2">প্রস্তুত তো? 🔥</h2>
            <p className="text-gray-400 text-sm mb-5">এখনই যোগ দিন — সম্পূর্ণ বিনামূল্যে!</p>
            <Link to="/register" className="btn-primary inline-block px-8 py-3 text-sm">
              ⚔️ এখনই শুরু করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
