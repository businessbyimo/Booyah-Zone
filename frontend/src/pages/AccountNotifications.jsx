import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowLeftLine, RiBellLine, RiCheckDoubleLine } from 'react-icons/ri';
import api from '../utils/api.js';
import PageTransition from '../components/PageTransition.jsx';
import { format } from 'date-fns';

export default function AccountNotifications() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => {
      setList(r.data?.notifications || []);
      if (r.data?.unreadCount > 0) api.put('/notifications/read-all').catch(() => {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/account')} className="p-2 rounded-xl border border-white/10 text-gray-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}><RiArrowLeftLine className="text-lg" /></button>
          <h2 className="font-orbitron font-bold text-sm text-white">নোটিফিকেশন</h2>
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <RiCheckDoubleLine className="text-cyan-400" />সব পড়া হয়েছে
          </span>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="h-16 rounded-2xl shimmer"/>)}</div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <RiBellLine className="text-5xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">কোনো নোটিফিকেশন নেই</p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="p-3.5 rounded-2xl border border-white/8"
                style={{ background: n.is_read ? 'rgba(255,255,255,0.03)' : 'rgba(34,211,238,0.05)', borderColor: n.is_read ? 'rgba(255,255,255,0.08)' : 'rgba(34,211,238,0.15)' }}>
                <div className="flex items-start gap-2">
                  {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />}
                  <div>
                    <p className="font-semibold text-white text-sm">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{format(new Date(n.created_at), 'dd MMM, HH:mm')}</p>
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
