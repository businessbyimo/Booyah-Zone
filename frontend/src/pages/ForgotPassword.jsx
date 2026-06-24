import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { RiMailLine, RiArrowLeftLine } from 'react-icons/ri';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('রিসেট লিংক পাঠানো হয়েছে!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <div className="absolute inset-0 hero-bg" />
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-10 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/login" className="flex items-center gap-2 text-gray-400 text-sm mb-8">
            <RiArrowLeftLine />লগইনে ফিরুন
          </Link>

          {sent ? (
            <div className="text-center card-glass rounded-3xl p-8">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="font-orbitron font-bold text-xl text-cyan-400 mb-3">ইমেইল পাঠানো হয়েছে!</h2>
              <p className="text-gray-400 text-sm mb-5">পাসওয়ার্ড রিসেট লিংকের জন্য আপনার ইনবক্স চেক করুন। লিংকটি ১ ঘন্টা পরে মেয়াদ শেষ হবে।</p>
              <Link to="/login" className="btn-primary text-sm px-6 py-2.5 inline-block">লগইনে ফিরুন</Link>
            </div>
          ) : (
            <div className="card-glass rounded-3xl p-5">
              <h2 className="font-orbitron font-bold text-xl text-white mb-2">পাসওয়ার্ড ভুলে গেছেন?</h2>
              <p className="text-gray-400 text-sm mb-5">রিসেট লিংক পেতে আপনার রেজিস্টার্ড ইমেইল দিন।</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10" placeholder="আপনার@ইমেইল.com" required />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-bold text-black text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                  {loading ? 'পাঠানো হচ্ছে...' : '📧 রিসেট লিংক পাঠান'}
                </motion.button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
