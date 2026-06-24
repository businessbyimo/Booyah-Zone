import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAddLine, RiCloseLine, RiSaveLine, RiTrophyLine } from 'react-icons/ri';
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
  const [newMatchForm, setNewMatchForm] = useState({ match_number: 1, round: 'রাউন্ড ১', start_time: '' });
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [roomModal, setRoomModal] = useState(null);
  const [roomForm, setRoomForm] = useState({ room_id: '', room_password: '' });

  useEffect(() => {
    api.get('/admin/tournaments?limit=100').then(r => setTournaments(r.data.tournaments || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchMatches();
      api.get(`/admin/participants?tournament_id=${selectedTournament}&status=approved`).then(r => setParticipants(r.data || [])).catch(() => {});
    }
  }, [selectedTournament]);

  const fetchMatches = async () => {
    setLoading(true);
    try { const r = await api.get(`/admin/matches?tournament_id=${selectedTournament}`); setMatches(r.data || []); }
    catch {} finally { setLoading(false); }
  };

  const createMatch = async () => {
    try {
      await api.post('/admin/matches', { tournament_id: selectedTournament, ...newMatchForm });
      toast.success('ম্যাচ তৈরি হয়েছে');
      setShowCreateMatch(false);
      fetchMatches();
    } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const openResults = async (match) => {
    setResultsModal(match);
    try {
      const r = await api.get(`/admin/matches/${match.id}/results`);
      setResults(r.data || participants.map(p => ({ participant_id: p.id, username: p.username, placement: '', kill_points: 0 })));
    } catch { setResults(participants.map(p => ({ participant_id: p.id, username: p.username, placement: '', kill_points: 0 }))); }
  };

  const saveResults = async () => {
    try {
      const data = results.filter(r => r.placement).map(r => ({ participant_id: r.participant_id, placement: Number(r.placement), kill_points: Number(r.kill_points || 0) }));
      await api.post(`/admin/matches/${resultsModal.id}/results`, { results: data });
      toast.success('ফলাফল সংরক্ষিত হয়েছে!');
      setResultsModal(null);
      fetchMatches();
    } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const updateRoom = async () => {
    try {
      await api.put(`/admin/tournaments/${selectedTournament}/room`, roomForm);
      toast.success('Room ID পাঠানো হয়েছে!');
      setRoomModal(false);
    } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron font-bold text-xl text-white">ম্যাচ ম্যানেজমেন্ট</h2>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-400 mb-1 block">টুর্নামেন্ট বাছাই করুন</label>
        <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="input-field max-w-sm">
          <option value="">টুর্নামেন্ট বাছাই করুন</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {selectedTournament && (
        <div className="flex flex-wrap gap-2 mb-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCreateMatch(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
            <RiAddLine />নতুন ম্যাচ
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setRoomModal(true); setRoomForm({ room_id: '', room_password: '' }); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-yellow-400/30 text-yellow-400"
            style={{ background: 'rgba(245,158,11,0.1)' }}>
            🔑 Room ID পাঠান
          </motion.button>
        </div>
      )}

      {selectedTournament && (
        <div className="space-y-2">
          {loading ? [...Array(3)].map((_,i)=><div key={i} className="h-16 rounded-2xl shimmer"/>) :
          matches.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">কোনো ম্যাচ নেই</p> :
          matches.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.05 }}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-white/8"
              style={{ background: '#13131F' }}>
              <div>
                <p className="font-semibold text-white text-sm">{m.round} — ম্যাচ #{m.match_number}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{m.results_count || 0}টি ফলাফল</p>
              </div>
              <button onClick={() => openResults(m)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-yellow-400/30 text-yellow-400"
                style={{ background: 'rgba(245,158,11,0.1)' }}>
                <RiTrophyLine />ফলাফল
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Match Modal */}
      <AnimatePresence>
        {showCreateMatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center px-4"
            onClick={() => setShowCreateMatch(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl p-5 border border-white/10"
              style={{ background: '#13131F' }} onClick={e => e.stopPropagation()}>
              <h3 className="font-orbitron font-bold text-white mb-4">নতুন ম্যাচ</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ম্যাচ নম্বর</label>
                  <input type="number" value={newMatchForm.match_number} onChange={e=>setNewMatchForm(f=>({...f,match_number:Number(e.target.value)}))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">রাউন্ড</label>
                  <input type="text" value={newMatchForm.round} onChange={e=>setNewMatchForm(f=>({...f,round:e.target.value}))}
                    className="input-field" placeholder="রাউন্ড ১" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">শুরুর সময়</label>
                  <input type="datetime-local" value={newMatchForm.start_time} onChange={e=>setNewMatchForm(f=>({...f,start_time:e.target.value}))}
                    className="input-field" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowCreateMatch(false)} className="flex-1 py-2.5 rounded-xl text-gray-400 border border-white/10 text-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>বাতিল</button>
                <button onClick={createMatch} className="flex-1 py-2.5 rounded-xl font-bold text-black text-sm" style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>তৈরি করুন</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Modal */}
      <AnimatePresence>
        {roomModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center px-4"
            onClick={() => setRoomModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl p-5 border border-yellow-400/20"
              style={{ background: '#13131F' }} onClick={e => e.stopPropagation()}>
              <h3 className="font-orbitron font-bold text-white mb-4">🔑 Room ID পাঠান</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Room ID</label>
                  <input type="text" value={roomForm.room_id} onChange={e=>setRoomForm(f=>({...f,room_id:e.target.value}))}
                    className="input-field" placeholder="Room ID" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Room Password</label>
                  <input type="text" value={roomForm.room_password} onChange={e=>setRoomForm(f=>({...f,room_password:e.target.value}))}
                    className="input-field" placeholder="Password" />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">এটি পাঠালে অনুমোদিত অংশগ্রহণকারীদের নোটিফিকেশনে যাবে।</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setRoomModal(false)} className="flex-1 py-2.5 rounded-xl text-gray-400 border border-white/10 text-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>বাতিল</button>
                <button onClick={updateRoom} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: 'rgba(245,158,11,0.3)', border: '1px solid rgba(245,158,11,0.4)' }}>পাঠান</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Modal */}
      <AnimatePresence>
        {resultsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center px-4"
            onClick={() => setResultsModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-lg rounded-3xl p-5 border border-white/10 max-h-[85vh] flex flex-col"
              style={{ background: '#13131F' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="font-orbitron font-bold text-white text-sm">{resultsModal.round} — ম্যাচ #{resultsModal.match_number} ফলাফল</h3>
                <button onClick={() => setResultsModal(null)} className="text-gray-500 hover:text-white">
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {participants.map((p, i) => {
                  const result = results.find(r => r.participant_id === p.id) || {};
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-white/8"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <span className="text-xs text-gray-400 w-20 truncate">{p.username || p.team_name}</span>
                      <input type="number" placeholder="প্লেস" min="1"
                        value={result.placement || ''}
                        onChange={e => setResults(prev => {
                          const updated = [...prev];
                          const idx = updated.findIndex(r => r.participant_id === p.id);
                          if (idx >= 0) updated[idx] = { ...updated[idx], placement: e.target.value };
                          else updated.push({ participant_id: p.id, username: p.username, placement: e.target.value, kill_points: 0 });
                          return updated;
                        })}
                        className="input-field flex-1 py-1.5 text-xs text-center" />
                      <input type="number" placeholder="কিল" min="0"
                        value={result.kill_points || ''}
                        onChange={e => setResults(prev => {
                          const updated = [...prev];
                          const idx = updated.findIndex(r => r.participant_id === p.id);
                          if (idx >= 0) updated[idx] = { ...updated[idx], kill_points: e.target.value };
                          else updated.push({ participant_id: p.id, username: p.username, placement: '', kill_points: e.target.value });
                          return updated;
                        })}
                        className="input-field flex-1 py-1.5 text-xs text-center" />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-4 flex-shrink-0">
                <button onClick={() => setResultsModal(null)} className="flex-1 py-2.5 rounded-xl text-gray-400 border border-white/10 text-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>বাতিল</button>
                <button onClick={saveResults} className="flex-1 py-2.5 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-1" style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                  <RiSaveLine />সংরক্ষণ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
