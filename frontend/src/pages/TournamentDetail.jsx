import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiUserLine, RiCalendarLine, RiMapPin2Line, RiArrowLeftLine, RiCloseLine, RiKeyLine, RiTrophyLine } from 'react-icons/ri';
import { format } from 'date-fns';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import CountdownTimer from '../components/CountdownTimer.jsx';
import PageTransition from '../components/PageTransition.jsx';

const statusConfig = {
  upcoming: { label: 'আসন্ন', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
  ongoing: { label: '🔴 লাইভ', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  completed: { label: 'সম্পন্ন', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)' },
  cancelled: { label: 'বাতিল', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
};

export default function TournamentDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [results, setResults] = useState([]);
  const [myParticipation, setMyParticipation] = useState(null);

  const fetchData = async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/results`).catch(() => ({ data: [] })),
      ]);
      setTournament(tRes.data);
      setResults(rRes.data || []);

      if (user) {
        api.get(`/tournaments/${id}/my-participation`).then(r => setMyParticipation(r.data)).catch(() => {});
      }
    } catch { navigate('/tournaments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleJoin = async () => {
    if (!user) { toast.error('লগইন করুন'); navigate('/login'); return; }
    setJoining(true);
    try {
      await api.post(`/tournaments/${id}/join`, { team_name: teamName });
      toast.success('টুর্নামেন্টে যোগ দেওয়ার অনুরোধ পাঠানো হয়েছে! অনুমোদনের পর Room ID পাবেন।');
      setShowJoinModal(false);
      setTeamName('');
      refreshUser();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'যোগ দেওয়া ব্যর্থ হয়েছে');
    } finally { setJoining(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );
  if (!tournament) return null;

  const st = statusConfig[tournament.status] || statusConfig.upcoming;
  const fillPct = Math.min(100, ((tournament.current_participants || 0) / tournament.max_participants) * 100);
  const isFull = fillPct >= 100;
  const hasJoined = myParticipation?.status;
  const canJoin = tournament.status === 'upcoming' && !isFull && user && !hasJoined;

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-2">
        <button onClick={() => navigate('/tournaments')} className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
          <RiArrowLeftLine />টুর্নামেন্ট তালিকায় ফিরুন
        </button>

        <div className="rounded-3xl overflow-hidden border border-white/8 mb-4" style={{ background: '#13131F' }}>
          <div className="p-5" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.06), rgba(217,70,239,0.04))' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h1 className="font-orbitron font-bold text-lg text-white leading-tight mb-2">{tournament.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{ color: st.color, background: st.bg, borderColor: st.border }}>
                    {st.label}
                  </span>
                  {tournament.map && (
                    <span className="flex items-center gap-0.5 text-xs text-gray-400">
                      <RiMapPin2Line />{tournament.map}
                    </span>
                  )}
                  {tournament.mode && <span className="text-xs text-gray-400">{tournament.mode}</span>}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <RiTrophyLine className="text-yellow-400 text-2xl" />
              </div>
            </div>

            {tournament.status === 'upcoming' && tournament.start_time && (
              <div className="flex justify-center mt-3">
                <CountdownTimer targetDate={tournament.start_time} />
              </div>
            )}
          </div>

          <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-2 mt-4 mb-4">
              {[
                { label: 'পুরস্কার পুল', value: `৳${Number(tournament.prize_pool || 0).toLocaleString()}`, color: '#22d3ee' },
                { label: 'এন্ট্রি ফি', value: parseFloat(tournament.entry_fee) === 0 ? '🆓 ফ্রি' : `৳${tournament.entry_fee}`, color: '#d946ef' },
                { label: 'স্লট', value: `${tournament.current_participants || 0}/${tournament.max_participants}`, color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-2.5 text-center border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="font-rajdhani font-black text-base" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {tournament.prize_1st && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { rank: '🥇 ১ম', prize: tournament.prize_1st, color: '#f59e0b' },
                  { rank: '🥈 ২য়', prize: tournament.prize_2nd, color: '#9ca3af' },
                  { rank: '🥉 ৩য়', prize: tournament.prize_3rd, color: '#f97316' },
                ].filter(p => p.prize).map((p, i) => (
                  <div key={i} className="rounded-xl p-2 text-center border border-white/8"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-xs font-bold" style={{ color: p.color }}>{p.rank}</p>
                    <p className="font-rajdhani font-bold text-white text-sm">৳{Number(p.prize).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400 flex items-center gap-1"><RiUserLine />{tournament.current_participants || 0}/{tournament.max_participants}</span>
                <span className={isFull ? 'text-red-400 font-bold' : 'text-gray-400'}>{Math.round(fillPct)}% পূর্ণ {isFull && '🔥'}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: isFull ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #22d3ee, #d946ef)' }} />
              </div>
            </div>

            {tournament.start_time && (
              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><RiCalendarLine />শুরু: {format(new Date(tournament.start_time), 'dd MMM yyyy, HH:mm')}</span>
              </div>
            )}

            {/* Room ID for participants */}
            {(myParticipation?.status === 'approved' || myParticipation?.status === 'checked_in') && tournament.room_id && (
              <div className="rounded-2xl p-4 mb-4 border border-green-400/20"
                style={{ background: 'rgba(16,185,129,0.08)' }}>
                <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
                  <RiKeyLine />Room তথ্য
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Room ID</p>
                    <p className="font-orbitron font-bold text-white">{tournament.room_id}</p>
                  </div>
                  {tournament.room_password && (
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500">Password</p>
                      <p className="font-orbitron font-bold text-white">{tournament.room_password}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Join button / status */}
            {!user ? (
              <Link to="/login" className="btn-primary w-full block text-center py-3.5 text-sm font-bold">
                🔑 লগইন করে যোগ দিন
              </Link>
            ) : hasJoined ? (
              <div className="py-3.5 rounded-2xl text-center border font-semibold text-sm"
                style={{
                  background: myParticipation.status === 'approved' ? 'rgba(16,185,129,0.1)' : myParticipation.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                  borderColor: myParticipation.status === 'approved' ? 'rgba(16,185,129,0.3)' : myParticipation.status === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)',
                  color: myParticipation.status === 'approved' ? '#10b981' : myParticipation.status === 'rejected' ? '#ef4444' : '#f59e0b',
                }}>
                {myParticipation.status === 'pending' && '⏳ অনুমোদনের অপেক্ষায়...'}
                {myParticipation.status === 'approved' && '✅ নিবন্ধিত হয়েছেন!'}
                {myParticipation.status === 'checked_in' && '🎮 চেক-ইন সম্পন্ন!'}
                {myParticipation.status === 'rejected' && '❌ আবেদন বাতিল হয়েছে'}
              </div>
            ) : canJoin ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowJoinModal(true)}
                className="w-full py-3.5 rounded-2xl font-bold text-black text-sm"
                style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', boxShadow: '0 8px 32px rgba(34,211,238,0.3)' }}>
                ⚔️ টুর্নামেন্টে যোগ দিন
              </motion.button>
            ) : isFull ? (
              <div className="py-3.5 rounded-2xl text-center font-semibold text-sm text-red-400 border border-red-400/30"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                🔥 সব স্লট পূর্ণ হয়ে গেছে!
              </div>
            ) : null}
          </div>
        </div>

        {tournament.description && (
          <div className="card rounded-2xl p-4 mb-4">
            <h2 className="font-semibold text-white text-sm mb-2">📋 বিবরণ</h2>
            <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line">{tournament.description}</p>
          </div>
        )}

        {tournament.rules && (
          <div className="card rounded-2xl p-4 mb-4">
            <h2 className="font-semibold text-white text-sm mb-2">📜 নিয়মাবলী</h2>
            <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line">{tournament.rules}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="card rounded-2xl overflow-hidden mb-4">
            <h2 className="font-semibold text-white text-sm p-4 border-b border-white/5">🏆 ফলাফল</h2>
            {results.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className={`flex items-center justify-between px-4 py-3 ${i < results.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                  <span className="text-white text-sm font-medium">{r.username || r.team_name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cyan-400 font-bold">{r.total_points || 0} pts</p>
                  <p className="text-[10px] text-gray-500">{r.kill_points || 0} kills</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showJoinModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-end justify-center px-4 pb-8"
            onClick={() => setShowJoinModal(false)}>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-sm rounded-3xl p-5 border border-cyan-400/20"
              style={{ background: '#13131F' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold text-white">টুর্নামেন্টে যোগ দিন</h3>
                <button onClick={() => setShowJoinModal(false)} className="text-gray-500 hover:text-white">
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
              <div className="p-3 rounded-xl mb-4 border border-yellow-400/20"
                style={{ background: 'rgba(245,158,11,0.08)' }}>
                <p className="text-xs text-gray-300 mb-1">এন্ট্রি ফি: <span className="text-yellow-400 font-bold">
                  {parseFloat(tournament.entry_fee) === 0 ? '🆓 বিনামূল্যে' : `৳${tournament.entry_fee}`}
                </span></p>
                <p className="text-xs text-gray-400">আপনার ব্যালেন্স: <span className="text-cyan-400 font-bold">৳{Number(user?.balance || 0).toFixed(2)}</span></p>
              </div>
              {tournament.mode !== 'Solo' && (
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-1.5 block">টিমের নাম (ঐচ্ছিক)</label>
                  <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)}
                    className="input-field" placeholder="আপনার টিমের নাম" />
                </div>
              )}
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleJoin} disabled={joining}
                className="w-full py-3.5 rounded-2xl font-bold text-black text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                {joining ? <span className="flex items-center justify-center gap-2"><span className="dot-pulse"><span/><span/><span/></span>যোগ হচ্ছে...</span> : '⚔️ নিশ্চিত করুন'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
