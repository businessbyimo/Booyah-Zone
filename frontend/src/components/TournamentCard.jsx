import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiMap } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import CountdownTimer from './CountdownTimer.jsx';
import { format } from 'date-fns';

const statusConfig = {
  upcoming: { label: 'আসন্ন', cls: 'badge-upcoming' },
  ongoing: { label: '🔴 লাইভ', cls: 'badge-ongoing' },
  completed: { label: 'সম্পন্ন', cls: 'badge-completed' },
  cancelled: { label: 'বাতিল', cls: 'badge-cancelled' },
};

export default function TournamentCard({ tournament, index = 0 }) {
  const status = statusConfig[tournament.status] || statusConfig.upcoming;
  const fillPct = Math.min(100, (tournament.current_participants / tournament.max_participants) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-100 transition-all duration-200"
    >
      <div
        className="px-4 pt-4 pb-3"
        style={{ background: 'linear-gradient(135deg,rgba(255,107,0,0.04),rgba(124,58,237,0.04))' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-orbitron font-bold text-gray-900 text-base line-clamp-1 mb-1.5">
              {tournament.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={status.cls}>{status.label}</span>
              {tournament.map && (
                <span className="flex items-center text-[11px] text-gray-400 gap-0.5">
                  <FiMap className="text-[10px]" />{tournament.map}
                </span>
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#FFF3E0,#FFE0B2)' }}>
            <GiTrophy className="text-orange-500 text-lg" />
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[11px] text-gray-400 mb-0.5">পুরস্কার পুল</p>
            <p className="font-bold text-orange-500 text-base font-orbitron">৳{Number(tournament.prize_pool).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[11px] text-gray-400 mb-0.5">এন্ট্রি ফি</p>
            <p className="font-bold text-purple-600 text-base font-orbitron">
              {parseFloat(tournament.entry_fee) === 0 ? '🆓 ফ্রি' : `৳${tournament.entry_fee}`}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-gray-500 mb-1">
            <span className="flex items-center gap-1"><FiUsers className="text-[10px]" />{tournament.current_participants}/{tournament.max_participants} জন</span>
            <span className={fillPct >= 90 ? 'text-red-500 font-semibold' : fillPct >= 70 ? 'text-orange-500' : 'text-gray-400'}>
              {Math.round(fillPct)}% পূর্ণ
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.7, delay: index * 0.06 }}
              className="h-full rounded-full"
              style={{
                background: fillPct >= 90
                  ? 'linear-gradient(90deg,#ef4444,#f97316)'
                  : fillPct >= 70
                  ? 'linear-gradient(90deg,#f97316,#fbbf24)'
                  : 'linear-gradient(90deg,#FF6B00,#FF8C42)',
              }}
            />
          </div>
        </div>

        {tournament.status === 'upcoming' && (
          <div className="mb-3 flex justify-center">
            <CountdownTimer targetDate={tournament.start_time} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <FiCalendar className="text-[10px]" />
            {tournament.start_time ? format(new Date(tournament.start_time), 'dd MMM, yyyy') : 'TBD'}
          </p>
          <Link
            to={`/tournament/${tournament.id}`}
            className="text-sm font-bold text-white px-4 py-2 rounded-xl active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#FF6B00,#FF8C42)', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}
          >
            বিস্তারিত →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
