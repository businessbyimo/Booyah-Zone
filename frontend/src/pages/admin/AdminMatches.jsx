import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultsModal, setResultsModal] = useState(null);
  const [results, setResults] = useState([]);
  const [newMatchForm, setNewMatchForm] = useState({ match_number: 1, round: 'Round 1', start_time: '' });
  const [showCreateMatch, setShowCreateMatch] = useState(false);

  useEffect(() => {
    api.get('/admin/tournaments?limit=100').then(r => setTournaments(r.data.tournaments));
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchMatches();
      api.get(`/admin/participants?tournament_id=${selectedTournament}&status=approved`).then(r => setParticipants(r.data));
    }
  }, [selectedTournament]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/admin/matches?tournament_id=${selectedTournament}`);
      setMatches(r.data);
    } catch { } finally { setLoading(false); }
  };

  const createMatch = async () => {
    try {
      await api.post('/admin/matches', { tournament_id: selectedTournament, ...newMatchForm });
      toast.success('Match created');
      setShowCreateMatch(false);
      fetchMatches();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const openResults = async (match) => {
    const r = await api.get(`/admin/matches/${match.id}/results`).catch(() => ({ data: [] }));
    // Pre-fill results with approved participants
    const existingResults = r.data;
    const filled = participants.map(p => {
      const existing = existingResults.find(e => e.user_id === p.user_id);
      return { user_id: p.user_id, username: p.username, placement: existing?.placement || '', kill_points: existing?.kill_points || 0 };
    });
    setResults(filled);
    setResultsModal(match);
  };

  const saveResults = async () => {
    const valid = results.filter(r => r.placement);
    if (!valid.length) return toast.error('Enter at least one result');
    try {
      await api.post(`/admin/matches/${resultsModal.id}/results`, { results: valid });
      toast.success('Results saved & prizes distributed!');
      setResultsModal(null);
      fetchMatches();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const setMatchStatus = async (id, status) => {
    try { await api.put(`/admin/matches/${id}/status`, { status }); toast.success('Status updated'); fetchMatches(); } catch { toast.error('Failed'); }
  };

  const statusBadge = { pending: 'badge-pending', live: 'badge-ongoing', completed: 'badge-completed' };

  return (
    <div className="space-y-4">
      <h2 className="font-orbitron font-bold text-xl text-white">Match Management</h2>
      <div className="flex flex-wrap gap-3">
        <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="input-field text-sm max-w-xs">
          <option value="">Select Tournament</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {selectedTournament && (
          <button onClick={() => setShowCreateMatch(!showCreateMatch)} className="btn-primary text-sm px-4 py-2 flex items-center gap-1">
            <FiPlus /> Add Match
          </button>
        )}
      </div>

      {showCreateMatch && selectedTournament && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card neon-border">
          <h3 className="font-orbitron font-bold text-white mb-4 text-sm">Create Match</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Match #</label>
              <input type="number" value={newMatchForm.match_number} onChange={e => setNewMatchForm(f => ({...f, match_number: e.target.value}))} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Round</label>
              <input type="text" value={newMatchForm.round} onChange={e => setNewMatchForm(f => ({...f, round: e.target.value}))} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Start Time</label>
              <input type="datetime-local" value={newMatchForm.start_time} onChange={e => setNewMatchForm(f => ({...f, start_time: e.target.value}))} className="input-field text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowCreateMatch(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
            <button onClick={createMatch} className="btn-primary text-sm py-2 px-4">Create</button>
          </div>
        </motion.div>
      )}

      {!selectedTournament ? (
        <div className="card neon-border text-center py-12 text-gray-500">Select a tournament to manage matches</div>
      ) : (
        <div className="card neon-border overflow-hidden">
          {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-600 text-gray-500 text-xs">
                <th className="pb-3 pl-4 text-left">Match</th>
                <th className="pb-3 text-center">Round</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 pr-4 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-500 py-10">No matches yet. Generate a bracket or create manually.</td></tr>
                ) : matches.map(m => (
                  <tr key={m.id} className="border-b border-dark-600/30 hover:bg-dark-700/30">
                    <td className="py-3 pl-4 text-white">Match #{m.match_number}</td>
                    <td className="py-3 text-center text-gray-400">{m.round}</td>
                    <td className="py-3 text-center"><span className={statusBadge[m.status] || 'badge-pending'}>{m.status}</span></td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <select onChange={e => setMatchStatus(m.id, e.target.value)} value={m.status}
                          className="bg-dark-700 border border-dark-500 text-gray-300 text-xs rounded px-2 py-1">
                          <option value="pending">Pending</option>
                          <option value="live">Live</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button onClick={() => openResults(m)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                          <FiSave className="text-xs" /> Results
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Results Modal */}
      {resultsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card neon-border w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron font-bold text-white">Match #{resultsModal.match_number} Results</h3>
              <button onClick={() => setResultsModal(null)}><FiX className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Points = Placement Points (1st:10, 2nd:7, 3rd:5...) + Kill Points. Prizes distributed on save.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4">
                <thead><tr className="border-b border-dark-600 text-gray-500 text-xs">
                  <th className="pb-2 text-left">Player</th>
                  <th className="pb-2 text-center">Placement</th>
                  <th className="pb-2 text-center">Kill Points</th>
                  <th className="pb-2 text-center">Total</th>
                </tr></thead>
                <tbody>
                  {results.map((r, i) => {
                    const pp = { 1: 10, 2: 7, 3: 5, 4: 4, 5: 3, 6: 2 }[r.placement] || (r.placement > 6 ? 1 : 0);
                    const total = pp + parseInt(r.kill_points || 0);
                    return (
                      <tr key={r.user_id} className="border-b border-dark-600/30">
                        <td className="py-2 text-white">{r.username}</td>
                        <td className="py-2 text-center">
                          <input type="number" value={r.placement} onChange={e => setResults(prev => prev.map((p, j) => j === i ? {...p, placement: e.target.value} : p))}
                            className="w-16 bg-dark-700 border border-dark-500 rounded px-2 py-1 text-center text-white text-xs" min={1} placeholder="1" />
                        </td>
                        <td className="py-2 text-center">
                          <input type="number" value={r.kill_points} onChange={e => setResults(prev => prev.map((p, j) => j === i ? {...p, kill_points: e.target.value} : p))}
                            className="w-16 bg-dark-700 border border-dark-500 rounded px-2 py-1 text-center text-white text-xs" min={0} />
                        </td>
                        <td className="py-2 text-center text-cyan-400 font-orbitron font-bold">{r.placement ? total : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setResultsModal(null)} className="flex-1 btn-secondary text-sm py-2.5">Cancel</button>
              <button onClick={saveResults} className="flex-1 btn-primary text-sm py-2.5">Save & Distribute Prizes</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
