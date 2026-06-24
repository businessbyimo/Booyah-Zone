import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiCheckSquare } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    const r = await api.get('/admin/tournaments?limit=100');
    setTournaments(r.data.tournaments);
  };

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTournament) params.set('tournament_id', selectedTournament);
      if (statusFilter) params.set('status', statusFilter);
      const r = await api.get(`/admin/participants?${params}`);
      setParticipants(r.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchTournaments(); }, []);
  useEffect(() => { fetchParticipants(); }, [selectedTournament, statusFilter]);

  const approve = async (id) => {
    try { await api.put(`/admin/participants/${id}/approve`); toast.success('অনুমোদিত হয়েছে'); fetchParticipants(); } catch { toast.error('ব্যর্থ হয়েছে'); }
  };
  const reject = async (id) => {
    try { await api.put(`/admin/participants/${id}/reject`); toast.success('বাতিল ও রিফান্ড হয়েছে'); fetchParticipants(); } catch { toast.error('ব্যর্থ হয়েছে'); }
  };
  const checkin = async (id) => {
    try { await api.put(`/admin/participants/${id}/checkin`); toast.success('চেক-ইন সম্পন্ন'); fetchParticipants(); } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', checked_in: 'badge-upcoming', completed: 'badge-completed' };
  const statusLabel = { pending: 'অপেক্ষমান', approved: 'অনুমোদিত', rejected: 'বাতিল', checked_in: 'চেক-ইন', completed: 'সম্পন্ন' };
  const filterButtons = [
    { v: '', l: 'সব' }, { v: 'pending', l: 'অপেক্ষমান' }, { v: 'approved', l: 'অনুমোদিত' },
    { v: 'rejected', l: 'বাতিল' }, { v: 'checked_in', l: 'চেক-ইন' }
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-orbitron font-bold text-xl text-white">অংশগ্রহণকারী</h2>
      <div className="flex flex-wrap gap-3">
        <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="input-field text-sm max-w-xs">
          <option value="">সব টুর্নামেন্ট</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map(s => (
            <button key={s.v} onClick={() => setStatusFilter(s.v)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === s.v ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
              {s.l}
            </button>
          ))}
        </div>
      </div>
      <div className="card neon-border overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-600 text-gray-500 text-xs">
                <th className="pb-3 pl-4 text-left">খেলোয়াড়</th>
                <th className="pb-3 text-left hidden sm:table-cell">টুর্নামেন্ট</th>
                <th className="pb-3 text-left hidden md:table-cell">টিম</th>
                <th className="pb-3 text-center">স্ট্যাটাস</th>
                <th className="pb-3 text-right hidden sm:table-cell">নিবন্ধন</th>
                <th className="pb-3 pr-4 text-right">অ্যাকশন</th>
              </tr></thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-500 py-10">কোনো অংশগ্রহণকারী নেই</td></tr>
                ) : participants.map(p => (
                  <tr key={p.id} className="border-b border-dark-600/30 hover:bg-dark-700/30">
                    <td className="py-3 pl-4">
                      <div>
                        <p className="text-white">{p.username}</p>
                        <p className="text-xs text-gray-500">{p.free_fire_id || 'FF আইডি নেই'}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400 hidden sm:table-cell text-xs">{p.tournament_name}</td>
                    <td className="py-3 text-gray-400 hidden md:table-cell">{p.team_name || '-'}</td>
                    <td className="py-3 text-center"><span className={statusBadge[p.status]}>{statusLabel[p.status] || p.status}</span></td>
                    <td className="py-3 text-right text-gray-500 text-xs hidden sm:table-cell">{format(new Date(p.registered_at), 'dd MMM, HH:mm')}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => approve(p.id)} title="অনুমোদন" className="p-1.5 text-green-400 hover:bg-green-400/10 rounded transition-colors"><FiCheck className="text-sm" /></button>
                            <button onClick={() => reject(p.id)} title="বাতিল" className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"><FiX className="text-sm" /></button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <button onClick={() => checkin(p.id)} title="চেক ইন" className="p-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors flex items-center gap-1 text-xs font-medium">
                            <FiCheckSquare className="text-sm" /> চেক ইন
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
