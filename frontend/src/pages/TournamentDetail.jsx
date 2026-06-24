import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCalendar, FiMap, FiCheckCircle, FiX } from 'react-icons/fi';
import { GiTrophy, GiSword } from 'react-icons/gi';
import { format } from 'date-fns';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import CountdownTimer from '../components/CountdownTimer.jsx';
import PageTransition from '../components/PageTransition.jsx';

const StatusBadge = ({ status }) => {
  const cfg = {
    upcoming: 'badge-upcoming',
    ongoing: 'badge-ongoing',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled'
  };
  const labels = {
    upcoming: 'আসন্ন',
    ongoing: 'চলমান',
    completed: 'সম্পন্ন',
    cancelled: 'বাতিল'
  };
  return <span className={cfg[status] || 'badge-upcoming'}>{labels[status] || status}</span>;
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
      toast.success('সফলভাবে রেজিস্টার হয়েছে! অনুমোদনের জন্য অপেক্ষা করুন।');
      setShowJoinModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'যোগ দিতে ব্যর্থ হয়েছে');
    } finally { setJoining(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div>;
  if (!tournament) return null;

  const myEntry = tournament.participants?.find(p => p.user_id === user?.id);
  const statusLabels = { pending: 'অপেক্ষমান', approved: 'অনুমোদিত', rejected: 'বাতিল', checked_in: 'চেক-ইন' };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-6xl mx-auto px-4">
        {/* হেডার */}
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
                <p className="text-xs text-gray-500 mb-2 text-center">শুরু হতে বাকি</p>
                <CountdownTimer targetDate={tournament.start_time} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* বাম কলাম */}
          <div className="lg:col-span-2 space-y-6">
            {/* স্ট্যাটস */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'পুরস্কার পুল', value: `৳${Number(tournament.prize_pool).toLocaleString()}`, icon: <GiTrophy />, color: 'text-yellow-400' },
                { label: 'এন্ট্রি ফি', value: parseFloat(tournament.entry_fee) === 0 ? 'বিনামূল্যে' : `৳${tournament.entry_fee}`, icon: <GiSword />, color: 'text-cyan-400' },
                { label: 'স্লট', value: `${tournament.current_participants}/${tournament.max_participants}`, icon: <FiUsers />, color: 'text-fuchsia-400' },
                { label: 'শুরুর তারিখ', value: tournament.start_time ? format(new Date(tournament.start_time), 'dd MMM') : 'TBD', icon: <FiCalendar />, color: 'text-green-400' },
              ].map(item => (
                <div key={item.label} className="card neon-border text-center">
                  <div className={`text-2xl ${item.color} mb-1`}>{item.icon}</div>
                  <p className="font-orbitron font-bold text-lg text-white">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>

            {/* পুরস্কার বণ্টন */}
            {(parseFloat(tournament.prize_1st) > 0 || parseFloat(tournament.prize_2nd) > 0) && (
              <div className="card neon-border">
                <h3 className="font-orbitron font-bold text-white mb-4">🏆 পুরস্কার বণ্টন</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { pos: '১ম স্থান', prize: tournament.prize_1st, emoji: '🥇', color: 'text-yellow-400 border-yellow-400/30' },
                    { pos: '২য় স্থান', prize: tournament.prize_2nd, emoji: '🥈', color: 'text-gray-300 border-gray-300/30' },
                    { pos: '৩য় স্থান', prize: tournament.prize_3rd, emoji: '🥉', color: 'text-orange-400 border-orange-400/30' }
                  ].map(p => (
                    parseFloat(p.prize) > 0 && (
                      <div key={p.pos} className={`text-center p-4 rounded-xl border ${p.color} bg-dark-700/30`}>
                        <div className="text-3xl mb-1">{p.emoji}</div>
                        <p className="text-xs text-gray-500">{p.pos}</p>
                        <p className={`font-orbitron font-bold text-xl ${p.color.split(' ')[0]}`}>৳{Number(p.prize).toLocaleString()}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* নিয়ম */}
            {tournament.rules && (
              <div className="card neon-border">
                <h3 className="font-orbitron font-bold text-white mb-4">📜 নিয়মাবলী</h3>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{tournament.rules}</div>
              </div>
            )}

            {/* ম্যাচ ফলাফল */}
            {results.length > 0 && (
              <div className="card neon-border">
                <h3 className="font-orbitron font-bold text-white mb-4">📊 ম্যাচ ফলাফল</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-dark-600">
                        <th className="pb-2 text-left">র্যাংক</th>
                        <th className="pb-2 text-left">খেলোয়াড়</th>
                        <th className="pb-2 text-center">প্লেসমেন্ট</th>
                        <th className="pb-2 text-center">কিল</th>
                        <th className="pb-2 text-center">পয়েন্ট</th>
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

          {/* ডান কলাম */}
          <div className="space-y-6">
            {/* জয়েন বাটন */}
            <div className="card neon-border">
              {myEntry ? (
                <div className="text-center py-4">
                  <FiCheckCircle className="text-green-400 text-3xl mx-auto mb-2" />
                  <p className="text-green-400 font-semibold">আপনি রেজিস্টার্ড!</p>
                  <span className={`mt-2 inline-block badge-${myEntry.status}`}>{statusLabels[myEntry.status] || myEntry.status}</span>
                </div>
              ) : canJoin ? (
                <button onClick={() => setShowJoinModal(true)} className="w-full btn-primary text-lg py-4 font-orbitron">
                  ⚔️ টুর্নামেন্টে যোগ দিন
                </button>
              ) : (
                <button disabled className="w-full bg-dark-600 text-gray-500 font-semibold py-4 rounded-lg cursor-not-allowed">
                  {tournament.status !== 'upcoming' ? `টুর্নামেন্ট ${tournament.status === 'ongoing' ? 'চলমান' : tournament.status === 'completed' ? 'সম্পন্ন' : 'বাতিল'}` : 'সব স্লট পূর্ণ'}
                </button>
              )}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{tournament.current_participants} জন রেজিস্টার্ড</span>
                  <span>সর্বোচ্চ {tournament.max_participants}</span>
                </div>
                <div className="h-2 bg-dark-600 rounded-full">
                  <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${Math.min(100, (tournament.current_participants / tournament.max_participants) * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* সময়সূচী */}
            <div className="card neon-border space-y-3 text-sm">
              <h3 className="font-orbitron font-semibold text-white">📅 সময়সূচী</h3>
              <div className="flex justify-between"><span className="text-gray-400">শুরু:</span><span className="text-white">{tournament.start_time ? format(new Date(tournament.start_time), 'dd MMM yyyy, HH:mm') : 'TBD'}</span></div>
              {tournament.end_time && <div className="flex justify-between"><span className="text-gray-400">শেষ:</span><span className="text-white">{format(new Date(tournament.end_time), 'dd MMM yyyy, HH:mm')}</span></div>}
            </div>

            {/* অংশগ্রহণকারী */}
            {tournament.participants?.length > 0 && (
              <div className="card neon-border">
                <h3 className="font-orbitron font-semibold text-white mb-3">👥 অংশগ্রহণকারী ({tournament.participants.filter(p => p.status === 'approved' || p.status === 'checked_in').length})</h3>
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

        {/* জয়েন মডাল পপআপ */}
        <AnimatePresence>
          {showJoinModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setShowJoinModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="card neon-border w-full max-w-md relative"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors">
                  <FiX className="text-lg" />
                </button>
                <div className="text-center mb-5">
                  <div className="text-4xl mb-2">⚔️</div>
                  <h2 className="font-orbitron font-bold text-xl text-white">{tournament.name}-এ যোগ দিন</h2>
                </div>
                {parseFloat(tournament.entry_fee) > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4 text-sm text-yellow-400">
                    ⚠️ আপনার ওয়ালেট থেকে <strong>৳{tournament.entry_fee}</strong> এন্ট্রি ফি কাটা হবে।
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1.5">টিমের নাম (ঐচ্ছিক)</label>
                  <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className="input-field" placeholder="আপনার টিমের নাম" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowJoinModal(false)} className="flex-1 btn-secondary">বাতিল</button>
                  <button onClick={handleJoin} disabled={joining} className="flex-1 btn-primary disabled:opacity-50">
                    {joining ? 'যোগ হচ্ছে...' : 'নিশ্চিত করুন'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
