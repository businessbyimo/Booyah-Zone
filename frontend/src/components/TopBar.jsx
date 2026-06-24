import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiBellLine, RiBellFill, RiCloseLine, RiCheckDoubleLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

const PAGE_TITLES = {
  '/home': 'হোম',
  '/tournaments': 'টুর্নামেন্ট',
  '/leaderboard': 'লিডারবোর্ড',
  '/deposit': 'ডিপোজিট',
  '/withdraw': 'উইথড্র',
  '/account': 'আমার অ্যাকাউন্ট',
  '/account/edit': 'প্রোফাইল সম্পাদনা',
  '/account/tournaments': 'আমার টুর্নামেন্ট',
  '/account/matches': 'ম্যাচ হিস্টোরি',
  '/account/transactions': 'ট্রানজেকশন',
  '/account/notifications': 'নোটিফিকেশন',
  '/account/password': 'পাসওয়ার্ড পরিবর্তন',
  '/docs': 'ডকুমেন্টেশন',
};

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const title = Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k))?.[1]
    || (location.pathname.startsWith('/tournament/') ? 'টুর্নামেন্ট' : '');

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => {
        setNotifications(r.data.notifications || []);
        setUnread(r.data.unreadCount || 0);
      }).catch(() => {});
    }
  }, [user]);

  const handleBell = async () => {
    if (unread > 0) {
      await api.put('/notifications/read-all').catch(() => {});
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
    setNotifOpen(v => !v);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-dark-900/90 backdrop-blur-md border-b border-white/5"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <Link to={user ? '/home' : '/welcome'} className="flex items-center gap-2">
            <img src="/logo-nobg.png" alt="BooyahZone" className="h-8 w-auto"
              onError={e => { e.target.style.display = 'none'; }} />
            {!title && (
              <span className="font-orbitron font-bold text-sm text-gradient-rainbow hidden sm:inline">BooyahZone</span>
            )}
          </Link>

          {title && (
            <h1 className="font-orbitron font-bold text-sm text-white absolute left-1/2 -translate-x-1/2">
              {title}
            </h1>
          )}

          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-1.5 bg-dark-600 border border-cyan-400/20 rounded-full px-3 py-1">
                <span className="text-yellow-400 text-xs">৳</span>
                <span className="font-rajdhani font-bold text-xs text-white">
                  {Number(user.balance || 0).toFixed(0)}
                </span>
              </div>
            )}

            {user && (
              <div className="relative">
                <button onClick={handleBell}
                  className="relative p-2 rounded-full bg-dark-600 border border-white/10 text-gray-400 hover:text-cyan-400 transition-colors active:scale-90">
                  {unread > 0 ? <RiBellFill className="text-xl text-cyan-400" /> : <RiBellLine className="text-xl" />}
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold px-0.5">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
              </div>
            )}

            {!user && (
              <Link to="/login"
                className="text-xs font-bold text-black bg-cyan-400 px-3 py-1.5 rounded-xl active:scale-95 transition-transform">
                লগইন
              </Link>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 modal-overlay" onClick={() => setNotifOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed top-16 right-3 z-50 w-80 rounded-2xl overflow-hidden border border-white/10 shadow-fuchsia"
              style={{ background: '#13131F' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <RiBellFill className="text-cyan-400" />
                  <h3 className="font-semibold text-sm text-white">নোটিফিকেশন</h3>
                </div>
                <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-white">
                  <RiCloseLine className="text-lg" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <RiBellLine className="text-3xl text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">কোনো নোটিফিকেশন নেই</p>
                  </div>
                ) : notifications.slice(0, 15).map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-white/5 ${!n.is_read ? 'bg-cyan-400/5' : ''}`}>
                    <div className="flex items-start gap-2">
                      {!n.is_read && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-semibold text-white">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-white/5">
                  <Link to="/account/notifications" onClick={() => setNotifOpen(false)}
                    className="flex items-center justify-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
                    <RiCheckDoubleLine />
                    সব দেখুন
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
