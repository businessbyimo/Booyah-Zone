import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiTimeLine, RiInformationLine } from 'react-icons/ri';
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
const QUICK = [100, 200, 500, 1000];

export default function Withdraw() {
  const { user } = useAuth();
  const [method, setMethod] = useState('bkash');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    api.get('/payments/pending-withdrawals').then(r => setPending(r.data || [])).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const bal = Number(user?.balance || 0);
    const amt = Number(amount);
    if (amt < 100) { toast.error('ন্যূনতম উইথড্র ৳১০০'); return; }
    if (amt > bal) { toast.error('অপর্যাপ্ত ব্যালেন্স'); return; }
    if (!phone.trim()) { toast.error('নম্বর দিন'); return; }
    setLoading(true);
    try {
      await api.post('/payments/withdraw', { amount: amt, method, phone_number: phone });
      toast.success('উইথড্র অনুরোধ পাঠানো হয়েছে! ২৪ ঘন্টার মধ্যে প্রসেস হবে।');
      setAmount('');
      setPhone('');
      api.get('/payments/pending-withdrawals').then(r => setPending(r.data || [])).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.error || 'উইথড্র ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden border border-white/8"
          style={{ background: 'linear-gradient(135deg, rgba(217,70,239,0.08), rgba(34,211,238,0.04))' }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
            style={{ background: '#d946ef', transform: 'translate(30%,-30%)' }} />
          <p className="text-xs text-gray-400 mb-1">উপলব্ধ ব্যালেন্স</p>
          <p className="font-rajdhani font-black text-4xl text-white">৳{Number(user?.balance || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">ন্যূনতম উইথড্র: ৳১০০</p>
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

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">পরিমাণ (৳)</p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {QUICK.map(a => (
                <button key={a} type="button" onClick={() => setAmount(String(a))}
                  className="py-2 rounded-xl text-xs font-bold border transition-all active:scale-95"
                  style={{
                    background: amount === String(a) ? 'rgba(217,70,239,0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: amount === String(a) ? 'rgba(217,70,239,0.4)' : 'rgba(255,255,255,0.08)',
                    color: amount === String(a) ? '#d946ef' : '#9ca3af',
                  }}>
                  ৳{a}
                </button>
              ))}
            </div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="input-field" placeholder="পরিমাণ লিখুন" min="100" max={user?.balance || 0} />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">{METHODS.find(m=>m.id===method)?.label} নম্বর</p>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="input-field" placeholder="01XXXXXXXXX" required />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl border border-yellow-500/20"
            style={{ background: 'rgba(245,158,11,0.06)' }}>
            <RiInformationLine className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">উইথড্র অনুরোধ প্রসেস হতে সর্বোচ্চ ২৪ ঘন্টা সময় লাগতে পারে।</p>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #d946ef, #a21caf)', boxShadow: '0 8px 32px rgba(217,70,239,0.3)' }}>
            {loading ? <span className="flex items-center justify-center gap-2"><span className="dot-pulse"><span/><span/><span/></span>পাঠানো হচ্ছে...</span> : '📤 উইথড্র অনুরোধ পাঠান'}
          </motion.button>
        </form>

        {pending.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
              <RiTimeLine className="text-yellow-400" />অপেক্ষমান উইথড্র
            </p>
            <div className="space-y-2">
              {pending.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">৳{Number(p.amount).toFixed(2)} → {p.method}</p>
                    <p className="text-[10px] text-gray-500">{p.phone_number} · {format(new Date(p.created_at), 'dd MMM, HH:mm')}</p>
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
