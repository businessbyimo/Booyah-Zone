import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';

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
        toast.error('Admin access required');
        return;
      }
      toast.success(`Welcome, ${data.user.username}!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark-900 grid-pattern flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center mx-auto mb-4">
            <GiCrossedSwords className="text-cyan-400 text-3xl" />
          </div>
          <h1 className="font-orbitron font-bold text-2xl neon-text">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">FF Arena Management System</p>
        </div>
        <div className="card neon-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Username or Email</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={form.identifier} onChange={e => setForm(f => ({...f, identifier: e.target.value}))} className="input-field pl-10" placeholder="admin" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input-field pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-orbitron disabled:opacity-50">
              {loading ? 'Logging in...' : '🔐 Admin Login'}
            </button>
          </form>
          <p className="text-center text-gray-600 text-xs mt-4">Default: admin / Admin@123</p>
        </div>
      </motion.div>
    </div>
  );
}
