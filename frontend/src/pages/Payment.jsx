import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowDownCircle, FiArrowUpCircle, FiCopy, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PageTransition from '../components/PageTransition.jsx';

export default function Payment() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'deposit');
  const [settings, setSettings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState('');

  const [depositForm, setDepositForm] = useState({ amount: '', method: 'bKash', sender_number: '', transaction_id: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'bKash', account_number: '' });

  useEffect(() => {
    api.get('/payments/settings').then(r => setSettings(r.data)).catch(() => {});
    api.get('/payments/transactions').then(r => setTransactions(r.data.transactions)).catch(() => {});
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
    toast.success('কপি হয়েছে!');
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    setConfirmType('deposit');
    setShowConfirmModal(true);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(withdrawForm.amount) > parseFloat(user?.balance || 0)) {
      return toast.error('অপর্যাপ্ত ব্যালেন্স');
    }
    setConfirmType('withdraw');
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      if (confirmType === 'deposit') {
        await api.post('/payments/deposit', depositForm);
        toast.success('ডিপোজিট রিকোয়েস্ট জমা দেওয়া হয়েছে! ২৪ ঘণ্টার মধ্যে অনুমোদন হবে।');
        setDepositForm({ amount: '', method: 'bKash', sender_number: '', transaction_id: '' });
      } else {
        await api.post('/payments/withdraw', withdrawForm);
        toast.success('উইথড্র রিকোয়েস্ট জমা দেওয়া হয়েছে!');
        setWithdrawForm({ amount: '', method: 'bKash', account_number: '' });
      }
      api.get('/payments/transactions').then(r => setTransactions(r.data.transactions));
    } catch (err) {
      toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  const METHODS = ['bKash', 'Nagad', 'Rocket'];
  const methodNumbers = { bKash: settings.bkash_number, Nagad: settings.nagad_number, Rocket: settings.rocket_number };

  const txTypeLabel = { deposit: 'ডিপোজিট', withdrawal: 'উইথড্র', fee: 'এন্ট্রি ফি', prize: 'পুরস্কার' };
  const txTypeColor = { deposit: 'text-green-400', withdrawal: 'text-red-400', fee: 'text-yellow-400', prize: 'text-fuchsia-400' };
  const statusLabel = { pending: 'অপেক্ষমান', approved: 'অনুমোদিত', rejected: 'বাতিল', failed: 'ব্যর্থ' };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="section-title">💰 ওয়ালেট</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-400">বর্তমান ব্যালেন্স:</p>
            <span className="font-orbitron font-bold text-2xl text-yellow-400">৳{Number(user?.balance || 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-3 mb-8">
          <button onClick={() => setTab('deposit')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${tab === 'deposit' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
            <FiArrowDownCircle /> ডিপোজিট
          </button>
          <button onClick={() => setTab('withdraw')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${tab === 'withdraw' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
            <FiArrowUpCircle /> উইথড্র
          </button>
        </div>

        {tab === 'deposit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">📋 কীভাবে ডিপোজিট করবেন</h2>
              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2"><span className="text-cyan-400 font-bold">১.</span> পেমেন্ট মেথড বেছে নিন</li>
                <li className="flex gap-2"><span className="text-cyan-400 font-bold">২.</span> আমাদের নম্বরে টাকা পাঠান</li>
                <li className="flex gap-2"><span className="text-cyan-400 font-bold">৩.</span> ট্রানজেকশন আইডি (TrxID) নোট করুন</li>
                <li className="flex gap-2"><span className="text-cyan-400 font-bold">৪.</span> নিচের ফর্ম পূরণ করুন</li>
              </ol>
              <div className="mt-4 space-y-2">
                {METHODS.map(m => methodNumbers[m] && (
                  <div key={m} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg border border-dark-500">
                    <div>
                      <p className="text-sm font-semibold text-white">{m}</p>
                      <p className="text-xs text-gray-400">{methodNumbers[m]}</p>
                    </div>
                    <button onClick={() => copy(methodNumbers[m], m)} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                      {copied === m ? <FiCheck className="text-green-400" /> : <FiCopy />}
                    </button>
                  </div>
                ))}
              </div>
              {settings.min_deposit && (
                <p className="text-xs text-gray-500 mt-3">সর্বনিম্ন ডিপোজিট: ৳{settings.min_deposit}</p>
              )}
            </div>
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">ডিপোজিট জমা দিন</h2>
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">পেমেন্ট মেথড</label>
                  <select value={depositForm.method} onChange={e => setDepositForm(f => ({...f, method: e.target.value}))} className="input-field">
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">পরিমাণ (BDT)</label>
                  <input type="number" value={depositForm.amount} onChange={e => setDepositForm(f => ({...f, amount: e.target.value}))} className="input-field" placeholder="পরিমাণ দিন" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">আপনার নম্বর</label>
                  <input type="text" value={depositForm.sender_number} onChange={e => setDepositForm(f => ({...f, sender_number: e.target.value}))} className="input-field" placeholder="যেই নম্বর থেকে পাঠিয়েছেন" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">ট্রানজেকশন আইডি (TrxID)</label>
                  <input type="text" value={depositForm.transaction_id} onChange={e => setDepositForm(f => ({...f, transaction_id: e.target.value}))} className="input-field" placeholder="TrxID দিন" required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
                  {loading ? 'জমা হচ্ছে...' : 'ডিপোজিট জমা দিন'}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === 'withdraw' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">📋 উইথড্র তথ্য</h2>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>• ২৪ ঘণ্টার মধ্যে প্রসেস হবে</li>
                {settings.min_withdrawal && <li>• সর্বনিম্ন উইথড্র: ৳{settings.min_withdrawal}</li>}
                <li>• আপনার ব্যালেন্স: <span className="text-yellow-400 font-bold">৳{Number(user?.balance || 0).toFixed(2)}</span></li>
              </ul>
            </div>
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">উইথড্র রিকোয়েস্ট</h2>
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">পেমেন্ট মেথড</label>
                  <select value={withdrawForm.method} onChange={e => setWithdrawForm(f => ({...f, method: e.target.value}))} className="input-field">
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">পরিমাণ</label>
                  <input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({...f, amount: e.target.value}))} className="input-field" placeholder="উইথড্র পরিমাণ" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">অ্যাকাউন্ট নম্বর</label>
                  <input type="text" value={withdrawForm.account_number} onChange={e => setWithdrawForm(f => ({...f, account_number: e.target.value}))} className="input-field" placeholder="আপনার নম্বর" required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
                  {loading ? 'জমা হচ্ছে...' : 'উইথড্র রিকোয়েস্ট করুন'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ট্রানজেকশন হিস্টোরি */}
        <div className="card neon-border mt-8 overflow-hidden">
          <h2 className="font-orbitron font-bold text-white mb-4">📊 ট্রানজেকশন হিস্টোরি</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">কোনো ট্রানজেকশন নেই</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-600 text-gray-500">
                    <th className="pb-2 text-left py-2">ধরন</th>
                    <th className="pb-2 text-left py-2">পরিমাণ</th>
                    <th className="pb-2 text-left py-2">মেথড</th>
                    <th className="pb-2 text-left py-2">স্ট্যাটাস</th>
                    <th className="pb-2 text-left py-2">তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} className="border-b border-dark-600/30">
                      <td className="py-2"><span className={`capitalize font-semibold ${txTypeColor[t.type] || 'text-white'}`}>{txTypeLabel[t.type] || t.type}</span></td>
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
      </div>

      {/* কনফার্মেশন পপআপ */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-dark-800 border border-cyan-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowConfirmModal(false)} className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white">
                <FiX />
              </button>
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <FiAlertTriangle className="text-yellow-400 text-2xl" />
                </div>
                <h3 className="font-orbitron font-bold text-xl text-white mb-2">
                  {confirmType === 'deposit' ? 'ডিপোজিট নিশ্চিত করুন' : 'উইথড্র নিশ্চিত করুন'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {confirmType === 'deposit'
                    ? `৳${depositForm.amount} ডিপোজিট রিকোয়েস্ট জমা দেবেন?`
                    : `৳${withdrawForm.amount} উইথড্র রিকোয়েস্ট করবেন?`}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-xl bg-dark-700 border border-dark-500 text-gray-300 hover:border-cyan-500 transition-all font-semibold">
                  বাতিল
                </button>
                <button onClick={confirmAction} className="flex-1 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 transition-all font-semibold">
                  নিশ্চিত করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
