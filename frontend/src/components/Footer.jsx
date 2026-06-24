import { Link } from 'react-router-dom';
import { FaFacebook, FaDiscord, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo-nobg.png" alt="BooyahZone" className="h-10 w-auto" />
            </div>
            <p className="text-gray-400 text-sm">বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম। প্রতিযোগিতা করুন, জিতুন এবং শীর্ষে উঠুন।</p>
            <div className="flex space-x-3 mt-4">
              <a href="https://www.facebook.com/2ndJohnnySins" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors"><FaDiscord className="text-xl" /></a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors"><FaYoutube className="text-xl" /></a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 font-rajdhani text-lg">দ্রুত লিংক</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/tournaments" className="hover:text-cyan-400 transition-colors">টুর্নামেন্ট</Link></li>
              <li><Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">লিডারবোর্ড</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">ড্যাশবোর্ড</Link></li>
              <li><Link to="/payment" className="hover:text-cyan-400 transition-colors">ওয়ালেট</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 font-rajdhani text-lg">আইনি তথ্য</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/page/about" className="hover:text-cyan-400 transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><Link to="/page/terms" className="hover:text-cyan-400 transition-colors">শর্তাবলী</Link></li>
              <li><Link to="/page/privacy" className="hover:text-cyan-400 transition-colors">গোপনীয়তা নীতি</Link></li>
              <li><Link to="/page/rules" className="hover:text-cyan-400 transition-colors">টুর্নামেন্টের নিয়ম</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 font-rajdhani text-lg">সাপোর্ট</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://www.facebook.com/2ndJohnnySins" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">সাকিবের সাথে যোগাযোগ করুন</a></li>
              <li><Link to="/deploy-guide" className="hover:text-cyan-400 transition-colors">ডিপ্লয় গাইড</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-600 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© ২০২৫ BooyahZone। সর্বস্বত্ব সংরক্ষিত। নির্মাণে <a href="https://www.facebook.com/2ndJohnnySins" className="text-cyan-400 hover:underline">সাকিব</a>।</p>
        </div>
      </div>
    </footer>
  );
}
