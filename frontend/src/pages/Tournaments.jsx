import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RiSearchLine, RiFilterLine } from 'react-icons/ri';
import api from '../utils/api.js';
import TournamentCard from '../components/TournamentCard.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { useSocket } from '../context/SocketContext.jsx';

const FILTERS = [
  { value: '', label: 'সব' },
  { value: 'upcoming', label: '🕐 আসন্ন' },
  { value: 'ongoing', label: '🔴 চলমান' },
  { value: 'completed', label: '✅ সম্পন্ন' },
  { value: 'cancelled', label: '❌ বাতিল' },
];
const LIMIT = 10;

export default function Tournaments() {
  const { onEvent } = useSocket() || {};
  const [tournaments, setTournaments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: LIMIT });
      if (search) p.set('search', search);
      if (status) p.set('status', status);
      const res = await api.get(`/tournaments?${p}`);
      setTournaments(res.data.tournaments || []);
      setTotal(res.data.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  useEffect(() => {
    if (!onEvent) return;
    const off = onEvent('tournament:updated', fetchTournaments);
    return off;
  }, [onEvent, fetchTournaments]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatus = (v) => { setStatus(v); setPage(1); };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="mb-4">
          <div className="relative">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
            <input type="text" value={search} onChange={handleSearch}
              className="input-field pl-10" placeholder="টুর্নামেন্ট খুঁজুন..." />
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => handleStatus(f.value)}
              className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold border flex-shrink-0 transition-all"
              style={{
                background: status === f.value ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.04)',
                borderColor: status === f.value ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.08)',
                color: status === f.value ? '#22d3ee' : '#9ca3af',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl shimmer" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">⚔️</div>
            <p className="text-gray-400 font-medium">কোনো টুর্নামেন্ট পাওয়া যায়নি</p>
            {search && <p className="text-gray-600 text-sm mt-1">"{search}" দিয়ে কিছু নেই</p>}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">{total}টি টুর্নামেন্ট পাওয়া গেছে</p>
            </div>
            <div className="space-y-3">
              {tournaments.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <TournamentCard tournament={t} index={i} />
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm border border-white/10 text-gray-400 disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>আগে</button>
                <span className="text-sm text-gray-400">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl text-sm border border-white/10 text-gray-400 disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>পরে</button>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
