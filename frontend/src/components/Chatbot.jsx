import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiSendPlaneLine, RiHeadphoneLine, RiCustomerService2Line } from 'react-icons/ri';

const INITIAL_MSG = {
  role: 'assistant',
  content: 'স্বাগতম! আমি BooyahZone সহায়তা কেন্দ্র থেকে বলছি। টুর্নামেন্ট, পেমেন্ট বা অ্যাকাউন্ট সংক্রান্ত যেকোনো বিষয়ে সাহায্য করতে পারি।',
};

const SITE_CONTEXT = `তুমি BooyahZone সহায়তা কেন্দ্রের একজন দক্ষ ও অভিজ্ঞ সাপোর্ট এক্সিকিউটিভ। তোমার নাম "সহায়তা টিম"। তুমি একজন মানুষ, কোনো বট বা AI নও। তুমি পেশাদার, বিনয়ী এবং সহায়ক। নিচের তথ্যগুলো তোমার জানা:

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

== পেমেন্ট ও ওয়ালেট ==
- ডিপোজিট পদ্ধতি: bKash, Nagad, Rocket
- ডিপোজিট করতে: পেমেন্ট করো, রেফারেন্স নম্বর দাও, অ্যাডমিন অনুমোদন করলে ব্যালেন্স যোগ হয়
- উইথড্র করতে: ওয়ালেট থেকে রিকোয়েস্ট পাঠাও, অ্যাডমিন পাঠিয়ে দেবে
- ন্যূনতম উইথড্র: ৳১০০

== লিডারবোর্ড ==
- সাপ্তাহিক, মাসিক ও সর্বকালীন র্যাংকিং

== নিয়মাবলী ==
- হ্যাকিং বা চিটিং করলে অ্যাকাউন্ট ব্যান
- একটি ইউজার একটি অ্যাকাউন্ট রাখতে পারবেন

নির্দেশনা:
- শুধু BooyahZone সম্পর্কিত প্রশ্নের উত্তর দাও
- উত্তর সবসময় বাংলায় দাও, পেশাদার ও আন্তরিক ভাষায়
- উত্তর সংক্ষিপ্ত রাখো (২-৩ বাক্য)
- নিজেকে কখনো AI বা বট বলবে না — তুমি সহায়তা কেন্দ্রের একজন কর্মী
- ইমোজি ব্যবহার করবে না`;

const QUICK = [
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
        .map(m => `${m.role === 'user' ? 'ইউজার' : 'সহায়তা টিম'}: ${m.content}`)
        .join('\n');
      const prompt = `${SITE_CONTEXT}\n\nকথোপকথন:\n${historyText}\n\nসহায়তা টিম:`;
      const res = await fetch(
        `https://betadash-api-swordslush-production.up.railway.app/opera?ask=${encodeURIComponent(prompt)}`
      );
      const data = await res.json();
      const reply =
        data.success && data.message
          ? data.message
          : 'দুঃখিত, এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'সংযোগে সমস্যা হচ্ছে। নেটওয়ার্ক চেক করে আবার চেষ্টা করুন।' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-[72px] right-4 z-50 flex items-center justify-center rounded-2xl"
        style={{
          width: 52,
          height: 52,
          background: 'linear-gradient(135deg, #0e7490, #7e22ce)',
          boxShadow: '0 4px 20px rgba(14,116,144,0.4), 0 0 0 1px rgba(34,211,238,0.15)',
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <RiCloseLine className="text-white text-xl" />
            </motion.div>
          ) : (
            <motion.div
              key="help"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <RiCustomerService2Line className="text-white text-xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed bottom-[132px] right-4 z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: 'calc(100vw - 2rem)',
              maxWidth: 340,
              height: 460,
              background: '#08080f',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(14,116,144,0.2)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                background: 'rgba(14,116,144,0.12)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0e7490, #7e22ce)' }}
              >
                <RiHeadphoneLine className="text-white text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs tracking-wide">সহায়তা কেন্দ্র</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #34d399' }} />
                  <p className="text-[10px] text-gray-400">অনলাইন · সাধারণত সাথে সাথে জবাব দেওয়া হয়</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg"
              >
                <RiCloseLine className="text-base" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5"
                      style={{ background: 'linear-gradient(135deg, #0e7490, #7e22ce)' }}
                    >
                      <RiHeadphoneLine className="text-white text-[10px]" />
                    </div>
                  )}
                  <div
                    className="max-w-[82%] px-3 py-2.5 text-xs leading-relaxed"
                    style={
                      m.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #0e7490, #0891b2)',
                            color: '#fff',
                            borderRadius: '14px 14px 4px 14px',
                          }
                        : {
                            background: 'rgba(255,255,255,0.06)',
                            color: '#d1d5db',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '14px 14px 14px 4px',
                          }
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
                    style={{ background: 'linear-gradient(135deg, #0e7490, #7e22ce)' }}
                  >
                    <RiHeadphoneLine className="text-white text-[10px]" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex space-x-1">
                      {[0, 140, 280].map(d => (
                        <div
                          key={d}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ background: '#22d3ee', animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] text-gray-600 text-center uppercase tracking-wider">
                    সাধারণ জিজ্ঞাসা
                  </p>
                  {QUICK.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="w-full text-left text-[11px] px-3 py-2.5 rounded-xl border text-gray-400 hover:text-white transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(255,255,255,0.07)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(34,211,238,0.25)';
                        e.currentTarget.style.background = 'rgba(34,211,238,0.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Input */}
            <div
              className="px-3 py-2.5 flex-shrink-0"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(8,8,15,0.9)',
              }}
            >
              <div className="flex gap-2 items-center">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  className="flex-1 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(34,211,238,0.3)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  placeholder="বার্তা লিখুন..."
                  disabled={loading}
                />
                <motion.button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  whileTap={{ scale: 0.88 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #0e7490, #0891b2)' }}
                >
                  <RiSendPlaneLine className="text-white text-sm" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
