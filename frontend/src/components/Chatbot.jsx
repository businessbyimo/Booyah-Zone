import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiSendPlaneLine } from 'react-icons/ri';
import { HiSparkles } from 'react-icons/hi2';

const INITIAL_MSG = { role: 'assistant', content: 'হ্যালো! 👋 আমি BZ AI। টুর্নামেন্ট, পেমেন্ট বা যেকোনো প্রশ্ন করুন!' };

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

== পেমেন্ট ও ওয়ালেট ==
- ডিপোজিট পদ্ধতি: bKash, Nagad, Rocket
- ডিপোজিট করতে: পেমেন্ট করো → রেফারেন্স নম্বর দাও → অ্যাডমিন অনুমোদন করলে ব্যালেন্স যোগ হয়
- উইথড্র করতে: ওয়ালেট থেকে রিকোয়েস্ট পাঠাও, অ্যাডমিন পাঠিয়ে দেবে
- ন্যূনতম উইথড্র: ৳১০০

== লিডারবোর্ড ==
- সাপ্তাহিক, মাসিক ও সর্বকালীন র্যাংকিং

== নিয়মাবলী ==
- হ্যাকিং বা চিটিং করলে অ্যাকাউন্ট ব্যান
- একটি ইউজার একটি অ্যাকাউন্ট রাখতে পারবেন

তুমি শুধু BooyahZone সম্পর্কিত প্রশ্নের উত্তর দেবে। উত্তর সবসময় বাংলায় দাও। উত্তর ২-৩ লাইনের বেশি নয়।`;

const QUICK = ['টুর্নামেন্টে কীভাবে যোগ দেব?', 'bKash দিয়ে কীভাবে ডিপোজিট করব?', 'পুরস্কার কীভাবে পাব?'];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const historyText = newMessages.slice(1).map(m => `${m.role === 'user' ? 'ইউজার' : 'BZ AI'}: ${m.content}`).join('\n');
      const prompt = `${SITE_CONTEXT}\n\nকথোপকথন:\n${historyText}\n\nএখন সংক্ষিপ্ত উত্তর দাও:`;
      const res = await fetch(`https://betadash-api-swordslush-production.up.railway.app/opera?ask=${encodeURIComponent(prompt)}`);
      const data = await res.json();
      const reply = data.success && data.message ? data.message : 'দুঃখিত, এখন উত্তর দিতে পারছি না।';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'সংযোগে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <motion.button onClick={() => setOpen(!open)} whileTap={{ scale: 0.92 }}
        className="fixed bottom-[72px] right-4 z-50 flex items-center justify-center rounded-2xl shadow-lg"
        style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #22d3ee, #d946ef)', boxShadow: '0 6px 24px rgba(34,211,238,0.35)' }}>
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <RiCloseLine className="text-white text-xl" />
            </motion.div>
          ) : (
            <motion.div key="ai" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <HiSparkles className="text-white text-xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-[130px] right-4 z-50 flex flex-col rounded-3xl overflow-hidden border border-white/10"
            style={{ width: 'calc(100vw - 2rem)', maxWidth: 340, height: 460, background: '#0d0d1e', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.15)' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(217,70,239,0.1))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #22d3ee, #d946ef)' }}>
                <HiSparkles className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <p className="font-orbitron font-bold text-white text-xs">BZ AI</p>
                <p className="text-[9px] text-cyan-400">BooyahZone সহকারী • সর্বদা অনলাইন</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white p-1">
                <RiCloseLine className="text-base" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5"
                      style={{ background: 'linear-gradient(135deg, #22d3ee, #d946ef)' }}>
                      <HiSparkles className="text-white text-[9px]" />
                    </div>
                  )}
                  <div className="max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
                    style={m.role === 'user'
                      ? { background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', color: '#000', borderBottomRightRadius: 4 }
                      : { background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 }
                    }>
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #22d3ee, #d946ef)' }}>
                    <HiSparkles className="text-white text-[9px]" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm border border-white/8"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="flex space-x-1">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] text-gray-500 text-center">⚡ দ্রুত জিজ্ঞেস করুন</p>
                  {QUICK.map((q, i) => (
                    <button key={i} onClick={() => send(q)}
                      className="w-full text-left text-[11px] px-3 py-2 rounded-xl border border-white/8 text-gray-300 hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 flex-shrink-0 border-t border-white/6"
              style={{ background: 'rgba(13,13,30,0.8)' }}>
              <div className="flex gap-2 items-center">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  className="flex-1 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none border border-white/8 focus:border-cyan-400/40 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  placeholder="প্রশ্ন করুন..." disabled={loading} />
                <motion.button onClick={() => send()} disabled={loading || !input.trim()} whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                  <RiSendPlaneLine className="text-black text-sm" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
