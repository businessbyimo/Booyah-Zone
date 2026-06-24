import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const steps = [
      { delay: 200, progress: 30, phase: 1 },
      { delay: 800, progress: 65, phase: 2 },
      { delay: 1500, progress: 90, phase: 3 },
      { delay: 2200, progress: 100, phase: 4 },
    ];

    const timers = steps.map(({ delay, progress, phase }) =>
      setTimeout(() => {
        setProgress(progress);
        setPhase(phase);
      }, delay)
    );

    const doneTimer = setTimeout(() => onDone?.(), 2800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center hero-bg"
    >
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative flex flex-col items-center justify-center gap-8 px-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(circle, #22d3ee, #d946ef)', transform: 'scale(1.5)' }} />

          <motion.div
            animate={{ boxShadow: ['0 0 30px rgba(34,211,238,0.4)', '0 0 60px rgba(217,70,239,0.4)', '0 0 30px rgba(34,211,238,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative rounded-3xl p-1"
          >
            <img
              src="/logo-nobg.png"
              alt="BooyahZone"
              className="h-28 w-auto relative z-10 float-anim"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="font-orbitron font-black text-3xl text-gradient-rainbow mb-1">
            BooyahZone
          </h1>
          <p className="text-gray-400 text-sm">বাংলাদেশের সেরা ফ্রি ফায়ার প্ল্যাটফর্ম</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-48"
        >
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            {phase === 1 && 'লোড হচ্ছে...'}
            {phase === 2 && 'সংযোগ স্থাপন হচ্ছে...'}
            {phase === 3 && 'প্রস্তুত হচ্ছে...'}
            {phase >= 4 && 'চলুন শুরু করি! 🎮'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          className="flex gap-3"
        >
          {['⚔️', '🏆', '💰', '🎮'].map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: phase >= 3 ? 1 : 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
              className="text-2xl"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
