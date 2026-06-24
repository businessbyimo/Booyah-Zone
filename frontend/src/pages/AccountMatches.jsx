import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowLeftLine, RiSwordLine } from 'react-icons/ri';
import api from '../utils/api.js';
import PageTransition from '../components/PageTransition.jsx';

export default function AccountMatches() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/match-history').then(r => setList(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/account')} className="p-2 rounded-xl border border-white/10 text-gray-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}><RiArrowLeftLine className="text-lg" /></button>
          <h2 className="font-orbitron font-bold text-sm text-white">ম্যাচ হিস্টোরি</h2>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl shimmer" />)}</div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <RiSwordLine className="text-5xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">এখনো কোনো ম্যাচ খেলেননি</p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3.5 rounded-2xl border border-white/8"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="font-semibold text-white text-sm mb-2">{m.tournament_name}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <p className="font-rajdhani font-bold text-yellow-400 text-base">#{m.placement}</p>
                    <p className="text-[9px] text-gray-500">প্লেসমেন্ট</p>
                  </div>
                  <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <p className="font-rajdhani font-bold text-green-400 text-base">{m.kill_points}</p>
                    <p className="text-[9px] text-gray-500">কিল</p>
                  </div>
                  <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(34,211,238,0.1)' }}>
                    <p className="font-rajdhani font-bold text-cyan-400 text-base">{m.total_points}</p>
                    <p className="text-[9px] text-gray-500">পয়েন্ট</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
