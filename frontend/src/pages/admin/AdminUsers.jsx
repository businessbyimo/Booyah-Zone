import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiTrash2, FiLock, FiUnlock, FiDollarSign, FiX } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ amount: '', note: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=20${search ? `&search=${search}` : ''}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const ban = async (id, action) => {
    try {
      await api.put(`/admin/users/${id}/${action}`);
      toast.success(`ইউজার ${action === 'ban' ? 'ব্যান' : 'আনব্যান'} হয়েছে`);
      fetchUsers();
    } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('এই ইউজার স্থায়ীভাবে মুছে ফেলবেন?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('ইউজার মুছে ফেলা হয়েছে');
      fetchUsers();
    } catch { toast.error('মুছতে ব্যর্থ হয়েছে'); }
  };

  const adjustBalance = async (id) => {
    try {
      await api.post(`/admin/users/${id}/adjust-balance`, adjustForm);
      toast.success('ব্যালেন্স আপডেট হয়েছে');
      setAdjustModal(null);
      setAdjustForm({ amount: '', note: '' });
      fetchUsers();
    } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const roleLabel = { admin: 'অ্যাডমিন', moderator: 'মডারেটর', user: 'ইউজার' };
  const statusLabel = { active: 'সক্রিয়', banned: 'ব্যান' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-xl text-white">ইউজার ({total})</h2>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ইউজার খুঁজুন..." className="input-field pl-10 text-sm" />
        </div>
      </div>

      <div className="card neon-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600 text-gray-500 text-xs">
                  <th className="pb-3 pl-4 text-left">ইউজার</th>
                  <th className="pb-3 text-left hidden md:table-cell">FF আইডি</th>
                  <th className="pb-3 text-center">রোল</th>
                  <th className="pb-3 text-center">স্ট্যাটাস</th>
                  <th className="pb-3 text-right">ব্যালেন্স</th>
                  <th className="pb-3 text-right hidden sm:table-cell">যোগদান</th>
                  <th className="pb-3 pr-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-dark-600/30 hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 pl-4">
                      <div>
                        <p className="text-white font-medium">{u.username}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400 hidden md:table-cell">{u.free_fire_id || '-'}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${u.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : u.role === 'moderator' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-dark-600 text-gray-400'}`}>
                        {roleLabel[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={u.status === 'active' ? 'badge-approved' : 'badge-rejected'}>{statusLabel[u.status] || u.status}</span>
                    </td>
                    <td className="py-3 text-right font-orbitron text-sm text-yellow-400">৳{Number(u.balance).toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-500 text-xs hidden sm:table-cell">{format(new Date(u.created_at), 'dd MMM, yy')}</td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setAdjustModal(u)} title="ব্যালেন্স সমন্বয়" className="p-1.5 text-yellow-400 hover:bg-yellow-400/10 rounded transition-colors">
                          <FiDollarSign className="text-sm" />
                        </button>
                        <button onClick={() => ban(u.id, u.status === 'banned' ? 'unban' : 'ban')}
                          className={`p-1.5 rounded transition-colors ${u.status === 'banned' ? 'text-green-400 hover:bg-green-400/10' : 'text-orange-400 hover:bg-orange-400/10'}`}>
                          {u.status === 'banned' ? <FiUnlock className="text-sm" /> : <FiLock className="text-sm" />}
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors">
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* পেজিনেশন */}
      <div className="flex justify-center gap-2">
        {[...Array(Math.ceil(total / 20))].slice(0, 8).map((_, i) => (
          <button key={i} onClick={() => setPage(i + 1)}
            className={`w-9 h-9 rounded-lg text-sm transition-all ${page === i + 1 ? 'bg-cyan-500 text-white' : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-cyan-500'}`}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* ব্যালেন্স সমন্বয় মডাল */}
      {adjustModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card neon-border w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron font-bold text-white">ব্যালেন্স সমন্বয়</h3>
              <button onClick={() => setAdjustModal(null)}><FiX className="text-gray-400" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">ইউজার: <span className="text-white">{adjustModal.username}</span> | ব্যালেন্স: <span className="text-yellow-400">৳{Number(adjustModal.balance).toFixed(2)}</span></p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">পরিমাণ (বিয়োগ করতে -ব্যবহার করুন)</label>
                <input type="number" value={adjustForm.amount} onChange={e => setAdjustForm(f => ({...f, amount: e.target.value}))} className="input-field mt-1 text-sm" placeholder="যেমন: ১০০ বা -৫০" />
              </div>
              <div>
                <label className="text-xs text-gray-400">কারণ</label>
                <input type="text" value={adjustForm.note} onChange={e => setAdjustForm(f => ({...f, note: e.target.value}))} className="input-field mt-1 text-sm" placeholder="সমন্বয়ের কারণ" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setAdjustModal(null)} className="flex-1 btn-secondary text-sm py-2">বাতিল</button>
                <button onClick={() => adjustBalance(adjustModal.id)} className="flex-1 btn-primary text-sm py-2">প্রয়োগ করুন</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
