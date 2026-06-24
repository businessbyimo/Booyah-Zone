import { useState, useEffect } from 'react';

const Unit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-orbitron font-bold text-sm"
      style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }}>
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wide">{label}</span>
  </div>
);

const SEP = () => <span className="text-cyan-400 font-bold text-sm mb-4 leading-none">:</span>;

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
    return <span className="text-xs text-green-400 font-semibold">🔴 শুরু হয়েছে</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {t.days > 0 && <><Unit value={t.days} label="দিন" /><SEP /></>}
      <Unit value={t.hours} label="ঘণ্টা" />
      <SEP />
      <Unit value={t.minutes} label="মিনিট" />
      <SEP />
      <Unit value={t.seconds} label="সেকেন্ড" />
    </div>
  );
}
