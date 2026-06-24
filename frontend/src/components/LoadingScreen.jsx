import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#050510' }}
    >
      <div className="relative flex items-center justify-center mb-8">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 140, height: 140,
            border: '1.5px solid transparent',
            borderTopColor: '#22d3ee',
            borderRightColor: 'rgba(34,211,238,0.2)',
            borderBottomColor: 'transparent',
            borderLeftColor: 'rgba(34,211,238,0.1)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 110, height: 110,
            border: '1px solid transparent',
            borderTopColor: 'transparent',
            borderRightColor: 'rgba(217,70,239,0.5)',
            borderBottomColor: '#d946ef',
            borderLeftColor: 'rgba(217,70,239,0.2)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className="relative z-10"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.35)) drop-shadow(0 0 40px rgba(217,70,239,0.2))',
          }}
        >
          <img
            src="/logo-nobg.png"
            alt="BooyahZone"
            className="h-16 w-auto"
          />
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-orbitron font-bold text-sm tracking-[0.2em] text-white/80 uppercase mb-1"
      >
        BooyahZone
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-[10px] tracking-widest uppercase mb-8"
        style={{ color: 'rgba(34,211,238,0.5)' }}
      >
        লোড হচ্ছে...
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
        className="w-32 h-px rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.08)', transformOrigin: 'left' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #22d3ee, #d946ef)' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.5 }}
        />
      </motion.div>
    </motion.div>
  );
}
