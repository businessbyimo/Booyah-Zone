import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('পাসওয়ার্ড মিলছে না'); return; }
    if (password.length < 6) { toast.error('কমপক্ষে ৬ অক্ষর'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('পাসওয়ার্ড পুনরায় সেট হয়েছে! লগইন করুন।');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-400 mb-4">অবৈধ রিসেট লিংক</p>
        <Link to="/forgot-password" className="text-cyan-400">নতুন লিংক নিন</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <div className="absolute inset-0 hero-bg" />
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-10 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-6">
            <h1 className="font-orbitron font-black text-2xl text-gradient-rainbow mb-1">পাসওয়ার্ড রিসেট</h1>
            <p className="text-gray-400 text-sm">নতুন পাসওয়ার্ড সেট করুন</p>
          </div>
          <div className="card-glass rounded-3xl p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10" placeholder="নতুন পাসওয়ার্ড" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                  {show ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
                </button>
              </div>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="input-field pl-10" placeholder="পাসওয়ার্ড নিশ্চিত করুন" required />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-black text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                {loading ? 'সেট হচ্ছে...' : '🔒 পাসওয়ার্ড সেট করুন'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
