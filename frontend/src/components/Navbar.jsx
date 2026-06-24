import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiSettings, FiHome, FiAward, FiDollarSign } from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

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

  const navLinks = [
    { to: '/', label: 'হোম', icon: <FiHome /> },
    { to: '/tournaments', label: 'টুর্নামেন্ট', icon: <GiCrossedSwords /> },
    { to: '/leaderboard', label: 'লিডারবোর্ড', icon: <FiAward /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-dark-900/95 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* লোগো */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo-nobg.png" alt="BooyahZone" className="h-10 w-auto" />
            </Link>

            {/* ডেস্কটপ নেভ */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to) ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10'}`}>
                  {link.icon}<span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* ডান পাশ */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* নোটিফিকেশন */}
                  <div className="relative">
                    <button onClick={markRead} className="relative p-2 text-gray-300 hover:text-cyan-400 transition-colors">
                      <FiBell className="text-xl" />
                      {unread > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-fuchsia-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unread}</span>
                      )}
                    </button>
                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden z-50">
                          <div className="p-3 border-b border-dark-600">
                            <h3 className="font-semibold text-sm text-cyan-400">নোটিফিকেশন</h3>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <p className="p-4 text-gray-500 text-sm text-center">কোনো নোটিফিকেশন নেই</p>
                            ) : notifications.map(n => (
                              <div key={n.id} className={`p-3 border-b border-dark-600/50 ${!n.is_read ? 'bg-cyan-500/5' : ''}`}>
                                <p className="text-sm font-medium text-white">{n.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ইউজার মেনু */}
                  <div className="flex items-center space-x-2">
                    <Link to="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-cyan-500/50" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                          <FiUser className="text-cyan-400 text-sm" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-white hidden sm:block">{user.username}</span>
                    </Link>
                    {['admin', 'moderator'].includes(user.role) && (
                      <Link to="/admin" className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors" title="অ্যাডমিন প্যানেল">
                        <FiSettings className="text-lg" />
                      </Link>
                    )}
                    <button onClick={() => setShowLogoutConfirm(true)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="লগআউট">
                      <FiLogOut className="text-lg" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="px-4 py-2 text-sm text-cyan-400 hover:text-white transition-colors">লগইন</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">রেজিস্টার</Link>
                </div>
              )}

              {/* মোবাইল মেনু বাটন */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-300 hover:text-cyan-400">
                {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* মোবাইল মেনু */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-dark-900/95 backdrop-blur-xl border-b border-dark-600">
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${isActive(link.to) ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300'}`}>
                    {link.icon}<span>{link.label}</span>
                  </Link>
                ))}
                {user && (
                  <>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-300">
                      <FiUser /><span>ড্যাশবোর্ড</span>
                    </Link>
                    <Link to="/payment" onClick={() => setMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-300">
                      <FiDollarSign /><span>ওয়ালেট</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* লগআউট কনফার্মেশন পপআপ */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] px-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-dark-800 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <FiLogOut className="text-red-400 text-2xl" />
                </div>
                <h3 className="font-orbitron font-bold text-xl text-white mb-2">লগআউট করবেন?</h3>
                <p className="text-gray-400 text-sm">আপনি কি সত্যিই লগআউট করতে চান?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-dark-700 border border-dark-500 text-gray-300 hover:border-cyan-500 transition-all font-semibold"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all font-semibold"
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
