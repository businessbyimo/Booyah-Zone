import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const INITIAL_MSG = {
  role: 'assistant',
  content: 'হ্যালো! 👋 আমি BZ AI। টুর্নামেন্ট, পেমেন্ট বা যেকোনো প্রশ্ন করুন!'
};

const SITE_CONTEXT = `তুমি BooyahZone-এর AI সহকারী "BZ AI"। নিচের তথ্যগুলো তোমার জানা:

== BooyahZone সম্পর্কে ==
- বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম
- সাইটের ডেভেলপার ও মালিক: সাকিব
- যোগাযোগ: https://www.facebook.com/2ndJohnnySins

== রেজিস্ট্রেশন ও লগইন ==
- রেজিস্টার করতে: নাম, ইমেইল, পাসওয়ার্ড, ফ্রি ফায়ার আইডি দিতে হয়
- লগইন করলে ড্যাশবোর্ড, ওয়ালেট, টুর্নামেন্ট হিস্টোরি দেখা যায়

== টুর্নামেন্ট ==
- আসন্ন, চলমান ও সম্পন্ন টুর্নামেন্ট দেখা যায়
- টুর্নামেন্টে যোগ দিতে এন্ট্রি ফি প্রয়োজন (ওয়ালেট থেকে কাটা হয়)
- বিজয়ীরা পুরস্কার পান সরাসরি ওয়ালেটে
- Room ID/Password টুর্নামেন্ট শুরুর আগে দেওয়া হয়
- Squad/Solo/Duo মোড থাকতে পারে
- ম্যাপ: Bermuda, Purgatory, Kalahari

== পেমেন্ট ও ওয়ালেট ==
- ডিপোজিট পদ্ধতি: bKash, Nagad, Rocket
- ডিপোজিট করতে: পেমেন্ট করো → রেফারেন্স নম্বর দাও → অ্যাডমিন অনুমোদন করলে ব্যালেন্স যোগ হয়
- উইথড্র করতে: ওয়ালেট থেকে রিকোয়েস্ট পাঠাও, অ্যাডমিন পাঠিয়ে দেবে
- ন্যূনতম ডিপোজিট/উইথড্র: অ্যাডমিন নির্ধারণ করেন

== লিডারবোর্ড ==
- সাপ্তাহিক, মাসিক ও সর্বকালীন র্যাংকিং
- পয়েন্টের ভিত্তিতে র্যাংক নির্ধারণ হয়

== অ্যাডমিন প্যানেল ==
- টুর্নামেন্ট তৈরি, পেমেন্ট অনুমোদন, ইউজার ম্যানেজমেন্ট, ঘোষণা দেওয়া যায়

== নিয়মাবলী ==
- হ্যাকিং বা চিটিং করলে অ্যাকাউন্ট ব্যান
- টুর্নামেন্ট শুরু হলে এন্ট্রি ফি ফেরত দেওয়া হয় না (বাতিল ছাড়া)

তুমি শুধু BooyahZone সম্পর্কিত প্রশ্নের উত্তর দেবে।
উত্তর সবসময় বাংলায় দাও।
উত্তর যত সংক্ষিপ্ত ও স্পষ্ট সম্ভব দাও — ২-৩ লাইনের বেশি নয়।
ব্যবহারকারীকে "ভাই" বা "আপনি" বলে সম্বোধন করো।`;

const QUICK_QUESTIONS = [
  'টুর্নামেন্টে কীভাবে যোগ দেব?',
  'bKash দিয়ে কীভাবে ডিপোজিট করব?',
  'পুরস্কার কীভাবে পাব?',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const historyText = newMessages
        .slice(1)
        .map(m => `${m.role === 'user' ? 'ইউজার' : 'BZ AI'}: ${m.content}`)
        .join('\n');
      const fullPrompt = `${SITE_CONTEXT}\n\nকথোপকথন:\n${historyText}\n\nএখন সংক্ষিপ্ত উত্তর দাও:`;
      const res = await fetch(`https://betadash-api-swordslush-production.up.railway.app/opera?ask=${encodeURIComponent(fullPrompt)}`);
      const data = await res.json();
      const reply = data.success && data.message
        ? data.message
        : 'দুঃখিত, এখন উত্তর দিতে পারছি না। একটু পরে চেষ্টা করুন।';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'সংযোগে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-4 z-50 w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg"
        style={{
          width: 52, height: 52,
          background: 'linear-gradient(135deg, #FF6B00 0%, #7C3AED 100%)',
          boxShadow: '0 4px 20px rgba(255,107,0,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX className="text-white text-xl" />
            </motion.div>
          ) : (
            <motion.div key="ai" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
              <HiSparkles className="text-white text-xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-20 right-4 z-50 flex flex-col overflow-hidden rounded-3xl shadow-2xl"
            style={{
              width: 'calc(100vw - 2rem)',
              maxWidth: 360,
              height: 480,
              background: '#fff',
              border: '1px solid #f3f4f6',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div
              className="flex items-center space-x-3 px-4 py-3"
              style={{ background: 'linear-gradient(135deg, #FF6B00, #7C3AED)' }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <HiSparkles className="text-white text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm font-orbitron">BZ AI</p>
                <p className="text-white/70 text-[10px]">BooyahZone সহকারী • সর্বদা অনলাইন</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1">
                <FiX className="text-base" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5"
                      style={{ background: 'linear-gradient(135deg,#FF6B00,#7C3AED)' }}
                    >
                      <HiSparkles className="text-white text-[10px]" />
                    </div>
                  )}
                  <div
                    className="max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={m.role === 'user'
                      ? { background: 'linear-gradient(135deg,#FF6B00,#FF8C42)', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: '#fff', color: '#1f2937', border: '1px solid #e5e7eb', borderBottomLeftRadius: 4 }
                    }
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#FF6B00,#7C3AED)' }}
                  >
                    <HiSparkles className="text-white text-[10px]" />
                  </div>
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex space-x-1">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] text-gray-400 text-center font-medium">দ্রুত জিজ্ঞেস করুন</p>
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="px-3 py-2.5 bg-white border-t border-gray-100">
              <div className="flex gap-2 items-center">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-orange-400 transition-colors"
                  placeholder="প্রশ্ন করুন..."
                  disabled={loading}
                />
                <motion.button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#FF6B00,#FF8C42)' }}
                >
                  <FiSend className="text-white text-sm" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
