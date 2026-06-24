import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';
import PageTransition from '../components/PageTransition.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', free_fire_id: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to FF Arena! 🎮');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
        <div className="grid-pattern absolute inset-0 opacity-20" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <GiCrossedSwords className="text-fuchsia-400 text-4xl mx-auto mb-3" />
            <h1 className="font-orbitron font-bold text-3xl magenta-text">Join FF Arena</h1>
            <p className="text-gray-400 mt-2">Create your free account</p>
          </div>
          <div className="card neon-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Username *</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" value={form.username} onChange={set('username')} className="input-field pl-10" placeholder="Choose a username" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={form.email} onChange={set('email')} className="input-field pl-10" placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input-field pl-10 pr-10" placeholder="At least 8 characters" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Free Fire ID (optional)</label>
                <input type="text" value={form.free_fire_id} onChange={set('free_fire_id')} className="input-field" placeholder="Your Free Fire player ID" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 mt-2">
                {loading ? 'Creating account...' : '🎮 Create Account'}
              </button>
            </form>
            <p className="text-center text-gray-400 text-sm mt-5">
              Already have an account? <Link to="/login" className="text-cyan-400 hover:underline">Login</Link>
            </p>
            <p className="text-center text-gray-500 text-xs mt-2">
              By registering, you agree to our <Link to="/page/terms" className="text-gray-400 hover:underline">Terms</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
