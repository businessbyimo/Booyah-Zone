import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSearchLine, RiUserForbidLine, RiUserLine, RiDeleteBinLine, RiMoneyDollarCircleLine, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
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
  const LIMIT = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/admin/users?page=${page}&limit=${LIMIT}${search ? `&search=${search}` : ''}`);
      setUsers(r.data.users || []);
      setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const ban = async (id, action) => {
    if (!window.confirm(`ইউজারকে ${action === 'ban' ? 'ব্যান' : 'আনব্যান'} করবেন?`)) return;
    try {
      await api.put(`/admin/users/${id}/${action}`);
      toast.success(`ইউজার ${action === 'ban' ? 'ব্যান' : 'আনব্যান'} হয়েছে`);
      fetchUsers();
    } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('এই ইউজার স্থায়ীভাবে মুছে ফেলবেন?')) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('মুছে ফেলা হয়েছে'); fetchUsers(); }
    catch { toast.error('মুছতে ব্যর্থ হয়েছে'); }
  };

  const adjustBalance = async () => {
    if (!adjustForm.amount) { toast.error('পরিমাণ দিন'); return; }
    try {
      await api.put(`/admin/users/${adjustModal.id}/balance`, adjustForm);
      toast.success('ব্যালেন্স আপডেট হয়েছে!');
      setAdjustModal(null);
      setAdjustForm({ amount: '', note: '' });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-orbitron font-bold text-xl text-white">ইউজার ম্যানেজমেন্ট</h2>
        <p className="text-xs text-gray-500">মোট: {total}জন</p>
      </div>

      <div className="mb-4 relative">
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-10" placeholder="নাম, ইমেইল বা FF ID দিয়ে খুঁজুন..." />
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['ইউজার', 'ইমেইল', 'FF ID', 'ব্যালেন্স', 'পয়েন্ট', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded shimmer w-20" /></td>)}
                </tr>
              )) : users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}>
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-white text-xs">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.free_fire_id || '-'}</td>
                  <td className="px-4 py-3 font-rajdhani font-bold text-yellow-400">৳{Number(u.balance || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 font-rajdhani font-bold text-cyan-400">{u.total_points || 0}</td>
                  <td className="px-4 py-3">
                    <span className={u.is_banned ? 'badge-cancelled' : 'badge-approved'}>
                      {u.is_banned ? '🔴 ব্যান' : '🟢 সক্রিয়'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setAdjustModal(u)}
                        className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors" title="ব্যালেন্স">
                        <RiMoneyDollarCircleLine className="text-base" />
                      </button>
                      <button onClick={() => ban(u.id, u.is_banned ? 'unban' : 'ban')}
                        className={`p-1.5 rounded-lg transition-colors ${u.is_banned ? 'text-green-400 hover:bg-green-400/10' : 'text-red-400 hover:bg-red-400/10'}`}>
                        {u.is_banned ? <RiUserLine className="text-base" /> : <RiUserForbidLine className="text-base" />}
                      </button>
                      <button onClick={() => deleteUser(u.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                        <RiDeleteBinLine className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">কোনো ইউজার নেই</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-40">
              <RiArrowLeftLine />আগে
            </button>
            <span className="text-xs text-gray-400">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-40">
              পরে<RiArrowRightLine />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {adjustModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center px-4"
            onClick={() => setAdjustModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-5 border border-white/10"
              style={{ background: '#13131F' }}
              onClick={e => e.stopPropagation()}>
              <h3 className="font-orbitron font-bold text-white mb-4">ব্যালেন্স অ্যাডজাস্ট — {adjustModal.username}</h3>
              <p className="text-xs text-gray-400 mb-3">বর্তমান ব্যালেন্স: <span className="text-yellow-400 font-bold">৳{Number(adjustModal.balance || 0).toFixed(2)}</span></p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">পরিমাণ (ধনাত্মক = যোগ, ঋণাত্মক = বিয়োগ)</label>
                  <input type="number" value={adjustForm.amount} onChange={e => setAdjustForm(f => ({ ...f, amount: e.target.value }))}
                    className="input-field" placeholder="যেমন: 100 বা -50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">নোট</label>
                  <input type="text" value={adjustForm.note} onChange={e => setAdjustForm(f => ({ ...f, note: e.target.value }))}
                    className="input-field" placeholder="কারণ লিখুন" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAdjustModal(null)} className="flex-1 py-3 rounded-xl text-gray-400 border border-white/10 text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>বাতিল</button>
                  <button onClick={adjustBalance} className="flex-1 py-3 rounded-xl font-bold text-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>সংরক্ষণ</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
