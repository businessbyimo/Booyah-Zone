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
      <div className="min-h-screen px-4 pt-4 pb-6 max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 font-orbitron">⚔️ টুর্নামেন্ট</h1>
          <p className="text-gray-500 text-sm mt-0.5">টুর্নামেন্ট খুঁজুন এবং যোগ দিন। সেরা খেলোয়াড় জিতুক!</p>
        </div>

        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="টুর্নামেন্ট খুঁজুন..."
            className="input-field pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {STATUS_FILTERS.map(s => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={status === s.value
                ? { background: 'linear-gradient(135deg,#FF6B00,#FF8C42)', color: '#fff', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }
                : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-100 rounded-full" style={{ borderTopColor: '#FF6B00', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🏟️</p>
            <p className="text-gray-400">কোনো টুর্নামেন্ট পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {tournaments.map((t, i) => <TournamentCard key={t.id} tournament={t} index={i} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm disabled:opacity-40 shadow-sm"
                >
                  পূর্ববর্তী
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                      style={page === p
                        ? { background: 'linear-gradient(135deg,#FF6B00,#FF8C42)', color: '#fff' }
                        : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
                      }
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm disabled:opacity-40 shadow-sm"
                >
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
