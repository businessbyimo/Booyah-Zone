import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiDollarSign, FiCalendar, FiMap } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import CountdownTimer from './CountdownTimer.jsx';
import { format } from 'date-fns';

const statusConfig = {
  upcoming: { label: 'Upcoming', cls: 'badge-upcoming' },
  ongoing: { label: 'Live 🔴', cls: 'badge-ongoing' },
  completed: { label: 'Completed', cls: 'badge-completed' },
  cancelled: { label: 'Cancelled', cls: 'badge-cancelled' },
};

export default function TournamentCard({ tournament, index = 0 }) {
  const status = statusConfig[tournament.status] || statusConfig.upcoming;
  const fillPct = (tournament.current_participants / tournament.max_participants) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card neon-border hover:border-cyan-400/60 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-orbitron font-bold text-white text-lg group-hover:text-cyan-400 transition-colors line-clamp-1">{tournament.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={status.cls}>{status.label}</span>
            {tournament.map && (
              <span className="flex items-center text-xs text-gray-400"><FiMap className="mr-1" />{tournament.map}</span>
            )}
          </div>
        </div>
        <GiTrophy className="text-yellow-400 text-2xl flex-shrink-0" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Prize Pool</p>
          <p className="font-bold text-yellow-400 text-lg font-orbitron">৳{Number(tournament.prize_pool).toLocaleString()}</p>
        </div>
        <div className="bg-dark-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Entry Fee</p>
          <p className="font-bold text-cyan-400 text-lg font-orbitron">
            {parseFloat(tournament.entry_fee) === 0 ? 'FREE' : `৳${tournament.entry_fee}`}
          </p>
        </div>
      </div>

      {/* Participants bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span className="flex items-center"><FiUsers className="mr-1" />{tournament.current_participants}/{tournament.max_participants}</span>
          <span>{Math.round(fillPct)}% full</span>
        </div>
        <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fillPct}%` }}
            transition={{ duration: 0.8, delay: index * 0.07 }}
            className={`h-full rounded-full ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-500' : 'bg-cyan-500'}`}
          />
        </div>
      </div>

      {tournament.status === 'upcoming' && (
        <div className="mb-4 flex justify-center">
          <CountdownTimer targetDate={tournament.start_time} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 flex items-center">
          <FiCalendar className="mr-1" />
          {tournament.start_time ? format(new Date(tournament.start_time), 'MMM dd, yyyy') : 'TBD'}
        </p>
        <Link to={`/tournament/${tournament.id}`} className="btn-primary text-sm px-4 py-2">
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
