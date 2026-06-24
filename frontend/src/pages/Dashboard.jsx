import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiDollarSign, FiClock, FiLogOut, FiEdit, FiCamera } from 'react-icons/fi';
import { GiTrophy, GiSword } from 'react-icons/gi';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PageTransition from '../components/PageTransition.jsx';

const TABS = ['Profile', 'Wallet', 'My Tournaments', 'Match History', 'Transactions'];

export default function Dashboard() {
  const { user, refreshUser, setUser } = useAuth();
  const [tab, setTab] = useState('Profile');
  const [profile, setProfile] = useState({ username: '', free_fire_id: '' });
  const [wallet, setWallet] = useState({ balance: 0 });
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
      setWallet({ balance: user.balance });
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'My Tournaments') fetchMyTournaments();
    if (tab === 'Match History') fetchMatchHistory();
    if (tab === 'Transactions') fetchTransactions();
  }, [tab]);

  const fetchMyTournaments = async () => {
    try {
      // Use admin endpoint to get user-specific data or parse from profile
      const res = await api.get('/payments/transactions?type=fee&limit=50');
      // Alternatively, we fetch user's participations via a dedicated endpoint
      const tRes = await api.get('/auth/me');
      // We'll get participations via a workaround
      setMyTournaments([]);
    } catch {}
  };

  const fetchMatchHistory = async () => {
    try { setMatchHistory([]); } catch {}
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/payments/transactions');
      setTransactions(res.data.transactions);
    } catch {}
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profile);
      setUser(prev => ({ ...prev, ...res.data }));
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
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
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const txBadge = (status) => `badge-${status}`;
  const txTypeColor = { deposit: 'text-green-400', withdrawal: 'text-red-400', fee: 'text-yellow-400', prize: 'text-fuchsia-400' };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-6xl mx-auto px-4">
        {/* Header */}
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
                <span className="badge-upcoming capitalize">{user?.role}</span>
                <span className="text-yellow-400 font-orbitron text-sm font-bold">৳{Number(user?.balance || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="ml-auto">
              <Link to="/payment" className="btn-primary text-sm px-4 py-2">💰 Wallet</Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-cyan-500/30'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'Profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card neon-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-orbitron font-bold text-white">Profile Info</h2>
                <button onClick={() => setEditing(!editing)} className="p-2 text-gray-400 hover:text-cyan-400"><FiEdit /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Username</label>
                  {editing ? <input value={profile.username} onChange={e => setProfile(f => ({...f, username: e.target.value}))} className="input-field mt-1" />
                    : <p className="text-white">{user?.username}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Free Fire ID</label>
                  {editing ? <input value={profile.free_fire_id} onChange={e => setProfile(f => ({...f, free_fire_id: e.target.value}))} className="input-field mt-1" placeholder="Your FF ID" />
                    : <p className="text-white">{user?.free_fire_id || '-'}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Total Points</label>
                  <p className="text-cyan-400 font-orbitron font-bold text-lg">{user?.total_points || 0}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Member Since</label>
                  <p className="text-white">{user?.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : '-'}</p>
                </div>
                {editing && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setEditing(false)} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
                    <button onClick={updateProfile} disabled={loading} className="flex-1 btn-primary text-sm py-2">Save</button>
                  </div>
                )}
              </div>
            </div>

            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">Change Password</h2>
              <form onSubmit={changePassword} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Current Password</label>
                  <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))} className="input-field mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">New Password</label>
                  <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} className="input-field mt-1" required />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary text-sm py-2 mt-2">Change Password</button>
              </form>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {tab === 'Wallet' && (
          <div className="space-y-4">
            <div className="card neon-border text-center">
              <p className="text-gray-400 text-sm mb-1">Current Balance</p>
              <p className="font-orbitron font-black text-5xl text-yellow-400 mb-4">৳{Number(user?.balance || 0).toFixed(2)}</p>
              <div className="flex gap-3 justify-center">
                <Link to="/payment?tab=deposit" className="btn-primary px-8">+ Deposit</Link>
                <Link to="/payment?tab=withdraw" className="btn-secondary px-8">- Withdraw</Link>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {tab === 'Transactions' && (
          <div className="card neon-border overflow-hidden">
            <h2 className="font-orbitron font-bold text-white mb-4">Transaction History</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-600 text-gray-500">
                      <th className="pb-2 text-left">Type</th>
                      <th className="pb-2 text-left">Amount</th>
                      <th className="pb-2 text-left">Method</th>
                      <th className="pb-2 text-left">Status</th>
                      <th className="pb-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} className="border-b border-dark-600/30">
                        <td className="py-2"><span className={`capitalize font-semibold ${txTypeColor[t.type] || 'text-white'}`}>{t.type}</span></td>
                        <td className="py-2 font-orbitron font-bold text-white">৳{Number(t.amount).toFixed(2)}</td>
                        <td className="py-2 text-gray-400">{t.method || '-'}</td>
                        <td className="py-2"><span className={txBadge(t.status)}>{t.status}</span></td>
                        <td className="py-2 text-gray-500">{format(new Date(t.created_at), 'MMM dd, HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'My Tournaments' && (
          <div className="card neon-border">
            <p className="text-gray-400 text-center py-8">Your registered tournaments will appear here. <Link to="/tournaments" className="text-cyan-400 hover:underline">Browse tournaments</Link></p>
          </div>
        )}
        {tab === 'Match History' && (
          <div className="card neon-border">
            <p className="text-gray-400 text-center py-8">Your match history will appear here after completing tournaments.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
