import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

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
      toast.success(`স্বাগতম, ${data.user.username}! 🎮`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'লগইন ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark-900 grid-pattern flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-nobg.png" alt="BooyahZone" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="font-orbitron font-bold text-2xl neon-text">অ্যাডমিন প্যানেল</h1>
          <p className="text-gray-400 text-sm mt-1">BooyahZone ম্যানেজমেন্ট সিস্টেম</p>
        </div>
        <div className="card neon-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">ইউজারনেম বা ইমেইল</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={form.identifier} onChange={e => setForm(f => ({...f, identifier: e.target.value}))} className="input-field pl-10" placeholder="admin" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">পাসওয়ার্ড</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input-field pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-orbitron disabled:opacity-50">
              {loading ? 'লগইন হচ্ছে...' : '🔐 অ্যাডমিন লগইন'}
            </button>
          </form>
          <p className="text-center text-gray-600 text-xs mt-4">ডিফল্ট: admin / Admin@123</p>
        </div>
      </motion.div>
    </div>
  );
}
