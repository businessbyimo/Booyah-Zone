import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiArrowDownSLine, RiGamepadLine, RiUserAddLine, RiMoneyDollarCircleLine,
  RiSwordLine, RiTrophyLine, RiSendPlaneLine, RiBarChartLine,
  RiCustomerService2Line, RiAlertLine, RiServerLine, RiMailLine,
  RiSmartphoneLine, RiCheckboxCircleLine, RiInformationLine,
  RiArrowRightLine, RiShieldLine, RiGlobalLine, RiDatabase2Line,
} from 'react-icons/ri';
import PageTransition from '../components/PageTransition.jsx';

const TAB_USER = 'user';
const TAB_DEPLOY = 'deploy';

const USER_SECTIONS = [
  {
    icon: RiGamepadLine,
    color: '#22d3ee',
    title: 'BooyahZone কী?',
    content: 'BooyahZone হলো বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম। এখানে আপনি টুর্নামেন্টে অংশ নিতে পারবেন, অন্য খেলোয়াড়দের সাথে প্রতিযোগিতা করতে পারবেন এবং রিয়েল ক্যাশ পুরস্কার জিততে পারবেন।',
  },
  {
    icon: RiUserAddLine,
    color: '#d946ef',
    title: 'রেজিস্ট্রেশন',
    content: 'রেজিস্টার করতে আপনার নাম, ইমেইল, পাসওয়ার্ড এবং ফ্রি ফায়ার আইডি দিন। রেজিস্ট্রেশন সম্পূর্ণ বিনামূল্যে।',
  },
  {
    icon: RiMoneyDollarCircleLine,
    color: '#f59e0b',
    title: 'ডিপোজিট',
    content: 'বিকাশ, নগদ বা রকেট ব্যবহার করে ওয়ালেটে টাকা যোগ করুন। পেমেন্ট নম্বরে Send Money করুন, তারপর ট্রানজেকশন আইডি সহ ডিপোজিট অনুরোধ পাঠান। অনুমোদনের পর ব্যালেন্সে যোগ হবে।',
  },
  {
    icon: RiSwordLine,
    color: '#22d3ee',
    title: 'টুর্নামেন্টে যোগ দেওয়া',
    content: 'টুর্নামেন্ট পেজে যান, পছন্দের টুর্নামেন্ট বাছাই করুন এবং "যোগ দিন" বাটন চাপুন। এন্ট্রি ফি ওয়ালেট থেকে কেটে নেওয়া হবে। অনুমোদনের পর Room ID/Password পাবেন।',
  },
  {
    icon: RiTrophyLine,
    color: '#f59e0b',
    title: 'পুরস্কার',
    content: 'টুর্নামেন্টের ফলাফল ঘোষণার পর বিজয়ীদের পুরস্কার সরাসরি ওয়ালেটে জমা হবে। সেখান থেকে উইথড্র করে নিজের বিকাশ/নগদ নম্বরে নিতে পারবেন।',
  },
  {
    icon: RiSendPlaneLine,
    color: '#10b981',
    title: 'উইথড্র',
    content: 'Withdraw পেজে যান, পরিমাণ ও আপনার বিকাশ/নগদ/রকেট নম্বর দিন। ২৪ ঘন্টার মধ্যে প্রসেস হবে। ন্যূনতম উইথড্র ৳১০০।',
  },
  {
    icon: RiBarChartLine,
    color: '#d946ef',
    title: 'লিডারবোর্ড',
    content: 'প্রতিটি ম্যাচে প্লেসমেন্ট ও কিল পয়েন্ট পাবেন। সর্বমোট পয়েন্টের ভিত্তিতে লিডারবোর্ডে র্যাংক নির্ধারিত হয়।',
  },
  {
    icon: RiCustomerService2Line,
    color: '#22d3ee',
    title: 'সহায়তা কেন্দ্র',
    content: 'যেকোনো প্রশ্নের জন্য স্ক্রিনের নিচের ডান কোণে হেডফোন আইকনে চাপুন। আমাদের সহায়তা টিম সাথে সাথে সাহায্য করবে।',
  },
  {
    icon: RiAlertLine,
    color: '#ef4444',
    title: 'নিয়মকানুন',
    content: '• মিথ্যা ট্রানজেকশন আইডি দিলে অ্যাকাউন্ট ব্লক হবে\n• টুর্নামেন্টে হ্যাক/চিট ব্যবহার নিষিদ্ধ\n• Room ID/Password শেয়ার করা যাবে না\n• প্রতিটি খেলোয়াড় একটি অ্যাকাউন্ট রাখতে পারবেন\n• অ্যাডমিনের সিদ্ধান্ত চূড়ান্ত',
  },
];

