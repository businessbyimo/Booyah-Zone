import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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
      const params = new URLSearchParams({ page, limit: 20 });
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const r = await api.get(`/admin/payments?${params}`);
      setTransactions(r.data.transactions);
      setTotal(r.data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, typeFilter, statusFilter]);

  const approve = async (id) => {
    try { await api.put(`/admin/payments/${id}/approve`); toast.success('অনুমোদিত ও ব্যালেন্স আপডেট হয়েছে'); fetchData(); } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
  };

  const reject = async () => {
    try {
      await api.put(`/admin/payments/${rejectModal}/reject`, { reason: rejectReason });
      toast.success('বাতিল করা হয়েছে');
      setRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const typeColor = { deposit: 'text-green-400', withdrawal: 'text-red-400', fee: 'text-yellow-400', prize: 'text-fuchsia-400' };
  const typeLabel = { deposit: 'ডিপোজিট', withdrawal: 'উইথড্র', fee: 'এন্ট্রি ফি', prize: 'পুরস্কার' };
  const statusLabel = { pending: 'অপেক্ষমান', approved: 'অনুমোদিত', rejected: 'বাতিল', failed: 'ব্যর্থ' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-xl text-white">পেমেন্ট ({total})</h2>
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"><FiRefreshCw /></button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {[{ v: '', l: 'সব ধরন' }, { v: 'deposit', l: 'ডিপোজিট' }, { v: 'withdrawal', l: 'উইথড্র' }].map(t => (
            <button key={t.v} onClick={() => { setTypeFilter(t.v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t.v ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
              {t.l}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {[{ v: '', l: 'সব স্ট্যাটাস' }, { v: 'pending', l: 'অপেক্ষমান' }, { v: 'approved', l: 'অনুমোদিত' }, { v: 'rejected', l: 'বাতিল' }].map(s => (
            <button key={s.v} onClick={() => { setStatusFilter(s.v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s.v ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <div className="card neon-border overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-600 text-gray-500 text-xs">
                <th className="pb-3 pl-4 text-left">ইউজার</th>
                <th className="pb-3 text-center">ধরন</th>
                <th className="pb-3 text-right">পরিমাণ</th>
                <th className="pb-3 text-center hidden sm:table-cell">মেথড</th>
                <th className="pb-3 text-left hidden md:table-cell">TrxID / অ্যাকাউন্ট</th>
                <th className="pb-3 text-center">স্ট্যাটাস</th>
                <th className="pb-3 text-right hidden sm:table-cell">সময়</th>
                <th className="pb-3 pr-4 text-right">অ্যাকশন</th>
              </tr></thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-gray-500 py-10">কোনো ট্রানজেকশন নেই</td></tr>
                ) : transactions.map(t => (
                  <tr key={t.id} className="border-b border-dark-600/30 hover:bg-dark-700/30">
                    <td className="py-3 pl-4">
                      <p className="text-white">{t.username}</p>
                      <p className="text-xs text-gray-500">{t.email}</p>
                    </td>
                    <td className="py-3 text-center font-semibold" style={{color: typeColor[t.type] || 'white'}}>{typeLabel[t.type] || t.type}</td>
                    <td className="py-3 text-right font-orbitron font-bold text-white">৳{Number(t.amount).toFixed(2)}</td>
                    <td className="py-3 text-center text-gray-400 hidden sm:table-cell">{t.method || '-'}</td>
                    <td className="py-3 text-gray-500 text-xs hidden md:table-cell truncate max-w-[120px]">{t.transaction_id || t.account_number || '-'}</td>
                    <td className="py-3 text-center"><span className={`badge-${t.status}`}>{statusLabel[t.status] || t.status}</span></td>
                    <td className="py-3 text-right text-gray-500 text-xs hidden sm:table-cell">{format(new Date(t.created_at), 'dd MMM, HH:mm')}</td>
                    <td className="py-3 pr-4">
                      {t.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => approve(t.id)} title="অনুমোদন" className="p-1.5 text-green-400 hover:bg-green-400/10 rounded transition-colors"><FiCheck /></button>
                          <button onClick={() => setRejectModal(t.id)} title="বাতিল" className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"><FiX /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {Math.ceil(total / 20) > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(Math.ceil(total / 20))].slice(0, 5).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm transition-all ${page === i + 1 ? 'bg-cyan-500 text-white' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* বাতিলের কারণ মডাল */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="card neon-border w-full max-w-sm">
            <h3 className="font-orbitron font-bold text-white mb-4">ট্রানজেকশন বাতিল করুন</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} className="input-field text-sm resize-none" placeholder="বাতিলের কারণ (ঐচ্ছিক)" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRejectModal(null)} className="flex-1 btn-secondary text-sm py-2">বাতিল করুন</button>
              <button onClick={reject} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg transition-colors text-sm">বাতিল নিশ্চিত</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
