import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowLeftLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import api from '../utils/api.js';
import PageTransition from '../components/PageTransition.jsx';
import { format } from 'date-fns';

const typeLabel = { deposit:'ডিপোজিট', withdrawal:'উইথড্র', fee:'এন্ট্রি ফি', prize:'পুরস্কার' };
const typeColor = { deposit:'#10b981', withdrawal:'#ef4444', fee:'#f59e0b', prize:'#d946ef' };
const typeIcon = { deposit:'💰', withdrawal:'📤', fee:'🎟️', prize:'🏆' };
const statusLabel = { pending:'অপেক্ষমান', approved:'অনুমোদিত', rejected:'বাতিল', failed:'ব্যর্থ' };

export default function AccountTransactions() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/transactions').then(r => setList(r.data?.transactions || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/account')} className="p-2 rounded-xl border border-white/10 text-gray-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}><RiArrowLeftLine className="text-lg" /></button>
          <h2 className="font-orbitron font-bold text-sm text-white">ট্রানজেকশন হিস্টোরি</h2>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_,i)=><div key={i} className="h-14 rounded-2xl shimmer"/>)}</div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <RiMoneyDollarCircleLine className="text-5xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">কোনো ট্রানজেকশন নেই</p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/8"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${typeColor[t.type]}15`, border: `1px solid ${typeColor[t.type]}25` }}>
                  {typeIcon[t.type] || '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{typeLabel[t.type] || t.type}</p>
                  <p className="text-[10px] text-gray-500">{t.method || ''} · {format(new Date(t.created_at), 'dd MMM, HH:mm')}</p>
                </div>
                <div className="text-right">
                  <p className="font-rajdhani font-bold text-base" style={{ color: typeColor[t.type] }}>
                    {t.type === 'withdrawal' || t.type === 'fee' ? '-' : '+'}৳{Number(t.amount).toFixed(2)}
                  </p>
                  <span className={`badge-${t.status} text-[9px]`}>{statusLabel[t.status] || t.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
