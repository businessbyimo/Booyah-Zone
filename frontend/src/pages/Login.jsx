import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';
import PageTransition from '../components/PageTransition.jsx';

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
      toast.success(`Welcome back, ${data.user.username}!`);
      if (['admin', 'moderator'].includes(data.user.role)) navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="grid-pattern absolute inset-0 opacity-20" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <GiCrossedSwords className="text-cyan-400 text-4xl mx-auto mb-3" />
            <h1 className="font-orbitron font-bold text-3xl neon-text">Welcome Back</h1>
            <p className="text-gray-400 mt-2">Enter the arena</p>
          </div>
          <div className="card neon-border">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Username or Email</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" value={form.identifier} onChange={e => setForm(f => ({...f, identifier: e.target.value}))}
                    className="input-field pl-10" placeholder="Enter username or email" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                    className="input-field pl-10 pr-10" placeholder="Enter password" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <Link to="/forgot-password" className="text-xs text-cyan-400 hover:underline mt-1 block text-right">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Logging in...' : '⚔️ Login'}
              </button>
            </form>
            <p className="text-center text-gray-400 text-sm mt-5">
              Don't have an account? <Link to="/register" className="text-cyan-400 hover:underline">Register</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
