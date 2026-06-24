import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { RiEyeLine, RiEyeOffLine, RiUserLine, RiLockLine, RiArrowLeftLine } from 'react-icons/ri';

export default function Login() {
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
      toast.success(`স্বাগতম, ${data.user.username}! 🎮`);
      if (['admin', 'moderator'].includes(data.user.role)) navigate('/admin');
      else navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.error || 'লগইন ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="px-4 pt-12 pb-6 flex items-center">
          <Link to="/welcome" className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 mr-3">
            <RiArrowLeftLine className="text-lg" />
          </Link>
          <span className="text-sm text-gray-400">BooyahZone এ ফিরুন</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-5 pb-10 max-w-md mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-8">
              <img src="/logo-nobg.png" alt="BooyahZone" className="h-20 w-auto mx-auto mb-4 float-anim"
                onError={e => { e.target.style.display = 'none'; }} />
              <h1 className="font-orbitron font-black text-2xl text-gradient-rainbow mb-1">স্বাগতম ফিরে!</h1>
              <p className="text-gray-400 text-sm">অ্যারেনায় প্রবেশ করুন</p>
            </div>

            <div className="card-glass p-5 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">ইউজারনেম বা ইমেইল</label>
                  <div className="relative">
                    <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                    <input type="text" value={form.identifier}
                      onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                      className="input-field pl-10" placeholder="ইউজারনেম বা ইমেইল" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">পাসওয়ার্ড</label>
                  <div className="relative">
                    <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="input-field pl-10 pr-10" placeholder="পাসওয়ার্ড দিন" required />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                      {showPw ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
                    </button>
                  </div>
                  <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 mt-1.5 block text-right">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-bold text-black text-sm mt-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', boxShadow: '0 8px 32px rgba(34,211,238,0.3)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="dot-pulse"><span /><span /><span /></span>
                      লগইন হচ্ছে...
                    </span>
                  ) : '🔑 লগইন করুন'}
                </motion.button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-sm text-gray-400">
                  অ্যাকাউন্ট নেই?{' '}
                  <Link to="/register" className="text-fuchsia-400 font-semibold hover:text-fuchsia-300">
                    রেজিস্টার করুন
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
