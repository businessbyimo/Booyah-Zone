import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  RiSwordLine, RiTrophyLine, RiShieldCheckLine, RiLiveLine, RiTeamLine,
  RiMoneyDollarCircleLine, RiFlashlightLine, RiLoginBoxLine,
  RiUserAddLine, RiGamepadLine,
} from 'react-icons/ri';
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

const STAT_ITEMS = [
  { icon: RiTeamLine, label: 'খেলোয়াড়', suffix: '+', color: '#22d3ee' },
  { icon: RiSwordLine, label: 'টুর্নামেন্ট', suffix: '', color: '#d946ef' },
  { icon: RiMoneyDollarCircleLine, label: 'পুরস্কার (৳)', suffix: '+', color: '#f59e0b' },
];

const FEATURES = [
  { icon: RiMoneyDollarCircleLine, title: 'রিয়েল ক্যাশ', desc: 'সরাসরি ওয়ালেটে পুরস্কার', color: '#22d3ee' },
  { icon: RiShieldCheckLine, title: 'নিরাপদ পেমেন্ট', desc: 'bKash, Nagad, Rocket', color: '#d946ef' },
  { icon: RiLiveLine, title: 'রিয়েল-টাইম', desc: 'লাইভ আপডেট ও স্কোর', color: '#f59e0b' },
  { icon: RiTeamLine, title: 'Squad মোড', desc: 'Solo, Duo, Squad সব', color: '#10b981' },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalTournaments: 0, totalPrizes: 0 });
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    api.get('/public/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/tournaments/upcoming').then(r => setTournaments(r.data?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <div className="absolute inset-0 hero-bg opacity-60" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10">
        {/* Navbar */}
        <div className="flex items-center justify-between px-5 py-4">
          <img src="/logo-nobg.png" alt="BooyahZone" className="h-9 w-auto"
            onError={e => { e.target.style.display = 'none'; }} />
          <div className="flex gap-2">
            <Link to="/login"
              className="text-xs font-medium text-gray-400 border border-white/10 px-4 py-2 rounded-xl hover:border-white/20 hover:text-white transition-all">
              লগইন
            </Link>
            <Link to="/register"
              className="text-xs font-semibold text-black px-4 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
              রেজিস্টার
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="px-5 pt-8 pb-10 text-center max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <img src="/logo-nobg.png" alt="BooyahZone" className="h-24 w-auto mx-auto mb-5 float-anim"
              onError={e => { e.target.style.display = 'none'; }} />

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-medium"
              style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.18)', color: '#67e8f9' }}>
              <RiGamepadLine className="text-sm" />
              বাংলাদেশ · ফ্রি ফায়ার টুর্নামেন্ট
            </div>

            <h1 className="font-orbitron font-black text-2xl text-white mb-3 leading-tight">
              <TypeWriter />
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              রেজিস্টার করুন, প্রতিযোগিতা করুন এবং{' '}
              <span className="text-amber-400 font-semibold">রিয়েল ক্যাশ পুরস্কার</span> জিতুন।
              হাজারো খেলোয়াড়ের সাথে লড়াই করুন!
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link to="/register">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-bold text-black text-sm flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                    boxShadow: '0 8px 32px rgba(34,211,238,0.25)',
                  }}>
                  <RiUserAddLine className="text-base" />
                  এখনই রেজিস্টার করুন — বিনামূল্যে!
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all"
                  style={{ borderColor: 'rgba(217,70,239,0.3)', color: '#c084fc', background: 'rgba(217,70,239,0.06)' }}>
                  <RiLoginBoxLine className="text-base" />
                  লগইন করুন
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="px-5 pb-8">
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {STAT_ITEMS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-2xl p-3 text-center border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <s.icon className="text-xl mx-auto mb-1.5" style={{ color: s.color }} />
                <p className="font-rajdhani font-black text-xl text-white leading-none">
                  <CountUp to={Number([stats.totalUsers, stats.totalTournaments, stats.totalPrizes][i]) || 0} />
                  {s.suffix}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-5 pb-8 max-w-lg mx-auto">
          <h2 className="font-orbitron font-bold text-xs text-gray-500 mb-4 text-center uppercase tracking-widest">
            কেন BooyahZone?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.07 }}
                className="rounded-2xl p-4 border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                  <f.icon className="text-base" style={{ color: f.color }} />
                </div>
                <p className="font-semibold text-white text-xs mb-0.5">{f.title}</p>
                <p className="text-[10px] text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Upcoming tournaments */}
        {tournaments.length > 0 && (
          <section className="px-5 pb-10 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <RiSwordLine className="text-cyan-400 text-sm" />
                <h2 className="font-orbitron font-bold text-sm text-white">আসন্ন টুর্নামেন্ট</h2>
              </div>
              <Link to="/login" className="text-xs text-cyan-400">সব দেখুন</Link>
            </div>
            <div className="space-y-2">
              {tournaments.map((t, i) => (
                <motion.div key={t.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <RiTrophyLine className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-600">পুরস্কার: ৳{Number(t.prize_pool).toLocaleString()}</p>
                  </div>
                  <Link to="/login"
                    className="text-[10px] font-semibold text-black px-3 py-1.5 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                    যোগ দিন
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-2xl text-center border border-white/[0.06]"
              style={{ background: 'rgba(34,211,238,0.04)' }}>
              <p className="text-sm text-gray-400 mb-3">সব টুর্নামেন্ট দেখতে এবং যোগ দিতে লগইন করুন</p>
              <Link to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl text-black"
                style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                <RiLoginBoxLine />
                লগইন করুন
              </Link>
            </div>
          </section>
        )}

        {/* CTA Bottom */}
        <div className="px-5 pb-16 text-center max-w-lg mx-auto">
          <div className="rounded-2xl p-6 border border-white/[0.06] relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #22d3ee, transparent 70%)' }} />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RiFlashlightLine className="text-amber-400 text-lg" />
                <h2 className="font-orbitron font-bold text-base text-white">প্রস্তুত?</h2>
              </div>
              <p className="text-gray-500 text-sm mb-5">এখনই যোগ দিন — সম্পূর্ণ বিনামূল্যে!</p>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-black rounded-xl"
                style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', boxShadow: '0 6px 24px rgba(34,211,238,0.2)' }}>
                <RiSwordLine />
                এখনই শুরু করুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
