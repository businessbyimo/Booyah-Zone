import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiHomeLine, RiHomeFill, RiSwordLine, RiSwordFill, RiAddCircleLine, RiAddCircleFill, RiSendPlaneLine, RiSendPlaneFill, RiUserLine, RiUserFill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/home', icon: RiHomeLine, activeIcon: RiHomeFill, label: 'হোম' },
  { to: '/tournaments', icon: RiSwordLine, activeIcon: RiSwordFill, label: 'টুর্নামেন্ট' },
  { to: '/deposit', icon: RiAddCircleLine, activeIcon: RiAddCircleFill, label: 'ডিপোজিট', auth: true },
  { to: '/withdraw', icon: RiSendPlaneLine, activeIcon: RiSendPlaneFill, label: 'উইথড্র', auth: true },
  { to: '/account', icon: RiUserLine, activeIcon: RiUserFill, label: 'অ্যাকাউন্ট', auth: true },
];

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (to) => {
    if (to === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8"
      style={{
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.5)',
      }}>
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-1">
        {NAV_ITEMS.map(({ to, icon: Icon, activeIcon: ActiveIcon, label, auth }) => {
          const active = isActive(to);
          const href = auth && !user ? '/login' : to;
          return (
            <Link key={to} to={href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative group">
              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #22d3ee, #d946ef)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative"
              >
                {active ? (
                  <ActiveIcon className="text-2xl text-cyan-400" />
                ) : (
                  <Icon className="text-2xl text-gray-500 group-hover:text-gray-300 transition-colors" />
                )}
              </motion.div>

              <span className="text-[9px] font-semibold leading-none transition-colors"
                style={{ color: active ? '#22d3ee' : '#6b7280' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
