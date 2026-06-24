import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import TopBar from './components/TopBar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Chatbot from './components/Chatbot.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import SplashScreen from './components/SplashScreen.jsx';

import LandingPage from './pages/LandingPage.jsx';
import Home from './pages/Home.jsx';
import Tournaments from './pages/Tournaments.jsx';
import TournamentDetail from './pages/TournamentDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Deposit from './pages/Deposit.jsx';
import Withdraw from './pages/Withdraw.jsx';
import Account from './pages/Account.jsx';
import AccountEdit from './pages/AccountEdit.jsx';
import AccountTournaments from './pages/AccountTournaments.jsx';
import AccountMatches from './pages/AccountMatches.jsx';
import AccountTransactions from './pages/AccountTransactions.jsx';
import AccountNotifications from './pages/AccountNotifications.jsx';
import AccountPassword from './pages/AccountPassword.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Docs from './pages/Docs.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminTournaments from './pages/admin/AdminTournaments.jsx';
import AdminParticipants from './pages/admin/AdminParticipants.jsx';
import AdminMatches from './pages/admin/AdminMatches.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminNotifications from './pages/admin/AdminNotifications.jsx';
import AdminContent from './pages/admin/AdminContent.jsx';
import AdminLeaderboard from './pages/admin/AdminLeaderboard.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminLogs from './pages/admin/AdminLogs.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" />;
  if (!['admin', 'moderator'].includes(user.role)) return <Navigate to="/home" />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/home" /> : children;
};

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = location.pathname.startsWith('/admin');
  const noLayout = ['/login', '/register', '/forgot-password', '/reset-password', '/welcome', '/admin'].some(
    p => location.pathname.startsWith(p)
  );
  const showLayout = !isAdmin && !noLayout;

  return (
    <div className="app-bg min-h-screen">
      {showLayout && <TopBar />}

      <main className={showLayout ? 'pt-14 pb-20' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/welcome" />} />
            <Route path="/welcome" element={<GuestRoute><LandingPage /></GuestRoute>} />
            <Route path="/home" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournament/:id" element={<TournamentDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/docs" element={<Docs />} />

            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/deposit" element={<PrivateRoute><Deposit /></PrivateRoute>} />
            <Route path="/withdraw" element={<PrivateRoute><Withdraw /></PrivateRoute>} />
            <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
            <Route path="/account/edit" element={<PrivateRoute><AccountEdit /></PrivateRoute>} />
            <Route path="/account/tournaments" element={<PrivateRoute><AccountTournaments /></PrivateRoute>} />
            <Route path="/account/matches" element={<PrivateRoute><AccountMatches /></PrivateRoute>} />
            <Route path="/account/transactions" element={<PrivateRoute><AccountTransactions /></PrivateRoute>} />
            <Route path="/account/notifications" element={<PrivateRoute><AccountNotifications /></PrivateRoute>} />
            <Route path="/account/password" element={<PrivateRoute><AccountPassword /></PrivateRoute>} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tournaments" element={<AdminTournaments />} />
              <Route path="participants" element={<AdminParticipants />} />
              <Route path="matches" element={<AdminMatches />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="leaderboard" element={<AdminLeaderboard />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>

            <Route path="*" element={<Navigate to={user ? '/home' : '/welcome'} />} />
          </Routes>
        </AnimatePresence>
      </main>

      {showLayout && <BottomNav />}
      {showLayout && <Chatbot />}
    </div>
  );
};

export default function App() {
  const { loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return (
      <AnimatePresence>
        <SplashScreen onDone={() => setSplashDone(true)} />
      </AnimatePresence>
    );
  }

  return <AppContent />;
}
