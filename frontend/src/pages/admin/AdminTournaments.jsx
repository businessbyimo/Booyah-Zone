import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiX, FiRefreshCw } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY = { name: '', description: '', rules: '', map: 'Bermuda', entry_fee: 0, prize_pool: '', prize_1st: '', prize_2nd: '', prize_3rd: '', max_participants: 100, start_time: '', end_time: '', status: 'upcoming' };

const statusBadge = { upcoming: 'badge-upcoming', ongoing: 'badge-ongoing', completed: 'badge-completed', cancelled: 'badge-cancelled' };
const statusLabel = { upcoming: 'আসন্ন', ongoing: 'চলমান', completed: 'সম্পন্ন', cancelled: 'বাতিল' };
const MAPS = ['Bermuda', 'Kalahari', 'Purgatory', 'Alpine', 'Nexterra'];

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/tournaments?limit=50'); setTournaments(r.data.tournaments); } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (t) => { setForm({ ...t, start_time: t.start_time ? new Date(t.start_time).toISOString().slice(0, 16) : '', end_time: t.end_time ? new Date(t.end_time).toISOString().slice(0, 16) : '' }); setModal('edit'); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await api.post('/admin/tournaments', form);
      else await api.put(`/admin/tournaments/${form.id}`, form);
      toast.success(modal === 'create' ? 'টুর্নামেন্ট তৈরি হয়েছে!' : 'টুর্নামেন্ট আপডেট হয়েছে!');
      setModal(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'সংরক্ষণ ব্যর্থ হয়েছে'); }
    finally { setSaving(false); }
  };

  const deleteTournament = async (id) => {
    if (!confirm('এই টুর্নামেন্ট মুছে ফেলবেন?')) return;
    try { await api.delete(`/admin/tournaments/${id}`); toast.success('মুছে ফেলা হয়েছে'); fetchData(); } catch { toast.error('মুছতে ব্যর্থ হয়েছে'); }
  };

  const quickStatus = async (id, status) => {
    try { await api.put(`/admin/tournaments/${id}`, { status }); toast.success(`স্ট্যাটাস: ${statusLabel[status]}`); fetchData(); } catch { toast.error('ব্যর্থ হয়েছে'); }
  };

  const generateBracket = async (id) => {
    try { const r = await api.post(`/admin/tournaments/${id}/generate-bracket`); toast.success(r.data.message); } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-xl text-white">টুর্নামেন্ট ({tournaments.length})</h2>
        <button onClick={openCreate} className="btn-primary text-sm px-4 py-2 flex items-center gap-2"><FiPlus /> নতুন টুর্নামেন্ট</button>
      </div>

      <div className="card neon-border overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-600 text-gray-500 text-xs">
                <th className="pb-3 pl-4 text-left">নাম</th>
                <th className="pb-3 text-center">স্ট্যাটাস</th>
                <th className="pb-3 text-center hidden sm:table-cell">স্লট</th>
                <th className="pb-3 text-right hidden md:table-cell">ফি/পুরস্কার</th>
                <th className="pb-3 text-right hidden lg:table-cell">শুরু</th>
                <th className="pb-3 pr-4 text-right">অ্যাকশন</th>
              </tr></thead>
              <tbody>
                {tournaments.map(t => (
                  <tr key={t.id} className="border-b border-dark-600/30 hover:bg-dark-700/30">
                    <td className="py-3 pl-4 text-white font-medium">{t.name}</td>
                    <td className="py-3 text-center"><span className={statusBadge[t.status]}>{statusLabel[t.status] || t.status}</span></td>
                    <td className="py-3 text-center text-gray-400 hidden sm:table-cell">{t.current_participants}/{t.max_participants}</td>
                    <td className="py-3 text-right hidden md:table-cell">
                      <span className="text-cyan-400">৳{t.entry_fee}</span><span className="text-gray-500 mx-1">/</span><span className="text-yellow-400">৳{t.prize_pool}</span>
                    </td>
                    <td className="py-3 text-right text-gray-500 text-xs hidden lg:table-cell">{t.start_time ? format(new Date(t.start_time), 'dd MMM, HH:mm') : '-'}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <select onChange={e => quickStatus(t.id, e.target.value)} value={t.status}
                          className="bg-dark-700 border border-dark-500 text-gray-300 text-xs rounded px-1 py-1 hidden sm:block">
                          {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        <button onClick={() => generateBracket(t.id)} title="ব্র্যাকেট তৈরি" className="p-1.5 text-fuchsia-400 hover:bg-fuchsia-400/10 rounded">
                          <FiRefreshCw className="text-sm" />
                        </button>
                        <button onClick={() => openEdit(t)} className="p-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded"><FiEdit className="text-sm" /></button>
                        <button onClick={() => deleteTournament(t.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"><FiTrash2 className="text-sm" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* তৈরি/সম্পাদনা মডাল */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 px-4 py-6 overflow-y-auto">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card neon-border w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-orbitron font-bold text-white">{modal === 'create' ? 'নতুন টুর্নামেন্ট তৈরি' : 'টুর্নামেন্ট সম্পাদনা'}</h3>
              <button onClick={() => setModal(null)}><FiX className="text-gray-400 hover:text-white" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 block mb-1">টুর্নামেন্টের নাম *</label>
                <input value={form.name} onChange={set('name')} className="input-field text-sm" required />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 block mb-1">বিবরণ</label>
                <textarea value={form.description} onChange={set('description')} rows={2} className="input-field text-sm resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 block mb-1">নিয়মাবলী</label>
                <textarea value={form.rules} onChange={set('rules')} rows={3} className="input-field text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">ম্যাপ</label>
                <select value={form.map} onChange={set('map')} className="input-field text-sm">
                  {MAPS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">সর্বোচ্চ অংশগ্রহণকারী</label>
                <input type="number" value={form.max_participants} onChange={set('max_participants')} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">এন্ট্রি ফি (৳)</label>
                <input type="number" value={form.entry_fee} onChange={set('entry_fee')} className="input-field text-sm" min={0} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">মোট পুরস্কার (৳)</label>
                <input type="number" value={form.prize_pool} onChange={set('prize_pool')} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">১ম পুরস্কার (৳)</label>
                <input type="number" value={form.prize_1st} onChange={set('prize_1st')} className="input-field text-sm" min={0} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">২য় পুরস্কার (৳)</label>
                <input type="number" value={form.prize_2nd} onChange={set('prize_2nd')} className="input-field text-sm" min={0} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">৩য় পুরস্কার (৳)</label>
                <input type="number" value={form.prize_3rd} onChange={set('prize_3rd')} className="input-field text-sm" min={0} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">শুরুর সময় *</label>
                <input type="datetime-local" value={form.start_time} onChange={set('start_time')} className="input-field text-sm" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">শেষের সময়</label>
                <input type="datetime-local" value={form.end_time} onChange={set('end_time')} className="input-field text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 btn-secondary text-sm py-2.5">বাতিল</button>
              <button onClick={save} disabled={saving} className="flex-1 btn-primary text-sm py-2.5">
                {saving ? 'সংরক্ষণ হচ্ছে...' : modal === 'create' ? 'টুর্নামেন্ট তৈরি করুন' : 'পরিবর্তন সংরক্ষণ করুন'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
