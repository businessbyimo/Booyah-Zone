import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';

const SECTIONS = [
  {
    title: '🎮 BooyahZone কী?',
    content: 'BooyahZone হলো বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম। এখানে আপনি টুর্নামেন্টে অংশ নিতে পারবেন, অন্য খেলোয়াড়দের সাথে প্রতিযোগিতা করতে পারবেন এবং রিয়েল ক্যাশ পুরস্কার জিততে পারবেন।'
  },
  {
    title: '📋 রেজিস্ট্রেশন',
    content: 'রেজিস্টার করতে আপনার নাম, ইমেইল, পাসওয়ার্ড এবং ফ্রি ফায়ার আইডি দিন। রেজিস্ট্রেশন সম্পূর্ণ বিনামূল্যে।'
  },
  {
    title: '💰 ডিপোজিট',
    content: 'বিকাশ, নগদ বা রকেট ব্যবহার করে ওয়ালেটে টাকা যোগ করুন। পেমেন্ট নম্বরে Send Money করুন, তারপর ট্রানজেকশন আইডি সহ ডিপোজিট অনুরোধ পাঠান। অনুমোদনের পর ব্যালেন্সে যোগ হবে।'
  },
  {
    title: '⚔️ টুর্নামেন্টে যোগ দেওয়া',
    content: 'টুর্নামেন্ট পেজে যান, পছন্দের টুর্নামেন্ট বাছাই করুন এবং "যোগ দিন" বাটন চাপুন। এন্ট্রি ফি ওয়ালেট থেকে কেটে নেওয়া হবে। অনুমোদনের পর Room ID/Password পাবেন।'
  },
  {
    title: '🏆 পুরস্কার',
    content: 'টুর্নামেন্টের ফলাফল ঘোষণার পর বিজয়ীদের পুরস্কার সরাসরি ওয়ালেটে জমা হবে। সেখান থেকে উইথড্র করে নিজের বিকাশ/নগদ নম্বরে নিতে পারবেন।'
  },
  {
    title: '📤 উইথড্র',
    content: 'Withdraw পেজে যান, পরিমাণ ও আপনার বিকাশ/নগদ/রকেট নম্বর দিন। ২৪ ঘন্টার মধ্যে প্রসেস হবে। ন্যূনতম উইথড্র ৳১০০।'
  },
  {
    title: '📊 লিডারবোর্ড',
    content: 'প্রতিটি ম্যাচে প্লেসমেন্ট ও কিল পয়েন্ট পাবেন। সর্বমোট পয়েন্টের ভিত্তিতে লিডারবোর্ডে র্যাংক নির্ধারিত হয়।'
  },
  {
    title: '🤖 AI সাপোর্ট',
    content: 'যেকোনো প্রশ্নের জন্য BZ AI চ্যাটবটকে জিজ্ঞেস করুন। স্ক্রিনের নিচে AI বাটনে চাপুন।'
  },
  {
    title: '⚠️ নিয়মকানুন',
    content: '• মিথ্যা ট্রানজেকশন আইডি দিলে অ্যাকাউন্ট ব্লক হবে\n• টুর্নামেন্টে হ্যাক/চিট ব্যবহার নিষিদ্ধ\n• Room ID/Password শেয়ার করা যাবে না\n• প্রতিটি খেলোয়াড় একটি অ্যাকাউন্ট রাখতে পারবেন\n• অ্যাডমিনের সিদ্ধান্ত চূড়ান্ত'
  },
  {
    title: '📞 যোগাযোগ',
    content: 'সাপোর্টের জন্য: https://www.facebook.com/2ndJohnnySins\nঅথবা BZ AI চ্যাটবট ব্যবহার করুন।'
  },
];

function Accordion({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/3 transition-colors">
        <span className="font-semibold text-sm text-white">{item.title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <RiArrowDownSLine className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed whitespace-pre-line border-t border-white/5">
              <div className="pt-3">{item.content}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Docs() {
  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="text-center mb-6">
          <h1 className="font-orbitron font-bold text-lg text-white mb-1">📖 ডকুমেন্টেশন</h1>
          <p className="text-xs text-gray-400">BooyahZone সম্পর্কে সব তথ্য</p>
        </div>
        <div className="space-y-2">
          {SECTIONS.map((s, i) => <Accordion key={i} item={s} />)}
        </div>
      </div>
    </PageTransition>
  );
}
