import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { RiUserLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiShieldLine } from 'react-icons/ri';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.identifier, form.password);
      if (!['admin', 'moderator'].includes(data.user.role)) {
        toast.error('অ্যাডমিন অ্যাক্সেস প্রয়োজন');
        return;
      }
      toast.success(`স্বাগতম, ${data.user.username}! 👑`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'লগইন ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo-nobg.png" alt="BooyahZone" className="h-20 w-auto mx-auto mb-4 float-anim"
            onError={e => { e.target.style.display = 'none'; }} />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
            style={{ background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.25)', color: '#e879f9' }}>
            <RiShieldLine />অ্যাডমিন প্যানেল
          </div>
          <h1 className="font-orbitron font-black text-2xl text-white">অ্যাডমিন লগইন</h1>
          <p className="text-gray-400 text-sm mt-1">BooyahZone ম্যানেজমেন্ট সিস্টেম</p>
        </div>

        <div className="card-glass rounded-3xl p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">ইউজারনেম বা ইমেইল</label>
              <div className="relative">
                <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={form.identifier} onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                  className="input-field pl-10" placeholder="admin" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">পাসওয়ার্ড</label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                  {showPw ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
                </button>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #d946ef, #a21caf)', boxShadow: '0 8px 32px rgba(217,70,239,0.3)' }}>
              {loading ? 'লগইন হচ্ছে...' : '🔐 অ্যাডমিন লগইন'}
            </motion.button>
          </form>
          <p className="text-center text-gray-600 text-xs mt-4">ডিফল্ট: admin / Admin@123</p>
        </div>
      </motion.div>
    </div>
  );
}
