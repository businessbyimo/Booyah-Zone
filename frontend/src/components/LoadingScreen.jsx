import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <motion.div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-transparent border-t-fuchsia-400 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="font-orbitron text-cyan-400 text-sm tracking-widest">LOADING</p>
      </motion.div>
    </div>
  );
}