const DEPLOY_SECTIONS = [
  {
    icon: RiServerLine,
    color: '#22d3ee',
    title: 'ধাপ ১ — Render.com-এ ডিপ্লয়',
    steps: [
      { n: 1, text: 'render.com এ যান এবং একটি ফ্রি অ্যাকাউন্ট খুলুন (GitHub দিয়ে Sign Up করলে সহজ হয়)।' },
      { n: 2, text: 'আপনার Replit প্রজেক্টটি GitHub-এ Push করুন। Replit-এ "Version Control" ট্যাবে যান → "Create a Git Repo" → GitHub-এ Export করুন।' },
      { n: 3, text: 'Render Dashboard-এ "New +" বাটনে ক্লিক করুন → "Web Service" বাছাই করুন।' },
      { n: 4, text: 'আপনার GitHub রিপোজিটরি কানেক্ট করুন। সার্চ করে আপনার প্রজেক্ট বাছাই করুন।' },
      { n: 5, text: 'নিচের Settings দিন:\n• Name: booyahzone (আপনার পছন্দ মতো)\n• Build Command: cd frontend && npm install && npm run build\n• Start Command: node backend/server.js\n• Branch: main' },
      { n: 6, text: '"Environment" ট্যাবে যান এবং নিচের ৩টি Variable যোগ করুন (পরের ধাপে বিস্তারিত পাবেন):' },
      { n: 7, text: '"Create Web Service" বাটন চাপুন। Render আপনার সাইট বিল্ড করবে — ৩-৫ মিনিট সময় লাগতে পারে।' },
      { n: 8, text: 'বিল্ড শেষ হলে Render আপনাকে একটি URL দেবে যেমন: https://booyahzone.onrender.com — এটাই আপনার লাইভ সাইট!' },
    ],
    note: 'Free plan-এ 15 মিনিট inactive থাকলে সাইট sleep করে। প্রথমবার লোড হতে 30-60 সেকেন্ড লাগতে পারে।',
  },
  {
    icon: RiDatabase2Line,
    color: '#d946ef',
    title: 'ধাপ ২ — PostgreSQL ডেটাবেস সেটআপ',
    steps: [
      { n: 1, text: 'Render Dashboard → "New +" → "PostgreSQL" বাছাই করুন।' },
      { n: 2, text: 'নাম দিন (যেমন: booyahzone-db), Region: Singapore বাছাই করুন (বাংলাদেশের জন্য সবচেয়ে কাছে)।' },
      { n: 3, text: '"Create Database" বাটন চাপুন। ডেটাবেস তৈরি হলে "Info" ট্যাবে যান।' },
      { n: 4, text: '"External Database URL" কপি করুন — এটা দেখতে এইরকম হবে:\npostgresql://user:pass@host/dbname' },
      { n: 5, text: 'আপনার Web Service-এর "Environment" ট্যাবে গিয়ে এই Variable যোগ করুন:\n• Key: DATABASE_URL\n• Value: (কপি করা URL টি পেস্ট করুন)' },
      { n: 6, text: 'JWT_SECRET এবং REFRESH_SECRET-এর জন্য যেকোনো লম্বা Random Text দিন। যেমন:\n• JWT_SECRET: booyahzone_jwt_super_secret_2024\n• REFRESH_SECRET: booyahzone_refresh_secret_2024' },
      { n: 7, text: 'Variables Save করুন। Service আপনাআপনি Restart হবে এবং ডেটাবেস Schema তৈরি হয়ে যাবে।' },
    ],
  },
  {
    icon: RiMailLine,
    color: '#f59e0b',
    title: 'ধাপ ৩ — Gmail SMTP সেটআপ (ইমেইল নোটিফিকেশন)',
    steps: [
      { n: 1, text: 'Gmail-এ লগইন করুন → উপরে ডানে আপনার প্রোফাইল ছবিতে ক্লিক → "Manage your Google Account"।' },
      { n: 2, text: '"Security" ট্যাবে যান → "2-Step Verification" চালু করুন (যদি না থাকে)। এটা ছাড়া App Password কাজ করে না।' },
      { n: 3, text: '"Security" ট্যাবে আবার যান → "App passwords" সার্চ করুন → "App passwords" তে ক্লিক করুন।' },
      { n: 4, text: '"Select app" → "Mail" বাছাই করুন → "Select device" → "Other (Custom name)" → "BooyahZone" লিখুন → "Generate" চাপুন।' },
      { n: 5, text: 'Google একটি 16-ডিজিটের Password দেবে (যেমন: xxxx xxxx xxxx xxxx) — এটা কপি করুন এবং কোথাও সেভ রাখুন।' },
      { n: 6, text: 'Render-এ আপনার Web Service-এর "Environment"-এ যোগ করুন:\n• MAIL_USER: আপনার-gmail@gmail.com\n• MAIL_PASS: (16-ডিজিটের App Password)\n• MAIL_FROM: BooyahZone <আপনার-gmail@gmail.com>' },
    ],
    note: 'এই পদ্ধতিতে আপনার Gmail পাসওয়ার্ড কোথাও দিতে হচ্ছে না — App Password আলাদা এবং যেকোনো সময় বাতিল করা যায়।',
  },
  {
    icon: RiSmartphoneLine,
    color: '#10b981',
    title: 'ধাপ ৪ — SMS Forwarding সেটআপ',
    steps: [
      { n: 1, text: 'SMS Forwarding দিয়ে bKash/Nagad-এর পেমেন্ট SMS আপনার সার্ভারে আসবে এবং পেমেন্ট আপনাআপনি যাচাই হবে।' },
      { n: 2, text: 'Android ফোনে "SMS Forwarder" বা "SMS Gateway" অ্যাপ ডাউনলোড করুন:\nPlay Store-এ সার্চ করুন: "SMS to URL Forwarder"' },
      { n: 3, text: 'অ্যাপ খুলুন → Settings → Forwarding Rules → New Rule যোগ করুন:\n• Filter: bKash অথবা Nagad (এই শব্দগুলো থাকলে forward হবে)\n• Forward to URL: https://আপনার-সাইট.onrender.com/api/sms-webhook' },
      { n: 4, text: 'Render-এ Environment Variable যোগ করুন:\n• SMS_WEBHOOK_SECRET: যেকোনো গোপন কোড (যেমন: my_secret_123)\nঅ্যাপেও এই Secret কোডটি দিন।' },
      { n: 5, text: 'এখন কেউ bKash-এ পেমেন্ট করলে SMS আপনার সার্ভারে যাবে → সার্ভার SMS যাচাই করবে → ওয়ালেটে আপনাআপনি টাকা যোগ হবে।' },
      { n: 6, text: 'সাময়িকভাবে (ম্যানুয়াল পদ্ধতি): Admin Panel → Payments → Pending-এ গিয়ে ম্যানুয়ালি Approve করুন। SMS Forwarding চালু না থাকলেও কাজ করবে।' },
    ],
    note: 'SMS Forwarding-এর জন্য ফোনটি সবসময় চালু ও ইন্টারনেটে কানেক্টেড থাকতে হবে। বিদ্যুৎ চলে গেলে কাজ করবে না।',
  },
  {
    icon: RiGlobalLine,
    color: '#d946ef',
    title: 'ধাপ ৫ — Custom Domain যোগ (ঐচ্ছিক)',
    steps: [
      { n: 1, text: 'আপনার কাছে কোনো Domain থাকলে (যেমন: booyahzone.com) Render-এ সেটআপ করতে পারবেন।' },
      { n: 2, text: 'Render Dashboard → আপনার Web Service → "Settings" → "Custom Domains" → "Add Custom Domain"।' },
      { n: 3, text: 'আপনার Domain-এর নাম দিন (যেমন: booyahzone.com)। Render একটি CNAME Value দেবে।' },
      { n: 4, text: 'আপনার Domain Provider (Namecheap, GoDaddy ইত্যাদি)-এ লগইন করুন → DNS Settings → নতুন CNAME Record যোগ করুন:\n• Host: @ অথবা www\n• Value: (Render-এর দেওয়া CNAME)\nSave করুন।' },
      { n: 5, text: 'DNS প্রসেস হতে ১-২৪ ঘন্টা লাগতে পারে। তারপর আপনার নিজের Domain-এ সাইট চলবে!' },
    ],
  },
  {
    icon: RiShieldLine,
    color: '#22d3ee',
    title: 'সমস্যা হলে করণীয়',
    steps: [
      { n: 1, text: 'বিল্ড ফেল হলে: Render Dashboard → আপনার Service → "Logs" ট্যাবে দেখুন কোথায় Error হয়েছে।' },
      { n: 2, text: 'ডেটাবেস সংযোগ সমস্যা: DATABASE_URL ঠিকমতো কপি হয়েছে কিনা চেক করুন। শুরুতে "postgresql://" থাকতে হবে।' },
      { n: 3, text: 'সাইট খুলছে না: Render Free Plan-এ প্রথমবার লোড হতে ৩০-৬০ সেকেন্ড লাগে। একটু অপেক্ষা করুন।' },
      { n: 4, text: 'ইমেইল যাচ্ছে না: Gmail App Password ঠিক আছে কিনা যাচাই করুন। 2-Step Verification চালু আছে কিনা দেখুন।' },
      { n: 5, text: 'আরও সাহায্যের জন্য Facebook-এ যোগাযোগ করুন: facebook.com/2ndJohnnySins' },
    ],
  },
];

