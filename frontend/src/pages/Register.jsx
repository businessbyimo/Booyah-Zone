import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from 'react-icons/fi';
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
      toast.success('অ্যাকাউন্ট তৈরি হয়েছে! BooyahZone-এ স্বাগতম! 🎮');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
        <div className="grid-pattern absolute inset-0 opacity-20" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <img src="/logo-nobg.png" alt="BooyahZone" className="h-20 w-auto mx-auto mb-3" />
            <h1 className="font-orbitron font-bold text-3xl magenta-text">BooyahZone-এ যোগ দিন</h1>
            <p className="text-gray-400 mt-2">বিনামূল্যে অ্যাকাউন্ট তৈরি করুন</p>
          </div>
          <div className="card neon-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">ইউজারনেম *</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" value={form.username} onChange={set('username')} className="input-field pl-10" placeholder="ইউজারনেম বেছে নিন" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">ইমেইল *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={form.email} onChange={set('email')} className="input-field pl-10" placeholder="আপনার@ইমেইল.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">পাসওয়ার্ড *</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input-field pl-10 pr-10" placeholder="কমপক্ষে ৮ অক্ষর" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">ফ্রি ফায়ার আইডি (ঐচ্ছিক)</label>
                <input type="text" value={form.free_fire_id} onChange={set('free_fire_id')} className="input-field" placeholder="আপনার ফ্রি ফায়ার প্লেয়ার আইডি" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 mt-2">
                {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : '🎮 অ্যাকাউন্ট তৈরি করুন'}
              </button>
            </form>
            <p className="text-center text-gray-400 text-sm mt-5">
              ইতিমধ্যে অ্যাকাউন্ট আছে? <Link to="/login" className="text-cyan-400 hover:underline">লগইন করুন</Link>
            </p>
            <p className="text-center text-gray-500 text-xs mt-2">
              রেজিস্টার করার মাধ্যমে আপনি আমাদের <Link to="/page/terms" className="text-gray-400 hover:underline">শর্তাবলীতে</Link> সম্মত হচ্ছেন
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
