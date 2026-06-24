import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiHome, FiUsers, FiAward, FiDollarSign, FiSettings,
  FiMenu, FiX, FiLogOut, FiFileText, FiStar, FiCheckSquare
} from 'react-icons/fi';
import { GiCrossedSwords, GiSword } from 'react-icons/gi';
import { MdSportsScore } from 'react-icons/md';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: <FiHome />, exact: true },
  { to: '/admin/users', label: 'Users', icon: <FiUsers /> },
  { to: '/admin/tournaments', label: 'Tournaments', icon: <GiCrossedSwords /> },
  { to: '/admin/participants', label: 'Participants', icon: <FiCheckSquare /> },
  { to: '/admin/matches', label: 'Matches', icon: <MdSportsScore /> },
  { to: '/admin/payments', label: 'Payments', icon: <FiDollarSign /> },
  { to: '/admin/content', label: 'Content', icon: <FiFileText /> },
  { to: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };
  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/admin' ? true : location.pathname === to;

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-dark-900 border-r border-dark-600">
      <div className="p-4 border-b border-dark-600">
        <Link to="/" className="flex items-center space-x-2">
          <GiCrossedSwords className="text-cyan-400 text-xl" />
          <span className="font-orbitron font-bold neon-text">FF Arena</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
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
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <Link to="/" className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-cyan-400 text-sm rounded-lg hover:bg-dark-700 transition-colors">
          <FiHome /><span>Back to Site</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-400/10 text-sm rounded-lg transition-colors mt-1">
          <FiLogOut /><span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-dark-900 border-b border-dark-600 flex items-center justify-between px-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            <FiMenu className="text-xl" />
          </button>
          <div className="flex-1 md:flex-none">
            <h1 className="font-orbitron text-sm text-gray-300 hidden md:block">
              {NAV.find(n => isActive(n.to, n.exact))?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-sm font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
