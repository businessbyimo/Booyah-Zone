import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import PageTransition from '../components/PageTransition.jsx';

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
      toast.success('রিসেট লিংক পাঠানো হয়েছে! আপনার ইমেইল চেক করুন।');
    } catch (err) {
      toast.error(err.response?.data?.error || 'রিসেট ইমেইল পাঠাতে ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="card neon-border">
            <Link to="/login" className="flex items-center text-gray-400 hover:text-cyan-400 text-sm mb-6">
              <FiArrowLeft className="mr-1" /> লগইনে ফিরুন
            </Link>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">📬</div>
                <h2 className="font-orbitron font-bold text-2xl text-cyan-400 mb-2">ইমেইল পাঠানো হয়েছে!</h2>
                <p className="text-gray-400">পাসওয়ার্ড রিসেট লিংকের জন্য আপনার ইনবক্স চেক করুন। এটি ১ ঘণ্টা পরে মেয়াদ শেষ হবে।</p>
              </div>
            ) : (
              <>
                <h2 className="font-orbitron font-bold text-2xl text-white mb-2">পাসওয়ার্ড ভুলে গেছেন?</h2>
                <p className="text-gray-400 text-sm mb-6">রিসেট লিংক পেতে আপনার ইমেইল দিন।</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" placeholder="আপনার@ইমেইল.com" required />
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                    {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
