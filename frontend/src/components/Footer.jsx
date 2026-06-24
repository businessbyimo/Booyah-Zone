import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiAward, FiUser, FiCreditCard } from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/', icon: FiHome, label: 'হোম' },
  { to: '/tournaments', icon: GiCrossedSwords, label: 'টুর্নামেন্ট' },
  { to: '/leaderboard', icon: FiAward, label: 'র‌্যাংকিং' },
  { to: '/dashboard', icon: FiUser, label: 'প্রোফাইল', auth: true },
  { to: '/payment', icon: FiCreditCard, label: 'ওয়ালেট', auth: true },
];

export default function Footer() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.07)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, auth }) => {
          const active = isActive(to);
          const href = auth && !user ? '/login' : to;
          return (
            <Link
              key={to}
              to={href}
              className="flex flex-col items-center justify-center flex-1 py-1 relative"
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-dot"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg,#FF6B00,#FF8C42)' }}
                />
              )}
              <Icon
                className="text-[22px] mb-0.5 transition-colors duration-200"
                style={{ color: active ? '#FF6B00' : '#9CA3AF' }}
              />
              <span
                className="text-[10px] font-semibold transition-colors duration-200 leading-none"
                style={{ color: active ? '#FF6B00' : '#9CA3AF' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
