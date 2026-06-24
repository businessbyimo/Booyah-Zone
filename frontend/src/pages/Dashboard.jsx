import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiDollarSign, FiEdit, FiCamera, FiCheck, FiX } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PageTransition from '../components/PageTransition.jsx';

const TABS = [
  { id: 'profile', label: 'প্রোফাইল' },
  { id: 'wallet', label: 'ওয়ালেট' },
  { id: 'tournaments', label: 'আমার টুর্নামেন্ট' },
  { id: 'history', label: 'ম্যাচ হিস্টোরি' },
  { id: 'transactions', label: 'ট্রানজেকশন' },
];

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ username: '', free_fire_id: '' });
  const [myTournaments, setMyTournaments] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const fileRef = useRef();

  useEffect(() => {
    if (user) {
      setProfile({ username: user.username, free_fire_id: user.free_fire_id || '' });
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'tournaments') fetchMyTournaments();
    if (tab === 'history') fetchMatchHistory();
    if (tab === 'transactions') fetchTransactions();
  }, [tab]);

  const fetchMyTournaments = async () => {
    try {
      const res = await api.get('/auth/my-tournaments');
      setMyTournaments(res.data || []);
    } catch { setMyTournaments([]); }
  };

  const fetchMatchHistory = async () => {
    try {
      const res = await api.get('/auth/match-history');
      setMatchHistory(res.data || []);
    } catch { setMatchHistory([]); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/payments/transactions');
      setTransactions(res.data.transactions || []);
    } catch { setTransactions([]); }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profile);
      setUser(prev => ({ ...prev, ...res.data }));
      toast.success('প্রোফাইল আপডেট হয়েছে!');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.error || 'আপডেট ব্যর্থ হয়েছে'); }
    finally { setLoading(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(prev => ({ ...prev, avatar: res.data.avatarUrl }));
      toast.success('প্রোফাইল ছবি আপডেট হয়েছে!');
    } catch { toast.error('আপলোড ব্যর্থ হয়েছে'); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
    finally { setLoading(false); }
  };

  const txTypeLabel = { deposit: 'ডিপোজিট', withdrawal: 'উইথড্র', fee: 'এন্ট্রি ফি', prize: 'পুরস্কার' };
  const txTypeColor = { deposit: 'text-green-400', withdrawal: 'text-red-400', fee: 'text-yellow-400', prize: 'text-fuchsia-400' };
  const statusLabel = { pending: 'অপেক্ষমান', approved: 'অনুমোদিত', rejected: 'বাতিল', failed: 'ব্যর্থ' };
  const participantStatusLabel = { pending: 'অপেক্ষমান', approved: 'অনুমোদিত', rejected: 'বাতিল', checked_in: 'চেক-ইন', completed: 'সম্পন্ন' };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-6xl mx-auto px-4">
        {/* প্রোফাইল হেডার কার্ড */}
        <div className="card neon-border mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-500/50 overflow-hidden bg-dark-700 flex items-center justify-center cursor-pointer" onClick={() => fileRef.current?.click()}>
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <FiUser className="text-cyan-400 text-2xl" />}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                <FiCamera className="text-white text-xs" />
              </button>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div>
              <h1 className="font-orbitron font-bold text-xl text-white">{user?.username}</h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${user?.role === 'admin' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'}`}>
                  {user?.role === 'admin' ? 'অ্যাডমিন' : user?.role === 'moderator' ? 'মডারেটর' : 'ইউজার'}
                </span>
                <span className="text-yellow-400 font-orbitron text-sm font-bold">৳{Number(user?.balance || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="ml-auto">
              <Link to="/payment" className="btn-primary text-sm px-4 py-2">💰 ওয়ালেট</Link>
            </div>
          </div>
        </div>

        {/* ট্যাব */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-cyan-500/30'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* প্রোফাইল ট্যাব */}
        {tab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card neon-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-orbitron font-bold text-white">প্রোফাইল তথ্য</h2>
                <button onClick={() => setEditing(!editing)} className="p-2 text-gray-400 hover:text-cyan-400"><FiEdit /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">ইউজারনেম</label>
                  {editing ? <input value={profile.username} onChange={e => setProfile(f => ({...f, username: e.target.value}))} className="input-field mt-1" />
                    : <p className="text-white mt-1">{user?.username}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500">ইমেইল</label>
                  <p className="text-white mt-1">{user?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">ফ্রি ফায়ার আইডি</label>
                  {editing ? <input value={profile.free_fire_id} onChange={e => setProfile(f => ({...f, free_fire_id: e.target.value}))} className="input-field mt-1" placeholder="আপনার FF আইডি" />
                    : <p className="text-white mt-1">{user?.free_fire_id || '-'}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500">মোট পয়েন্ট</label>
                  <p className="text-cyan-400 font-orbitron font-bold text-lg mt-1">{user?.total_points || 0}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">সদস্য হওয়ার তারিখ</label>
                  <p className="text-white mt-1">{user?.created_at ? format(new Date(user.created_at), 'dd MMM, yyyy') : '-'}</p>
                </div>
                {editing && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setEditing(false)} className="flex-1 btn-secondary text-sm py-2">বাতিল</button>
                    <button onClick={updateProfile} disabled={loading} className="flex-1 btn-primary text-sm py-2">সংরক্ষণ করুন</button>
                  </div>
                )}
              </div>
            </div>
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">পাসওয়ার্ড পরিবর্তন</h2>
              <form onSubmit={changePassword} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">বর্তমান পাসওয়ার্ড</label>
                  <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))} className="input-field mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">নতুন পাসওয়ার্ড</label>
                  <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} className="input-field mt-1" required />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary text-sm py-2 mt-2">পাসওয়ার্ড পরিবর্তন করুন</button>
              </form>
            </div>
          </div>
        )}

        {/* ওয়ালেট ট্যাব */}
        {tab === 'wallet' && (
          <div className="space-y-4">
            <div className="card neon-border text-center">
              <p className="text-gray-400 text-sm mb-1">বর্তমান ব্যালেন্স</p>
              <p className="font-orbitron font-black text-5xl text-yellow-400 mb-4">৳{Number(user?.balance || 0).toFixed(2)}</p>
              <div className="flex gap-3 justify-center">
                <Link to="/payment?tab=deposit" className="btn-primary px-8">+ ডিপোজিট</Link>
                <Link to="/payment?tab=withdraw" className="btn-secondary px-8">- উইথড্র</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card neon-border text-center">
                <GiTrophy className="text-yellow-400 text-3xl mx-auto mb-2" />
                <p className="font-orbitron font-bold text-2xl text-white">{user?.total_points || 0}</p>
                <p className="text-gray-400 text-sm">মোট পয়েন্ট</p>
              </div>
              <div className="card neon-border text-center">
                <FiDollarSign className="text-green-400 text-3xl mx-auto mb-2" />
                <p className="font-orbitron font-bold text-2xl text-white">৳{Number(user?.balance || 0).toFixed(2)}</p>
                <p className="text-gray-400 text-sm">উপলব্ধ ব্যালেন্স</p>
              </div>
            </div>
          </div>
        )}

        {/* আমার টুর্নামেন্ট */}
        {tab === 'tournaments' && (
          <div className="card neon-border">
            <h2 className="font-orbitron font-bold text-white mb-4">আমার টুর্নামেন্ট</h2>
            {myTournaments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">🏟️</p>
                <p className="text-gray-500">এখনো কোনো টুর্নামেন্টে যোগ দেননি</p>
                <Link to="/tournaments" className="btn-primary text-sm px-6 py-2 mt-4 inline-block">টুর্নামেন্ট দেখুন</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myTournaments.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg border border-dark-500">
                    <div>
                      <p className="text-white font-semibold">{t.tournament_name || t.name}</p>
                      <p className="text-gray-400 text-xs">{t.registered_at ? format(new Date(t.registered_at), 'dd MMM yyyy') : ''}</p>
                    </div>
                    <span className={`badge-${t.status}`}>{participantStatusLabel[t.status] || t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ম্যাচ হিস্টোরি */}
        {tab === 'history' && (
          <div className="card neon-border overflow-hidden">
            <h2 className="font-orbitron font-bold text-white mb-4">ম্যাচ হিস্টোরি</h2>
            {matchHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">⚔️</p>
                <p className="text-gray-500">এখনো কোনো ম্যাচ খেলেননি</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-600 text-gray-500">
                      <th className="pb-2 text-left">টুর্নামেন্ট</th>
                      <th className="pb-2 text-center">প্লেসমেন্ট</th>
                      <th className="pb-2 text-center">কিল</th>
                      <th className="pb-2 text-center">পয়েন্ট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchHistory.map(m => (
                      <tr key={m.id} className="border-b border-dark-600/30">
                        <td className="py-2 text-white">{m.tournament_name}</td>
                        <td className="py-2 text-center text-yellow-400">{m.placement}</td>
                        <td className="py-2 text-center text-green-400">{m.kill_points}</td>
                        <td className="py-2 text-center text-cyan-400 font-bold">{m.total_points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ট্রানজেকশন ট্যাব */}
        {tab === 'transactions' && (
          <div className="card neon-border overflow-hidden">
            <h2 className="font-orbitron font-bold text-white mb-4">ট্রানজেকশন হিস্টোরি</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">কোনো ট্রানজেকশন নেই</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-600 text-gray-500">
                      <th className="pb-2 text-left">ধরন</th>
                      <th className="pb-2 text-left">পরিমাণ</th>
                      <th className="pb-2 text-left">মেথড</th>
                      <th className="pb-2 text-left">স্ট্যাটাস</th>
                      <th className="pb-2 text-left">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} className="border-b border-dark-600/30">
                        <td className="py-2"><span className={`font-semibold ${txTypeColor[t.type] || 'text-white'}`}>{txTypeLabel[t.type] || t.type}</span></td>
                        <td className="py-2 font-orbitron font-bold text-white">৳{Number(t.amount).toFixed(2)}</td>
                        <td className="py-2 text-gray-400">{t.method || '-'}</td>
                        <td className="py-2"><span className={`badge-${t.status}`}>{statusLabel[t.status] || t.status}</span></td>
                        <td className="py-2 text-gray-500">{format(new Date(t.created_at), 'dd MMM, HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
