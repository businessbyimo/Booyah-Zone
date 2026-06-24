import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCheckLine, RiCloseLine, RiRefreshLine } from 'react-icons/ri';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const typeLabel = { deposit: 'ডিপোজিট', withdrawal: 'উইথড্র', fee: 'এন্ট্রি ফি', prize: 'পুরস্কার' };
const typeColor = { deposit: '#10b981', withdrawal: '#ef4444', fee: '#f59e0b', prize: '#d946ef' };
const statusLabel = { pending: 'অপেক্ষমান', approved: 'অনুমোদিত', rejected: 'বাতিল', failed: 'ব্যর্থ' };

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModal, setRejectModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 20 });
      if (typeFilter) p.set('type', typeFilter);
      if (statusFilter) p.set('status', statusFilter);
      const r = await api.get(`/admin/payments?${p}`);
      setTransactions(r.data.transactions || []);
      setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, typeFilter, statusFilter]);

  const approve = async (id) => {
    try { await api.put(`/admin/payments/${id}/approve`); toast.success('অনুমোদিত ও ব্যালেন্স আপডেট হয়েছে'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
  };
  const reject = async () => {
    try {
      await api.put(`/admin/payments/${rejectModal}/reject`, { reason: rejectReason });
      toast.success('বাতিল করা হয়েছে');
      setRejectModal(null); setRejectReason('');
      fetchData();
    } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-orbitron font-bold text-xl text-white">পেমেন্ট ম্যানেজমেন্ট</h2>
        <button onClick={fetchData} className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-cyan-400 transition-colors">
          <RiRefreshLine />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[{ v: '', l: 'সব ধরন' }, { v: 'deposit', l: 'ডিপোজিট' }, { v: 'withdrawal', l: 'উইথড্র' }].map(f => (
          <button key={f.v} onClick={() => { setTypeFilter(f.v); setPage(1); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{ background: typeFilter === f.v ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.04)', borderColor: typeFilter === f.v ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.08)', color: typeFilter === f.v ? '#22d3ee' : '#9ca3af' }}>
            {f.l}
          </button>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        {[{ v: 'pending', l: '⏳ অপেক্ষমান' }, { v: 'approved', l: '✅ অনুমোদিত' }, { v: 'rejected', l: '❌ বাতিল' }].map(f => (
          <button key={f.v} onClick={() => { setStatusFilter(f.v); setPage(1); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{ background: statusFilter === f.v ? 'rgba(217,70,239,0.15)' : 'rgba(255,255,255,0.04)', borderColor: statusFilter === f.v ? 'rgba(217,70,239,0.4)' : 'rgba(255,255,255,0.08)', color: statusFilter === f.v ? '#d946ef' : '#9ca3af' }}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['সময়', 'ইউজার', 'ধরন', 'পরিমাণ', 'পদ্ধতি', 'TX ID', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(6)].map((_,i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(8)].map((_,j)=><td key={j} className="px-4 py-3"><div className="h-4 rounded shimmer w-16"/></td>)}
                </tr>
              )) : transactions.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {t.created_at ? format(new Date(t.created_at), 'dd MMM HH:mm') : '-'}
                  </td>
                  <td className="px-4 py-3 text-white font-medium text-xs">{t.username || t.user_id}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold" style={{ color: typeColor[t.type] }}>{typeLabel[t.type] || t.type}</span>
                  </td>
                  <td className="px-4 py-3 font-rajdhani font-bold" style={{ color: typeColor[t.type] }}>
                    ৳{Number(t.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{t.method || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[100px] truncate">{t.transaction_id || t.phone_number || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-${t.status} text-[10px]`}>{statusLabel[t.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    {t.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => approve(t.id)} className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10">
                          <RiCheckLine className="text-base" />
                        </button>
                        <button onClick={() => setRejectModal(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10">
                          <RiCloseLine className="text-base" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && transactions.length === 0 && <p className="text-gray-500 text-sm text-center py-8">কোনো ট্রানজেকশন নেই</p>}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-40">আগে</button>
            <span className="text-xs text-gray-400">{page}/{totalPages} · মোট {total}টি</span>
            <button onClick={()=>setPage(p=>p+1)} disabled={page>=totalPages} className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-40">পরে</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {rejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center px-4"
            onClick={() => setRejectModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl p-5 border border-red-500/20"
              style={{ background: '#13131F' }}
              onClick={e => e.stopPropagation()}>
              <h3 className="font-orbitron font-bold text-white mb-3">বাতিলের কারণ</h3>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                className="input-field resize-none mb-3 w-full" rows={3} placeholder="বাতিলের কারণ লিখুন (ঐচ্ছিক)" />
              <div className="flex gap-2">
                <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl text-gray-400 border border-white/10 text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>বাতিল</button>
                <button onClick={reject} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)' }}>❌ বাতিল করুন</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
