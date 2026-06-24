import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Chatbot from './components/Chatbot.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

import Home from './pages/Home.jsx';
import Tournaments from './pages/Tournaments.jsx';
import TournamentDetail from './pages/TournamentDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Payment from './pages/Payment.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import DeployGuide from './pages/DeployGuide.jsx';
import StaticPage from './pages/StaticPage.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminTournaments from './pages/admin/AdminTournaments.jsx';
import AdminParticipants from './pages/admin/AdminParticipants.jsx';
import AdminMatches from './pages/admin/AdminMatches.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminContent from './pages/admin/AdminContent.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" />;
  if (!['admin', 'moderator'].includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen gradient-bg">
      {!isAdmin && <Navbar />}
      <main className={!isAdmin ? 'pt-14 pb-20' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournament/:id" element={<TournamentDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/deploy-guide" element={<DeployGuide />} />
            <Route path="/page/:slug" element={<StaticPage />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tournaments" element={<AdminTournaments />} />
              <Route path="participants" element={<AdminParticipants />} />
              <Route path="matches" element={<AdminMatches />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <Chatbot />}
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
