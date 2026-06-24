import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import api from '../utils/api.js';
import TournamentCard from '../components/TournamentCard.jsx';
import PageTransition from '../components/PageTransition.jsx';

const STATUS_FILTERS = [
  { value: '', label: 'সব' },
  { value: 'upcoming', label: 'আসন্ন' },
  { value: 'ongoing', label: 'চলমান' },
  { value: 'completed', label: 'সম্পন্ন' },
  { value: 'cancelled', label: 'বাতিল' },
];

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await api.get(`/tournaments?${params}`);
      setTournaments(res.data.tournaments);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchTournaments(); }, [page, status]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchTournaments(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="section-title">⚔️ টুর্নামেন্ট</h1>
          <p className="text-gray-400">টুর্নামেন্ট খুঁজুন এবং যোগ দিন। সেরা খেলোয়াড় জিতুক!</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="টুর্নামেন্ট খুঁজুন..." className="input-field pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button key={s.value} onClick={() => { setStatus(s.value); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === s.value ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-cyan-500/30'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏟️</p>
            <p className="text-gray-400 text-lg">কোনো টুর্নামেন্ট পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((t, i) => <TournamentCard key={t.id} tournament={t} index={i} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-dark-700 border border-dark-500 text-white rounded-lg disabled:opacity-40 hover:border-cyan-500 transition-colors">
                  পূর্ববর্তী
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${page === p ? 'bg-cyan-500 text-white' : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-cyan-500'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-dark-700 border border-dark-500 text-white rounded-lg disabled:opacity-40 hover:border-cyan-500 transition-colors">
                  পরবর্তী
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