function StepList({ steps }) {
  return (
    <div className="space-y-3 mt-3">
      {steps.map(s => (
        <div key={s.n} className="flex gap-3">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-orbitron font-bold text-[9px]"
            style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }}
          >
            {s.n}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

function Accordion({ item, isDeploySection }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/[0.07] transition-colors"
      style={{ background: open ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}
        >
          <Icon className="text-sm" style={{ color: item.color }} />
        </div>
        <span className="flex-1 font-semibold text-sm text-white">{item.title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <RiArrowDownSLine className="text-gray-500 text-lg" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 border-t border-white/[0.05]"
            >
              {isDeploySection ? (
                <>
                  <StepList steps={item.steps} />
                  {item.note && (
                    <div
                      className="mt-3 flex gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
                    >
                      <RiInformationLine className="text-amber-400 flex-shrink-0 mt-0.5 text-sm" />
                      <p className="text-[11px] text-amber-300/80 leading-relaxed">{item.note}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line pt-3">{item.content}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Docs() {
  const [tab, setTab] = useState(TAB_USER);

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <RiInformationLine className="text-cyan-400 text-base" />
            <h1 className="font-orbitron font-bold text-sm text-white">গাইড</h1>
          </div>
          <p className="text-[10px] text-gray-600 ml-6">BooyahZone সম্পর্কে সব তথ্য ও ডিপ্লয় নির্দেশিকা</p>
        </div>

        {/* Tab Switcher */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={() => setTab(TAB_USER)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: tab === TAB_USER ? 'rgba(34,211,238,0.12)' : 'transparent',
              color: tab === TAB_USER ? '#22d3ee' : '#6b7280',
              border: tab === TAB_USER ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
            }}
          >
            <RiGamepadLine />
            ইউজার গাইড
          </button>
          <button
            onClick={() => setTab(TAB_DEPLOY)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: tab === TAB_DEPLOY ? 'rgba(217,70,239,0.12)' : 'transparent',
              color: tab === TAB_DEPLOY ? '#d946ef' : '#6b7280',
              border: tab === TAB_DEPLOY ? '1px solid rgba(217,70,239,0.2)' : '1px solid transparent',
            }}
          >
            <RiServerLine />
            ডিপ্লয় গাইড
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === TAB_USER ? (
            <motion.div
              key="user"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-2"
            >
              {USER_SECTIONS.map((s, i) => (
                <Accordion key={i} item={s} isDeploySection={false} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="deploy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-2"
            >
              <div
                className="p-3 rounded-2xl mb-3 flex gap-2"
                style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}
              >
                <RiCheckboxCircleLine className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                  এই গাইডটি ধাপে ধাপে অনুসরণ করুন। প্রতিটি ধাপ সম্পন্ন করার পরেই পরেরটিতে যান।
                </p>
              </div>
              {DEPLOY_SECTIONS.map((s, i) => (
                <Accordion key={i} item={s} isDeploySection={true} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
