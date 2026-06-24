import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { FiBell, FiUser, FiLogOut, FiSettings, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => {
        setNotifications(r.data.notifications);
        setUnread(r.data.unreadCount);
      }).catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const markRead = async () => {
    if (unread > 0) {
      await api.put('/notifications/read-all').catch(() => {});
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
    setNotifOpen(!notifOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <Link to="/" className="flex items-center">
            <img src="/logo-nobg.png" alt="BooyahZone" className="h-9 w-auto" />
          </Link>

          <div className="flex items-center space-x-1">
            {user ? (
              <>
                {['admin', 'moderator'].includes(user.role) && (
                  <Link to="/admin" className="p-2 text-orange-500" title="অ্যাডমিন">
                    <FiSettings className="text-xl" />
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={markRead}
                    className="relative p-2 text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    <FiBell className="text-xl" />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-gray-800">নোটিফিকেশন</h3>
                            <button onClick={() => setNotifOpen(false)}>
                              <FiX className="text-gray-400 text-sm" />
                            </button>
                          </div>
                          <div className="max-h-72 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <p className="p-5 text-gray-400 text-sm text-center">কোনো নোটিফিকেশন নেই</p>
                            ) : notifications.map(n => (
                              <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${!n.is_read ? 'bg-orange-50' : ''}`}>
                                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/dashboard" className="flex items-center ml-1">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-orange-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
                      <FiUser className="text-orange-500 text-sm" />
                    </div>
                  )}
                </Link>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-sm text-gray-600 font-medium px-3 py-1.5">লগইন</Link>
                <Link
                  to="/register"
                  className="text-sm font-bold text-white px-4 py-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C42)' }}
                >
                  রেজিস্টার
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-[9999] px-4 pb-6"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <FiLogOut className="text-red-500 text-2xl" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">লগআউট করবেন?</h3>
                <p className="text-gray-500 text-sm">আপনি কি সত্যিই বের হতে চান?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm"
                >
                  লগআউট
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
