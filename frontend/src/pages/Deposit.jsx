import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiFileCopyLine, RiCheckLine, RiTimeLine, RiArrowLeftLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition.jsx';
import { format } from 'date-fns';

const METHODS = [
  { id: 'bkash', label: 'bKash', color: '#E2136E', bg: 'rgba(226,19,110,0.12)', border: 'rgba(226,19,110,0.25)', emoji: '🌸' },
  { id: 'nagad', label: 'Nagad', color: '#F26522', bg: 'rgba(242,101,34,0.12)', border: 'rgba(242,101,34,0.25)', emoji: '🟠' },
  { id: 'rocket', label: 'Rocket', color: '#8C3494', bg: 'rgba(140,52,148,0.12)', border: 'rgba(140,52,148,0.25)', emoji: '🚀' },
];
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function Deposit() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState('bkash');
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [pending, setPending] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/public/settings').then(r => setSettings(r.data || {})).catch(() => {});
    api.get('/payments/pending-deposits').then(r => setPending(r.data || [])).catch(() => {});
  }, []);

  const payNumber = settings[`${method}_number`] || settings['bkash_number'] || '01XXXXXXXXX';

  const copyNumber = () => {
    navigator.clipboard.writeText(payNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('নম্বর কপি হয়েছে!');
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 10) { toast.error('ন্যূনতম ডিপোজিট ৳১০'); return; }
    if (!txId.trim()) { toast.error('ট্রানজেকশন আইডি দিন'); return; }
    setLoading(true);
    try {
      await api.post('/payments/deposit', { amount: Number(amount), method, transaction_id: txId });
      toast.success('ডিপোজিট অনুরোধ পাঠানো হয়েছে! অনুমোদনের পর ব্যালেন্সে যোগ হবে।');
      setAmount('');
      setTxId('');
      api.get('/payments/pending-deposits').then(r => setPending(r.data || [])).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.error || 'ডিপোজিট ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  const m = METHODS.find(x => x.id === method);

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden border border-white/8"
          style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(217,70,239,0.04))' }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
            style={{ background: '#22d3ee', transform: 'translate(30%,-30%)' }} />
          <p className="text-xs text-gray-400 mb-1">বর্তমান ব্যালেন্স</p>
          <p className="font-rajdhani font-black text-4xl text-white">৳{Number(user?.balance || 0).toFixed(2)}</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">পেমেন্ট মেথড</p>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                  className="py-3 rounded-2xl flex flex-col items-center gap-1 border transition-all active:scale-95"
                  style={{
                    background: method === m.id ? m.bg : 'rgba(255,255,255,0.03)',
                    borderColor: method === m.id ? m.border : 'rgba(255,255,255,0.08)',
                    boxShadow: method === m.id ? `0 4px 20px ${m.color}20` : 'none',
                  }}>
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: method === m.id ? m.color : '#9ca3af' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card-glass p-4 rounded-2xl">
            <p className="text-xs text-gray-400 mb-2">পেমেন্ট নম্বরে টাকা পাঠান</p>
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 mb-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{m?.label} নম্বর</p>
                <p className="font-rajdhani font-bold text-lg text-white">{payNumber}</p>
              </div>
              <button type="button" onClick={copyNumber}
                className="p-2.5 rounded-xl transition-all active:scale-90"
                style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(34,211,238,0.1)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(34,211,238,0.2)'}` }}>
                {copied ? <RiCheckLine className="text-green-400 text-base" /> : <RiFileCopyLine className="text-cyan-400 text-base" />}
              </button>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>১. উপরের নম্বরে Send Money করুন</p>
              <p>২. Transaction ID সংগ্রহ করুন</p>
              <p>৩. নিচের ফর্মে তথ্য পূরণ করুন</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">পরিমাণ (৳)</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {QUICK_AMOUNTS.map(a => (
                <button key={a} type="button" onClick={() => setAmount(String(a))}
                  className="py-2 rounded-xl text-xs font-bold border transition-all active:scale-95"
                  style={{
                    background: amount === String(a) ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: amount === String(a) ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.08)',
                    color: amount === String(a) ? '#22d3ee' : '#9ca3af',
                  }}>
                  ৳{a}
                </button>
              ))}
            </div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="input-field" placeholder="অথবা কাস্টম পরিমাণ লিখুন" min="10" />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">ট্রানজেকশন আইডি</p>
            <input type="text" value={txId} onChange={e => setTxId(e.target.value)}
              className="input-field" placeholder="ট্রানজেকশন আইডি/রেফারেন্স নম্বর" required />
          </div>

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-black text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', boxShadow: '0 8px 32px rgba(34,211,238,0.3)' }}>
            {loading ? <span className="flex items-center justify-center gap-2"><span className="dot-pulse"><span/><span/><span/></span>পাঠানো হচ্ছে...</span> : '💰 ডিপোজিট অনুরোধ পাঠান'}
          </motion.button>
        </form>

        {pending.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
              <RiTimeLine className="text-yellow-400" />অপেক্ষমান ডিপোজিট
            </p>
            <div className="space-y-2">
              {pending.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">৳{Number(p.amount).toFixed(2)} — {p.method}</p>
                    <p className="text-[10px] text-gray-500">{format(new Date(p.created_at), 'dd MMM, HH:mm')}</p>
                  </div>
                  <span className="badge-pending">অপেক্ষমান</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
