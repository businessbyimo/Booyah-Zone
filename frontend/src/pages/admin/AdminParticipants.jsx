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
    try { await api.put(`/admin/participants/${id}/approve`); toast.success('Approved'); fetchParticipants(); } catch { toast.error('Failed'); }
  };
  const reject = async (id) => {
    try { await api.put(`/admin/participants/${id}/reject`); toast.success('Rejected & refunded'); fetchParticipants(); } catch { toast.error('Failed'); }
  };
  const checkin = async (id) => {
    try { await api.put(`/admin/participants/${id}/checkin`); toast.success('Checked in'); fetchParticipants(); } catch { toast.error('Failed'); }
  };

  const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', checked_in: 'badge-upcoming', completed: 'badge-completed' };

  return (
    <div className="space-y-4">
      <h2 className="font-orbitron font-bold text-xl text-white">Participants</h2>
      <div className="flex flex-wrap gap-3">
        <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="input-field text-sm max-w-xs">
          <option value="">All Tournaments</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected', 'checked_in'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>
      <div className="card neon-border overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-600 text-gray-500 text-xs">
                <th className="pb-3 pl-4 text-left">Player</th>
                <th className="pb-3 text-left hidden sm:table-cell">Tournament</th>
                <th className="pb-3 text-left hidden md:table-cell">Team</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right hidden sm:table-cell">Registered</th>
                <th className="pb-3 pr-4 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-500 py-10">No participants found</td></tr>
                ) : participants.map(p => (
                  <tr key={p.id} className="border-b border-dark-600/30 hover:bg-dark-700/30">
                    <td className="py-3 pl-4">
                      <div>
                        <p className="text-white">{p.username}</p>
                        <p className="text-xs text-gray-500">{p.free_fire_id || 'No FF ID'}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400 hidden sm:table-cell text-xs">{p.tournament_name}</td>
                    <td className="py-3 text-gray-400 hidden md:table-cell">{p.team_name || '-'}</td>
                    <td className="py-3 text-center"><span className={statusBadge[p.status]}>{p.status}</span></td>
                    <td className="py-3 text-right text-gray-500 text-xs hidden sm:table-cell">{format(new Date(p.registered_at), 'MMM dd, HH:mm')}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => approve(p.id)} title="Approve" className="p-1.5 text-green-400 hover:bg-green-400/10 rounded transition-colors"><FiCheck className="text-sm" /></button>
                            <button onClick={() => reject(p.id)} title="Reject" className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"><FiX className="text-sm" /></button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <button onClick={() => checkin(p.id)} title="Check In" className="p-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors flex items-center gap-1 text-xs font-medium">
                            <FiCheckSquare className="text-sm" /> Check In
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
