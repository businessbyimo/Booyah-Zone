import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiHome, FiUsers, FiAward, FiDollarSign, FiSettings,
  FiMenu, FiX, FiLogOut, FiFileText, FiCheckSquare, FiBell, FiList, FiBarChart2
} from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';
import { MdSportsScore } from 'react-icons/md';

const NAV = [
  { to: '/admin', label: 'ড্যাশবোর্ড', icon: <FiHome />, exact: true },
  { to: '/admin/users', label: 'ইউজার', icon: <FiUsers /> },
  { to: '/admin/tournaments', label: 'টুর্নামেন্ট', icon: <GiCrossedSwords /> },
  { to: '/admin/participants', label: 'অংশগ্রহণকারী', icon: <FiCheckSquare /> },
  { to: '/admin/matches', label: 'ম্যাচ', icon: <MdSportsScore /> },
  { to: '/admin/payments', label: 'পেমেন্ট', icon: <FiDollarSign /> },
  { to: '/admin/notifications', label: 'নোটিফিকেশন', icon: <FiBell /> },
  { to: '/admin/content', label: 'কন্টেন্ট', icon: <FiFileText /> },
  { to: '/admin/leaderboard', label: 'লিডারবোর্ড', icon: <FiBarChart2 /> },
  { to: '/admin/settings', label: 'সেটিংস', icon: <FiSettings /> },
  { to: '/admin/logs', label: 'সিস্টেম লগ', icon: <FiList /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => { await logout(); setShowLogoutConfirm(false); navigate('/'); };
  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/admin' ? true : location.pathname === to;

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-dark-900 border-r border-dark-600">
      <div className="p-4 border-b border-dark-600">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo-nobg.png" alt="BooyahZone" className="h-8 w-auto" />
        </Link>
        <p className="text-xs text-gray-500 mt-1">অ্যাডমিন প্যানেল</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.to, item.exact) ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}>
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-dark-600">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'অ্যাডমিন' : 'মডারেটর'}</p>
          </div>
        </div>
        <Link to="/" className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-cyan-400 text-sm rounded-lg hover:bg-dark-700 transition-colors">
          <FiHome /><span>সাইটে ফিরুন</span>
        </Link>
        <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-400/10 text-sm rounded-lg transition-colors mt-1">
          <FiLogOut /><span>লগআউট</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex h-screen bg-dark-900 overflow-hidden">
        {/* ডেস্কটপ সাইডবার */}
        <div className="hidden md:flex w-56 flex-shrink-0">
          <Sidebar />
        </div>

        {/* মোবাইল সাইডবার */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
              <motion.div initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
                className="fixed left-0 top-0 bottom-0 w-56 z-50 md:hidden">
                <Sidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* মেইন কন্টেন্ট */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* টপ বার */}
          <header className="h-14 bg-dark-900 border-b border-dark-600 flex items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
              <FiMenu className="text-xl" />
            </button>
            <div className="flex-1 md:flex-none">
              <h1 className="font-orbitron text-sm text-gray-300 hidden md:block">
                {NAV.find(n => isActive(n.to, n.exact))?.label || 'অ্যাডমিন'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-sm font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            </div>
          </header>

          {/* কন্টেন্ট */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>

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
                <p className="text-gray-400 text-sm">আপনি কি অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-dark-700 border border-dark-500 text-gray-300 hover:border-cyan-500 transition-all font-semibold">বাতিল</button>
                <button onClick={handleLogout} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all font-semibold">লগআউট</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
