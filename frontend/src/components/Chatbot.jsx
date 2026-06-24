import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { BsRobot } from 'react-icons/bs';

const INITIAL_MSG = {
  role: 'assistant',
  content: 'হ্যালো! 👋 আমি BooyahZone-এর AI সহকারী। টুর্নামেন্ট, পেমেন্ট, ওয়ালেট বা প্ল্যাটফর্ম ব্যবহার সম্পর্কে যেকোনো প্রশ্ন করুন!'
};

const SITE_CONTEXT = `তুমি BooyahZone নামক একটি ফ্রি ফায়ার টুর্নামেন্ট ম্যানেজমেন্ট ওয়েবসাইটের AI সহকারী। এই ওয়েবসাইট সম্পর্কে তুমি যা জানো:
- BooyahZone হলো বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম
- ইউজাররা রেজিস্ট্রেশন করে টুর্নামেন্টে অংশ নিতে পারে
- পেমেন্ট পদ্ধতি: bKash, Nagad, Rocket দিয়ে ডিপোজিট ও উইথড্র
- টুর্নামেন্টে এন্ট্রি ফি দিয়ে যোগ দিতে হয়, বিজয়ীরা পুরস্কার পান
- লিডারবোর্ডে সাপ্তাহিক, মাসিক ও সর্বকালীন র্যাংকিং দেখা যায়
- ড্যাশবোর্ডে প্রোফাইল, ওয়ালেট, টুর্নামেন্ট হিস্টোরি দেখা যায়
- অ্যাডমিন প্যানেলে টুর্নামেন্ট তৈরি, পেমেন্ট অনুমোদন, ইউজার ম্যানেজমেন্ট করা যায়
- ওয়েবসাইটের ডেভেলপার ও মালিকের নাম সাকিব
- সাকিবের সাথে যোগাযোগ: https://www.facebook.com/2ndJohnnySins
- এই ওয়েবসাইটের বাইরের কোনো প্রশ্নের উত্তর দেবে না
সব উত্তর বাংলায় দাও। সংক্ষিপ্ত ও সহায়ক থাকো।`;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setFollowUps([]);

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // কনভার্সেশন হিস্টোরি সহ প্রম্পট তৈরি
      const historyText = newMessages
        .slice(1)
        .map(m => `${m.role === 'user' ? 'ইউজার' : 'সহকারী'}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${SITE_CONTEXT}\n\nকথোপকথনের ইতিহাস:\n${historyText}\n\nএখন উত্তর দাও:`;

      const encodedPrompt = encodeURIComponent(fullPrompt);
      const res = await fetch(`https://betadash-api-swordslush-production.up.railway.app/opera?ask=${encodedPrompt}`);
      const data = await res.json();

      if (data.success && data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        if (data.follow_up_questions && data.follow_up_questions.length > 0) {
          setFollowUps(data.follow_up_questions.slice(0, 3));
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'দুঃখিত, উত্তর দিতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'সংযোগে সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* চ্যাটবট বাটন */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-600 flex items-center justify-center shadow-xl"
        style={{ boxShadow: '0 0 20px rgba(34,211,238,0.4)' }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX className="text-2xl text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <FiMessageCircle className="text-2xl text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* চ্যাট উইন্ডো */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] bg-dark-800 border border-cyan-500/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 0 30px rgba(34,211,238,0.15)' }}
          >
            {/* হেডার */}
            <div className="bg-gradient-to-r from-cyan-600 to-fuchsia-600 p-4 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <BsRobot className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white text-sm">BooyahZone সহকারী</h3>
                <p className="text-white/70 text-xs">সর্বদা অনলাইন</p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white">
                <FiX />
              </button>
            </div>

            {/* মেসেজ এরিয়া */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <BsRobot className="text-white text-xs" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-cyan-600 text-white rounded-br-sm' : 'bg-dark-700 text-gray-200 rounded-bl-sm border border-dark-500'}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <BsRobot className="text-white text-xs" />
                  </div>
                  <div className="bg-dark-700 border border-dark-500 px-4 py-3 rounded-xl rounded-bl-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ফলো-আপ প্রশ্ন */}
              {followUps.length > 0 && !loading && (
                <div className="space-y-1 mt-2">
                  {followUps.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* ইনপুট এরিয়া */}
            <div className="p-3 border-t border-dark-600">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  className="flex-1 bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-colors"
                  placeholder="প্রশ্ন করুন..."
                  disabled={loading}
                />
                <motion.button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-xl transition-colors"
                >
                  <FiSend className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
