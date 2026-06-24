import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TYPING_STRINGS = [
  'চূড়ান্ত যুদ্ধে যোগ দিন',
  'রিয়েল ক্যাশ পুরস্কার জিতুন',
  'ফ্রি ফায়ার চ্যাম্পিয়ন হোন',
  'শীর্ষে উঠুন',
];

export default function HeroSection() {
  const [typedText, setTypedText] = useState('');
  const [strIndex, setStrIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const str = TYPING_STRINGS[strIndex];
    const speed = deleting ? 35 : 75;
    const timer = setTimeout(() => {
      if (!deleting) {
        setTypedText(str.slice(0, charIndex + 1));
        if (charIndex + 1 === str.length) setTimeout(() => setDeleting(true), 1800);
        else setCharIndex(c => c + 1);
      } else {
        setTypedText(str.slice(0, charIndex - 1));
        if (charIndex - 1 === 0) {
          setDeleting(false);
          setStrIndex(s => (s + 1) % TYPING_STRINGS.length);
        } else setCharIndex(c => c - 1);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, deleting, strIndex]);

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center overflow-hidden"
      style={{
        minHeight: '88vh',
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 75%, #533483 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #FF6B00 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7C3AED 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,107,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 px-4 max-w-xl mx-auto pt-20 pb-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
          className="mb-5"
        >
          <div
            className="absolute rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{
              width: 200, height: 200,
              background: 'radial-gradient(circle,#FF6B00,#7C3AED)',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-60%)',
            }}
          />
          <img
            src="/logo-nobg.png"
            alt="BooyahZone"
            className="h-28 w-auto mx-auto relative drop-shadow-2xl"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-semibold tracking-wider"
          style={{ background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', color: '#FF8C42' }}
        >
          🎮 ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম · বাংলাদেশ
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="h-12 flex items-center justify-center mb-4"
        >
          <h2 className="font-rajdhani text-xl sm:text-2xl font-semibold text-white/90">
            {typedText}
            <span className="animate-pulse" style={{ color: '#FF6B00' }}>|</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-gray-400 text-sm sm:text-base mb-8 leading-relaxed"
        >
          রেজিস্টার করুন, প্রতিযোগিতা করুন এবং{' '}
          <span className="font-bold" style={{ color: '#FFB347' }}>রিয়েল ক্যাশ পুরস্কার</span>{' '}
          জিতুন!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/register">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto font-bold text-white px-8 py-3.5 rounded-2xl text-sm tracking-wide shadow-lg"
              style={{ background: 'linear-gradient(135deg,#FF6B00,#FF8C42)', boxShadow: '0 8px 24px rgba(255,107,0,0.4)' }}
            >
              ⚔️ এখনই রেজিস্টার করুন
            </motion.button>
          </Link>
          <Link to="/tournaments">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto font-bold px-8 py-3.5 rounded-2xl text-sm tracking-wide transition-all"
              style={{ border: '2px solid rgba(124,58,237,0.7)', color: '#C084FC', background: 'rgba(124,58,237,0.1)' }}
            >
              🏆 টুর্নামেন্ট দেখুন
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background: 'linear-gradient(to bottom, transparent, #F2F4F7)' }}
      />
    </section>
  );
}
