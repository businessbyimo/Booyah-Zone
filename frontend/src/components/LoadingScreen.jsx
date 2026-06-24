import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center app-bg"
    >
      <div className="relative mb-6 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className="relative z-10"
        >
          <div
            className="absolute rounded-full blur-2xl opacity-60"
            style={{
              inset: '-20px',
              background: 'radial-gradient(circle, rgba(255,107,0,0.6) 0%, rgba(124,58,237,0.4) 100%)',
            }}
          />
          <img
            src="/logo-nobg.png"
            alt="BooyahZone"
            className="relative h-28 w-auto"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          />
        </motion.div>

        <motion.div
          className="absolute rounded-full border-2"
          style={{
            width: 160, height: 160,
            borderColor: 'transparent',
            borderTopColor: '#FF6B00',
            animation: 'spin 2s linear infinite',
          }}
        />
        <motion.div
          className="absolute rounded-full border"
          style={{
            width: 200, height: 200,
            borderColor: 'transparent',
            borderTopColor: '#7C3AED',
            animation: 'spin 3.5s linear infinite reverse',
          }}
        />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-orbitron text-2xl font-black text-white tracking-widest mb-1"
      >
        BOOYAHZONE
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{ color: '#FF8C42', fontSize: '0.7rem' }}
        className="tracking-widest font-semibold mb-10 uppercase"
      >
        Free Fire Tournament Platform
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-40 h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #FF6B00, #7C3AED)' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.0, ease: 'easeInOut', delay: 0.65 }}
        />
      </motion.div>
    </motion.div>
  );
}
