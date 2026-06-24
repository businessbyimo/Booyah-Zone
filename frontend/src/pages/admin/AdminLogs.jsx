import { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { format } from 'date-fns';

const ACTION_COLORS = {
  login: 'text-green-400', logout: 'text-gray-400', deposit_approved: 'text-cyan-400',
  deposit_rejected: 'text-red-400', withdrawal_approved: 'text-purple-400',
  user_banned: 'text-red-500', tournament_created: 'text-yellow-400',
  points_updated: 'text-blue-400', admin_action: 'text-orange-400',
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 30, ...(search ? { search } : {}) });
    api.get(`/admin/logs?${params}`).then(r => {
      setLogs(r.data?.logs || []);
      setTotal(r.data?.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-orbitron font-bold text-xl text-white">সিস্টেম লগ</h2>
        <div className="flex items-center gap-2">
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field text-sm py-2 w-48" placeholder="সার্চ করুন..." />
        </div>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs text-gray-500">সময়</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500">ইউজার</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500">অ্যাকশন</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500">বিবরণ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(10)].map((_,i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(4)].map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded shimmer w-24"/></td>)}
                </tr>
              )) : logs.map((log, i) => (
                <tr key={log.id || i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {log.created_at ? format(new Date(log.created_at), 'dd MMM HH:mm') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-xs font-medium">{log.username || log.user_id || 'System'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${ACTION_COLORS[log.action] || 'text-gray-400'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && logs.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">কোনো লগ নেই</p>
          )}
        </div>

        {total > 30 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-xs text-gray-500">মোট {total}টি</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-40">আগে</button>
              <span className="text-xs text-gray-400 px-2 py-1.5">{page}</span>
              <button onClick={() => setPage(p => p+1)} disabled={page * 30 >= total}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-40">পরে</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
