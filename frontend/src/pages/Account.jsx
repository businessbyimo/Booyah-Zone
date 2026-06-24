import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  RiUserLine, RiLockLine, RiSwordLine, RiBarChartLine,
  RiMoneyDollarCircleLine, RiBellLine, RiCustomerServiceLine,
  RiFileListLine, RiLogoutBoxLine, RiArrowRightLine,
  RiCameraLine, RiShieldLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition.jsx';

export default function Account() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [showLogout, setShowLogout] = useState(false);

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(prev => ({ ...prev, avatar: res.data.avatarUrl }));
      toast.success('প্রোফাইল ছবি আপডেট হয়েছে!');
    } catch { toast.error('আপলোড ব্যর্থ হয়েছে'); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/welcome');
  };

  const MENU = [
    { icon: RiUserLine, label: 'প্রোফাইল সম্পাদনা', to: '/account/edit', color: '#22d3ee' },
    { icon: RiLockLine, label: 'পাসওয়ার্ড পরিবর্তন', to: '/account/password', color: '#d946ef' },
    { icon: RiSwordLine, label: 'আমার টুর্নামেন্ট', to: '/account/tournaments', color: '#f59e0b' },
    { icon: RiBarChartLine, label: 'ম্যাচ হিস্টোরি', to: '/account/matches', color: '#10b981' },
    { icon: RiMoneyDollarCircleLine, label: 'ট্রানজেকশন হিস্টোরি', to: '/account/transactions', color: '#3b82f6' },
    { icon: RiBellLine, label: 'নোটিফিকেশন', to: '/account/notifications', color: '#f97316' },
    { icon: RiFileListLine, label: 'ডকুমেন্টেশন', to: '/docs', color: '#8b5cf6' },
    { icon: RiCustomerServiceLine, label: 'সাপোর্ট / চ্যাটবট', action: 'chatbot', color: '#06b6d4' },
  ];

  if (user?.role === 'admin' || user?.role === 'moderator') {
    MENU.push({ icon: RiShieldLine, label: 'অ্যাডমিন প্যানেল', to: '/admin', color: '#fbbf24' });
  }

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden border border-white/8"
          style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.06), rgba(217,70,239,0.04))' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15"
            style={{ background: '#22d3ee', transform: 'translate(40%,-40%)' }} />

          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl border-2 border-cyan-400/30 overflow-hidden bg-dark-600 flex items-center justify-center cursor-pointer"
                onClick={() => fileRef.current?.click()}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : <RiUserLine className="text-cyan-400 text-2xl" />}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border border-dark-800"
                style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                <RiCameraLine className="text-black text-xs" />
              </button>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleAvatar} className="hidden" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-orbitron font-bold text-lg text-white truncate">{user?.username}</h1>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`badge-${user?.role}`}>
                  {user?.role === 'admin' ? '👑 অ্যাডমিন' : user?.role === 'moderator' ? '🛡️ মডারেটর' : '⚔️ খেলোয়াড়'}
                </span>
                {user?.free_fire_id && (
                  <span className="text-[10px] text-gray-500">FF: {user.free_fire_id}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'ব্যালেন্স', value: `৳${Number(user?.balance || 0).toFixed(0)}`, color: '#f59e0b' },
              { label: 'পয়েন্ট', value: (user?.total_points || 0).toLocaleString(), color: '#22d3ee' },
              { label: 'র্যাংক', value: user?.rank ? `#${user.rank}` : '-', color: '#d946ef' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-2 text-center border border-white/8"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="font-rajdhani font-black text-base" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: '#13131F' }}>
          {MENU.map(({ icon: Icon, label, to, action, color }, i) => (
            <motion.div key={i} whileTap={{ scale: 0.98 }}>
              {to ? (
                <Link to={to}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < MENU.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/3 transition-colors`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon className="text-base" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-200 flex-1">{label}</span>
                  <RiArrowRightLine className="text-gray-500 text-sm" />
                </Link>
              ) : (
                <button onClick={() => { if (action === 'chatbot') document.getElementById('chatbot-btn')?.click(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 ${i < MENU.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/3 transition-colors`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon className="text-base" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-200 flex-1 text-left">{label}</span>
                  <RiArrowRightLine className="text-gray-500 text-sm" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(true)}
          className="w-full mt-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-red-500/30 text-red-400 text-sm font-bold"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <RiLogoutBoxLine />লগআউট
        </motion.button>
      </div>

      <AnimatePresence>
        {showLogout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-end justify-center px-4 pb-8"
            onClick={() => setShowLogout(false)}>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-sm rounded-3xl p-6 border border-red-500/20"
              style={{ background: '#13131F' }}
              onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <RiLogoutBoxLine className="text-red-400 text-2xl" />
                </div>
                <h3 className="font-orbitron font-bold text-lg text-white mb-1">লগআউট করবেন?</h3>
                <p className="text-gray-400 text-sm">আপনি কি সত্যিই বের হতে চান?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLogout(false)}
                  className="flex-1 py-3 rounded-2xl text-gray-300 font-semibold text-sm border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>বাতিল</button>
                <button onClick={handleLogout}
                  className="flex-1 py-3 rounded-2xl text-red-400 font-semibold text-sm border border-red-500/30"
                  style={{ background: 'rgba(239,68,68,0.1)' }}>লগআউট</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
