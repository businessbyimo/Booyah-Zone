import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiUserLine, RiCalendarLine, RiMapPin2Line, RiTimeLine } from 'react-icons/ri';
import { GiTrophy } from 'react-icons/gi';
import CountdownTimer from './CountdownTimer.jsx';
import { format } from 'date-fns';

const statusConfig = {
  upcoming: { label: 'আসন্ন', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
  ongoing: { label: '🔴 লাইভ', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  completed: { label: 'সম্পন্ন', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)' },
  cancelled: { label: 'বাতিল', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
};

export default function TournamentCard({ tournament, index = 0 }) {
  const st = statusConfig[tournament.status] || statusConfig.upcoming;
  const fillPct = Math.min(100, (tournament.current_participants / tournament.max_participants) * 100) || 0;
  const isFull = fillPct >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl overflow-hidden border border-white/8 shadow-card"
      style={{ background: '#13131F' }}
    >
      <div className="px-4 pt-4 pb-3"
        style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.04), rgba(217,70,239,0.04))' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-orbitron font-bold text-white text-sm leading-tight line-clamp-1 mb-2">
              {tournament.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                style={{ color: st.color, background: st.bg, borderColor: st.border }}>
                {st.label}
              </span>
              {tournament.map && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                  <RiMapPin2Line className="text-[10px]" />{tournament.map}
                </span>
              )}
              {tournament.mode && (
                <span className="text-[10px] text-gray-500 font-medium">{tournament.mode}</span>
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.2)' }}>
            <GiTrophy className="text-yellow-400 text-base" />
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2 mb-3 mt-3">
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)' }}>
            <p className="text-[10px] text-gray-500 mb-0.5">পুরস্কার পুল</p>
            <p className="font-rajdhani font-bold text-cyan-400 text-base">৳{Number(tournament.prize_pool || 0).toLocaleString()}</p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(217,70,239,0.06)', border: '1px solid rgba(217,70,239,0.12)' }}>
            <p className="text-[10px] text-gray-500 mb-0.5">এন্ট্রি ফি</p>
            <p className="font-rajdhani font-bold text-fuchsia-400 text-base">
              {parseFloat(tournament.entry_fee) === 0 ? '🆓 ফ্রি' : `৳${tournament.entry_fee}`}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="flex items-center gap-1 text-gray-400">
              <RiUserLine className="text-[10px]" />
              {tournament.current_participants}/{tournament.max_participants} জন
            </span>
            <span className={`font-semibold ${isFull ? 'text-red-400' : fillPct >= 70 ? 'text-yellow-400' : 'text-gray-400'}`}>
              {Math.round(fillPct)}% পূর্ণ {isFull && '🔥'}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.7, delay: index * 0.05 }}
              className="h-full rounded-full"
              style={{
                background: isFull
                  ? 'linear-gradient(90deg, #ef4444, #f97316)'
                  : fillPct >= 70
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #22d3ee, #d946ef)',
              }}
            />
          </div>
        </div>

        {tournament.status === 'upcoming' && tournament.start_time && (
          <div className="mb-3 flex justify-center">
            <CountdownTimer targetDate={tournament.start_time} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            <RiCalendarLine />
            {tournament.start_time ? format(new Date(tournament.start_time), 'dd MMM, yyyy') : 'TBD'}
          </p>
          <Link to={`/tournament/${tournament.id}`}
            className="text-xs font-bold text-black px-4 py-2 rounded-xl active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
            বিস্তারিত →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
