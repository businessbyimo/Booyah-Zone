import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiSwordLine, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import api from '../utils/api.js';
import PageTransition from '../components/PageTransition.jsx';
import { format } from 'date-fns';

const statusLabel = { pending:'অপেক্ষমান', approved:'অনুমোদিত', rejected:'বাতিল', checked_in:'চেক-ইন', completed:'সম্পন্ন' };

export default function AccountTournaments() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/my-tournaments').then(r => setList(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/account')} className="p-2 rounded-xl border border-white/10 text-gray-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}><RiArrowLeftLine className="text-lg" /></button>
          <h2 className="font-orbitron font-bold text-sm text-white">আমার টুর্নামেন্ট</h2>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl shimmer" />)}</div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <RiSwordLine className="text-5xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">এখনো কোনো টুর্নামেন্টে যোগ দেননি</p>
            <Link to="/tournaments" className="btn-primary text-sm px-6 py-2.5 inline-block">টুর্নামেন্ট দেখুন</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/tournament/${t.tournament_id || t.id}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-white/8 hover:bg-white/3 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.tournament_name || t.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {t.registered_at ? format(new Date(t.registered_at), 'dd MMM, yyyy') : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge-${t.status}`}>{statusLabel[t.status] || t.status}</span>
                    <RiArrowRightLine className="text-gray-500 text-sm" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
