import { useState, useEffect } from 'react';

const FlipUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-dark-700 border border-cyan-500/30 rounded-lg w-12 h-12 flex items-center justify-center text-cyan-400 font-orbitron font-bold text-lg shadow-inner">
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});

  const calculate = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  useEffect(() => {
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate) return null;
  const past = new Date(targetDate) <= new Date();

  return (
    <div className="flex items-center space-x-1">
      {past ? (
        <span className="text-xs text-red-400 font-semibold">Started</span>
      ) : (
        <>
          <FlipUnit value={timeLeft.days ?? 0} label="D" />
          <span className="text-cyan-400 font-bold mb-4">:</span>
          <FlipUnit value={timeLeft.hours ?? 0} label="H" />
          <span className="text-cyan-400 font-bold mb-4">:</span>
          <FlipUnit value={timeLeft.minutes ?? 0} label="M" />
          <span className="text-cyan-400 font-bold mb-4">:</span>
          <FlipUnit value={timeLeft.seconds ?? 0} label="S" />
        </>
      )}
    </div>
  );
}
