import { useState, useEffect } from 'react';
import { RiCheckLine, RiCloseLine, RiUserCheckLine } from 'react-icons/ri';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusLabel = { pending: 'অপেক্ষমান', approved: 'অনুমোদিত', rejected: 'বাতিল', checked_in: 'চেক-ইন', completed: 'সম্পন্ন' };

export default function AdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/tournaments?limit=100').then(r => setTournaments(r.data.tournaments || [])).catch(() => {});
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (selectedTournament) p.set('tournament_id', selectedTournament);
      if (statusFilter) p.set('status', statusFilter);
      const r = await api.get(`/admin/participants?${p}`);
      setParticipants(r.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchParticipants(); }, [selectedTournament, statusFilter]);

  const approve = async (id) => {
    try { await api.put(`/admin/participants/${id}/approve`); toast.success('অনুমোদিত হয়েছে'); fetchParticipants(); }
    catch { toast.error('ব্যর্থ হয়েছে'); }
  };
  const reject = async (id) => {
    if (!window.confirm('বাতিল করবেন? এন্ট্রি ফি রিফান্ড হবে।')) return;
    try { await api.put(`/admin/participants/${id}/reject`); toast.success('বাতিল ও রিফান্ড হয়েছে'); fetchParticipants(); }
    catch { toast.error('ব্যর্থ হয়েছে'); }
  };
  const checkin = async (id) => {
    try { await api.put(`/admin/participants/${id}/checkin`); toast.success('চেক-ইন সম্পন্ন'); fetchParticipants(); }
    catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-white mb-6">অংশগ্রহণকারী ম্যানেজমেন্ট</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">টুর্নামেন্ট</label>
          <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="input-field">
            <option value="">সব টুর্নামেন্ট</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">স্ট্যাটাস</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field">
            <option value="">সব</option>
            {Object.entries(statusLabel).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['খেলোয়াড়', 'FF ID', 'টুর্নামেন্ট', 'টিম', 'তারিখ', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(7)].map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded shimmer w-16"/></td>)}
                </tr>
              )) : participants.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-medium text-white text-xs">{p.username}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.free_fire_id || '-'}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs max-w-[120px] truncate">{p.tournament_name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.team_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {p.registered_at ? format(new Date(p.registered_at), 'dd MMM HH:mm') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge-${p.status} text-[10px]`}>{statusLabel[p.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => approve(p.id)} className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10" title="অনুমোদন">
                            <RiCheckLine className="text-base" />
                          </button>
                          <button onClick={() => reject(p.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10" title="বাতিল">
                            <RiCloseLine className="text-base" />
                          </button>
                        </>
                      )}
                      {p.status === 'approved' && (
                        <button onClick={() => checkin(p.id)} className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10" title="চেক-ইন">
                          <RiUserCheckLine className="text-base" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && participants.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">কোনো অংশগ্রহণকারী নেই</p>
          )}
        </div>
      </div>
    </div>
  );
}
