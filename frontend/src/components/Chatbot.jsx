import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiChevronDown } from 'react-icons/fi';
import { BsRobot } from 'react-icons/bs';
import api from '../utils/api.js';

const INITIAL_MSG = { role: 'assistant', content: 'Hi! 👋 I\'m FF Arena\'s AI assistant. Ask me anything about tournaments, payments, wallet, or how to use this platform!' };

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(['How do I join a tournament?', 'How do deposits work?', 'Who is the developer?']);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setSuggestions([]);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/chatbot/message', { message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
      if (res.data.follow_up_questions?.length) setSuggestions(res.data.follow_up_questions.slice(0, 3));
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble right now. Contact Sakib on Facebook: https://www.facebook.com/2ndJohnnySins' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-600 flex items-center justify-center shadow-xl glow-cyan"
      >
        {open ? <FiX className="text-2xl text-white" /> : <FiMessageCircle className="text-2xl text-white" />}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-dark-900" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] bg-dark-800 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-fuchsia-600 p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <BsRobot className="text-white text-xl" />
              </div>
              <div>
                <p className="font-bold text-white font-orbitron text-sm">FF Arena Bot</p>
                <p className="text-xs text-cyan-100 flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-1" />Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-dark-700 text-gray-200 rounded-tl-none border border-dark-500'}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-dark-700 border border-dark-500 px-4 py-2 rounded-2xl rounded-tl-none">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 bg-cyan-400 rounded-full"
                          animate={{ y: [-3, 0] }} transition={{ delay: i * 0.15, repeat: Infinity, repeatType: 'reverse', duration: 0.4 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => send(s)} className="text-xs px-2 py-1 bg-dark-700 border border-cyan-500/30 text-cyan-400 rounded-full hover:bg-cyan-500/20 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-dark-600 flex space-x-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type your question..."
                className="flex-1 bg-dark-700 border border-dark-500 focus:border-cyan-500 text-white text-sm rounded-xl px-3 py-2 outline-none"
              />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="w-9 h-9 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors">
                <FiSend className="text-white text-sm" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
