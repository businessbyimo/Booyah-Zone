import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiMap, FiClock, FiCheckCircle } from 'react-icons/fi';
import { GiTrophy, GiSword } from 'react-icons/gi';
import { format } from 'date-fns';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import CountdownTimer from '../components/CountdownTimer.jsx';
import PageTransition from '../components/PageTransition.jsx';

const StatusBadge = ({ status }) => {
  const cfg = { upcoming: 'badge-upcoming', ongoing: 'badge-ongoing', completed: 'badge-completed', cancelled: 'badge-cancelled' };
  return <span className={cfg[status] || 'badge-upcoming'}>{status?.toUpperCase()}</span>;
};

export default function TournamentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [results, setResults] = useState([]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
      const rRes = await api.get(`/tournaments/${id}/results`);
      setResults(rRes.data);
    } catch { navigate('/tournaments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const isRegistered = tournament?.participants?.some(p => p.user_id === user?.id);
  const canJoin = tournament?.status === 'upcoming' && !isRegistered && tournament?.current_participants < tournament?.max_participants;

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return; }
    setJoining(true);
    try {
      await api.post(`/tournaments/${id}/join`, { team_name: teamName });
      toast.success('Successfully registered! Awaiting approval.');
      setShowJoinModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join');
    } finally { setJoining(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div>;
  if (!tournament) return null;

  const myEntry = tournament.participants?.find(p => p.user_id === user?.id);

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="card neon-border mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StatusBadge status={tournament.status} />
                {tournament.map && <span className="text-xs text-gray-400 flex items-center"><FiMap className="mr-1" />{tournament.map}</span>}
              </div>
              <h1 className="font-orbitron font-bold text-3xl text-white mb-2">{tournament.name}</h1>
              {tournament.description && <p className="text-gray-400">{tournament.description}</p>}
            </div>
            {tournament.status === 'upcoming' && (
              <div className="flex-shrink-0">
                <p className="text-xs text-gray-500 mb-2 text-center">Starts in</p>
                <CountdownTimer targetDate={tournament.start_time} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Prize Pool', value: `৳${Number(tournament.prize_pool).toLocaleString()}`, icon: <GiTrophy />, color: 'text-yellow-400' },
                { label: 'Entry Fee', value: parseFloat(tournament.entry_fee) === 0 ? 'FREE' : `৳${tournament.entry_fee}`, icon: <GiSword />, color: 'text-cyan-400' },
                { label: 'Slots', value: `${tournament.current_participants}/${tournament.max_participants}`, icon: <FiUsers />, color: 'text-fuchsia-400' },
                { label: 'Start Date', value: tournament.start_time ? format(new Date(tournament.start_time), 'MMM dd') : 'TBD', icon: <FiCalendar />, color: 'text-green-400' },
              ].map(item => (
                <div key={item.label} className="card neon-border text-center">
                  <div className={`text-2xl ${item.color} mb-1`}>{item.icon}</div>
                  <p className="font-orbitron font-bold text-lg text-white">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Prize Distribution */}
            {(parseFloat(tournament.prize_1st) > 0 || parseFloat(tournament.prize_2nd) > 0) && (
              <div className="card neon-border">
                <h3 className="font-orbitron font-bold text-white mb-4">🏆 Prize Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[{ pos: '1st', prize: tournament.prize_1st, emoji: '🥇', color: 'text-yellow-400 border-yellow-400/30' },
                    { pos: '2nd', prize: tournament.prize_2nd, emoji: '🥈', color: 'text-gray-300 border-gray-300/30' },
                    { pos: '3rd', prize: tournament.prize_3rd, emoji: '🥉', color: 'text-orange-400 border-orange-400/30' }].map(p => (
                      parseFloat(p.prize) > 0 && (
                        <div key={p.pos} className={`text-center p-4 rounded-xl border ${p.color} bg-dark-700/30`}>
                          <div className="text-3xl mb-1">{p.emoji}</div>
                          <p className="text-xs text-gray-500">{p.pos} Place</p>
                          <p className={`font-orbitron font-bold text-xl ${p.color.split(' ')[0]}`}>৳{Number(p.prize).toLocaleString()}</p>
                        </div>
                      )))}
                </div>
              </div>
            )}

            {/* Rules */}
            {tournament.rules && (
              <div className="card neon-border">
                <h3 className="font-orbitron font-bold text-white mb-4">📜 Rules</h3>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{tournament.rules}</div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="card neon-border">
                <h3 className="font-orbitron font-bold text-white mb-4">📊 Match Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-dark-600">
                        <th className="pb-2 text-left">Rank</th>
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">Placement</th>
                        <th className="pb-2 text-center">Kills</th>
                        <th className="pb-2 text-center">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice().sort((a, b) => b.total_points - a.total_points).map((r, i) => (
                        <tr key={r.id} className="border-b border-dark-600/30">
                          <td className="py-2 text-yellow-400 font-bold">{i + 1}</td>
                          <td className="py-2 text-white">{r.username}</td>
                          <td className="py-2 text-center text-gray-400">{r.placement}</td>
                          <td className="py-2 text-center text-green-400">{r.kill_points}</td>
                          <td className="py-2 text-center text-cyan-400 font-bold">{r.total_points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Button */}
            <div className="card neon-border">
              {myEntry ? (
                <div className="text-center py-4">
                  <FiCheckCircle className="text-green-400 text-3xl mx-auto mb-2" />
                  <p className="text-green-400 font-semibold">You're Registered!</p>
                  <span className={`mt-2 inline-block badge-${myEntry.status}`}>{myEntry.status}</span>
                </div>
              ) : canJoin ? (
                <button onClick={() => setShowJoinModal(true)} className="w-full btn-primary text-lg py-4 font-orbitron">
                  ⚔️ JOIN TOURNAMENT
                </button>
              ) : (
                <button disabled className="w-full bg-dark-600 text-gray-500 font-semibold py-4 rounded-lg cursor-not-allowed">
                  {tournament.status !== 'upcoming' ? 'Tournament ' + tournament.status : 'Tournament Full'}
                </button>
              )}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{tournament.current_participants} registered</span>
                  <span>{tournament.max_participants} max</span>
                </div>
                <div className="h-2 bg-dark-600 rounded-full">
                  <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${Math.min(100, (tournament.current_participants / tournament.max_participants) * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Tournament info */}
            <div className="card neon-border space-y-3 text-sm">
              <h3 className="font-orbitron font-semibold text-white">📅 Schedule</h3>
              <div className="flex justify-between"><span className="text-gray-400">Start:</span><span className="text-white">{tournament.start_time ? format(new Date(tournament.start_time), 'MMM dd, yyyy HH:mm') : 'TBD'}</span></div>
              {tournament.end_time && <div className="flex justify-between"><span className="text-gray-400">End:</span><span className="text-white">{format(new Date(tournament.end_time), 'MMM dd, yyyy HH:mm')}</span></div>}
            </div>

            {/* Participants */}
            {tournament.participants?.length > 0 && (
              <div className="card neon-border">
                <h3 className="font-orbitron font-semibold text-white mb-3">👥 Participants ({tournament.participants.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tournament.participants.filter(p => p.status === 'approved' || p.status === 'checked_in').map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">{p.username[0].toUpperCase()}</div>
                        <span className="text-white">{p.username}</span>
                      </div>
                      {p.team_name && <span className="text-gray-500 text-xs">{p.team_name}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setShowJoinModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="card neon-border w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="font-orbitron font-bold text-xl text-white mb-4">Join {tournament.name}</h2>
              {parseFloat(tournament.entry_fee) > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4 text-sm text-yellow-400">
                  ⚠️ Entry fee of <strong>৳{tournament.entry_fee}</strong> will be deducted from your wallet balance.
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1.5">Team Name (optional)</label>
                <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className="input-field" placeholder="Your team name" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowJoinModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button onClick={handleJoin} disabled={joining} className="flex-1 btn-primary disabled:opacity-50">
                  {joining ? 'Joining...' : 'Confirm Join'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
