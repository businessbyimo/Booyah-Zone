import { useState, useEffect } from 'react';

const Unit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center font-orbitron font-bold text-base"
      style={{ background: 'rgba(255,107,0,0.08)', color: '#FF6B00', border: '1px solid rgba(255,107,0,0.2)' }}
    >
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{label}</span>
  </div>
);

const SEP = () => (
  <span className="text-orange-400 font-bold text-lg mb-4 leading-none">:</span>
);

export default function CountdownTimer({ targetDate }) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const [t, setT] = useState(calc);
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return null;
  if (new Date(targetDate) <= new Date()) {
    return <span className="text-xs text-red-500 font-semibold">শুরু হয়ে গেছে</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Unit value={t.days} label="দিন" />
      <SEP />
      <Unit value={t.hours} label="ঘণ্টা" />
      <SEP />
      <Unit value={t.minutes} label="মিনিট" />
      <SEP />
      <Unit value={t.seconds} label="সেকেন্ড" />
    </div>
  );
}
