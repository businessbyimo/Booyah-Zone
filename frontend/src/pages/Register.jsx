import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { RiEyeLine, RiEyeOffLine, RiUserLine, RiMailLine, RiLockLine, RiGamepadLine, RiArrowLeftLine } from 'react-icons/ri';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', free_fire_id: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) { toast.error('শর্তাবলীতে সম্মত হন'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('অ্যাকাউন্ট তৈরি হয়েছে! BooyahZone-এ স্বাগতম! 🎮');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <Link to="/welcome" className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 mr-3">
            <RiArrowLeftLine className="text-lg" />
          </Link>
          <span className="text-sm text-gray-400">BooyahZone এ ফিরুন</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-5 pb-10 max-w-md mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-6">
              <img src="/logo-nobg.png" alt="BooyahZone" className="h-16 w-auto mx-auto mb-3 float-anim"
                onError={e => { e.target.style.display = 'none'; }} />
              <h1 className="font-orbitron font-black text-2xl text-gradient-rainbow mb-1">অ্যাকাউন্ট তৈরি</h1>
              <p className="text-gray-400 text-sm">আজই BooyahZone যোগ দিন!</p>
            </div>

            <div className="card-glass p-5 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">ইউজারনেম *</label>
                  <div className="relative">
                    <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                    <input type="text" value={form.username} onChange={set('username')}
                      className="input-field pl-10" placeholder="আপনার ইউজারনেম" required minLength={3} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">ইমেইল *</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                    <input type="email" value={form.email} onChange={set('email')}
                      className="input-field pl-10" placeholder="আপনার ইমেইল" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">পাসওয়ার্ড *</label>
                  <div className="relative">
                    <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                      className="input-field pl-10 pr-10" placeholder="মিনিমাম ৬ অক্ষর" required minLength={6} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                      {showPw ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">ফ্রি ফায়ার আইডি (ঐচ্ছিক)</label>
                  <div className="relative">
                    <RiGamepadLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                    <input type="text" value={form.free_fire_id} onChange={set('free_fire_id')}
                      className="input-field pl-10" placeholder="আপনার FF Player ID" />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="sr-only" />
                    <div className={`w-4 h-4 rounded border transition-all ${agree ? 'bg-cyan-400 border-cyan-400' : 'border-white/30 bg-transparent'}`}>
                      {agree && <svg viewBox="0 0 12 12" className="w-full h-full text-black" fill="currentColor"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    আমি BooyahZone এর{' '}
                    <span className="text-cyan-400">শর্তাবলী</span> এবং{' '}
                    <span className="text-cyan-400">গোপনীয়তা নীতি</span> মেনে নিচ্ছি
                  </span>
                </label>

                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading || !agree}
                  className="w-full py-3.5 rounded-2xl font-bold text-black text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', boxShadow: '0 8px 32px rgba(34,211,238,0.3)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="dot-pulse"><span /><span /><span /></span>
                      তৈরি হচ্ছে...
                    </span>
                  ) : '⚔️ অ্যাকাউন্ট তৈরি করুন'}
                </motion.button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <Link to="/login" className="text-fuchsia-400 font-semibold hover:text-fuchsia-300">লগইন করুন</Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
