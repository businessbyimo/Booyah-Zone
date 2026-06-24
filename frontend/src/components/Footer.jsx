import { Link } from 'react-router-dom';
import { GiCrossedSwords } from 'react-icons/gi';
import { FaFacebook, FaDiscord, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GiCrossedSwords className="text-cyan-400 text-2xl" />
              <span className="font-orbitron font-bold text-xl neon-text">FF Arena</span>
            </div>
            <p className="text-gray-400 text-sm">The ultimate Free Fire tournament platform in Bangladesh. Compete, win, and rise to glory.</p>
            <div className="flex space-x-3 mt-4">
              <a href="https://www.facebook.com/2ndJohnnySins" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors"><FaDiscord className="text-xl" /></a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors"><FaYoutube className="text-xl" /></a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 font-rajdhani text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/tournaments" className="hover:text-cyan-400 transition-colors">Tournaments</Link></li>
              <li><Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">Leaderboard</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/payment" className="hover:text-cyan-400 transition-colors">Wallet</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 font-rajdhani text-lg">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/page/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link to="/page/terms" className="hover:text-cyan-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/page/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/page/rules" className="hover:text-cyan-400 transition-colors">Tournament Rules</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 font-rajdhani text-lg">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://www.facebook.com/2ndJohnnySins" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Contact Sakib</a></li>
              <li><Link to="/deploy-guide" className="hover:text-cyan-400 transition-colors">Deploy Guide</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-600 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© 2025 FF Arena. All rights reserved. Built by <a href="https://www.facebook.com/2ndJohnnySins" className="text-cyan-400 hover:underline">Sakib</a>.</p>
        </div>
      </div>
    </footer>
  );
}
