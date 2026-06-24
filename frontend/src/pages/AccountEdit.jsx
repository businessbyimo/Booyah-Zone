import { useState } from 'react';
import { motion } from 'framer-motion';
import { RiUserLine, RiGamepadLine, RiCheckLine, RiArrowLeftLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition.jsx';

export default function AccountEdit() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: user?.username || '', free_fire_id: user?.free_fire_id || '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      setUser(prev => ({ ...prev, ...res.data }));
      toast.success('প্রোফাইল আপডেট হয়েছে!');
      navigate('/account');
    } catch (err) { toast.error(err.response?.data?.error || 'আপডেট ব্যর্থ হয়েছে'); }
    finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/account')} className="p-2 rounded-xl border border-white/10 text-gray-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <RiArrowLeftLine className="text-lg" />
          </button>
          <h2 className="font-orbitron font-bold text-sm text-white">প্রোফাইল সম্পাদনা</h2>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="card rounded-2xl p-4 space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">ইউজারনেম</label>
              <div className="relative">
                <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="input-field pl-10" placeholder="ইউজারনেম" required minLength={3} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">ইমেইল (পরিবর্তন করা যাবে না)</label>
              <input type="text" value={user?.email || ''} disabled
                className="input-field opacity-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">ফ্রি ফায়ার আইডি</label>
              <div className="relative">
                <RiGamepadLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={form.free_fire_id} onChange={e => setForm(f => ({ ...f, free_fire_id: e.target.value }))}
                  className="input-field pl-10" placeholder="আপনার FF Player ID" />
              </div>
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-black text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
            {loading ? <span className="dot-pulse"><span/><span/><span/></span> : <><RiCheckLine />সংরক্ষণ করুন</>}
          </motion.button>
        </form>
      </div>
    </PageTransition>
  );
}
