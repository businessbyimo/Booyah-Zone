import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiCloseLine } from 'react-icons/ri';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY = { name: '', description: '', rules: '', map: 'Bermuda', entry_fee: 0, prize_pool: '', prize_1st: '', prize_2nd: '', prize_3rd: '', max_participants: 100, start_time: '', end_time: '', status: 'upcoming' };
const MAPS = ['Bermuda', 'Kalahari', 'Purgatory', 'Alpine', 'Nexterra'];
const statusLabel = { upcoming: 'আসন্ন', ongoing: 'চলমান', completed: 'সম্পন্ন', cancelled: 'বাতিল' };

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/tournaments?limit=50'); setTournaments(r.data.tournaments || []); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (t) => {
    setForm({ ...t, start_time: t.start_time ? new Date(t.start_time).toISOString().slice(0, 16) : '', end_time: t.end_time ? new Date(t.end_time).toISOString().slice(0, 16) : '' });
    setModal('edit');
  };
  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await api.post('/admin/tournaments', form);
      else await api.put(`/admin/tournaments/${form.id}`, form);
      toast.success(modal === 'create' ? 'টুর্নামেন্ট তৈরি হয়েছে!' : 'আপডেট হয়েছে!');
      setModal(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
    finally { setSaving(false); }
  };
  const deleteTournament = async (id) => {
    if (!window.confirm('মুছে ফেলবেন?')) return;
    try { await api.delete(`/admin/tournaments/${id}`); toast.success('মুছে ফেলা হয়েছে'); fetchData(); } catch { toast.error('ব্যর্থ'); }
  };
  const quickStatus = async (id, status) => {
    try { await api.put(`/admin/tournaments/${id}`, { status }); toast.success('স্ট্যাটাস আপডেট'); fetchData(); } catch { toast.error('ব্যর্থ'); }
  };

  const Input = ({ label, field, type = 'text', ...props }) => (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input type={type} value={form[field] ?? ''} onChange={set(field)} className="input-field" {...props} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron font-bold text-xl text-white">টুর্নামেন্ট ম্যানেজমেন্ট</h2>
        <motion.button whileTap={{ scale: 0.97 }} onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-black text-sm"
          style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
          <RiAddLine />নতুন টুর্নামেন্ট
        </motion.button>
      </div>

      <div className="space-y-2">
        {loading ? [...Array(4)].map((_,i)=><div key={i} className="h-16 rounded-2xl shimmer"/>) :
        tournaments.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/8 hover:bg-white/3 transition-colors"
            style={{ background: '#13131F' }}>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{t.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`badge-${t.status} text-[10px]`}>{statusLabel[t.status]}</span>
                <span className="text-[10px] text-gray-500">{t.map} · ৳{Number(t.prize_pool || 0).toLocaleString()} · {t.current_participants}/{t.max_participants}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <select value={t.status} onChange={e => quickStatus(t.id, e.target.value)}
                className="text-xs rounded-lg px-2 py-1 border border-white/10 text-gray-300"
                style={{ background: '#1a1a2e' }}>
                {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-colors">
                <RiEditLine className="text-base" />
              </button>
              <button onClick={() => deleteTournament(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                <RiDeleteBinLine className="text-base" />
              </button>
            </div>
          </motion.div>
        ))}
        {!loading && tournaments.length === 0 && <p className="text-gray-500 text-sm text-center py-8">কোনো টুর্নামেন্ট নেই</p>}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-start justify-center px-4 py-6 overflow-y-auto"
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl p-5 border border-white/10 my-auto"
              style={{ background: '#13131F' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold text-white text-sm">
                  {modal === 'create' ? 'নতুন টুর্নামেন্ট' : 'টুর্নামেন্ট সম্পাদনা'}
                </h3>
                <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white">
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                <Input label="নাম *" field="name" placeholder="টুর্নামেন্টের নাম" required />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">ম্যাপ</label>
                    <select value={form.map} onChange={set('map')} className="input-field">
                      {MAPS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">স্ট্যাটাস</label>
                    <select value={form.status} onChange={set('status')} className="input-field">
                      {Object.entries(statusLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="এন্ট্রি ফি (৳)" field="entry_fee" type="number" placeholder="0" />
                  <Input label="মোট পুরস্কার (৳)" field="prize_pool" type="number" placeholder="0" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input label="১ম পুরস্কার" field="prize_1st" type="number" placeholder="0" />
                  <Input label="২য় পুরস্কার" field="prize_2nd" type="number" placeholder="0" />
                  <Input label="৩য় পুরস্কার" field="prize_3rd" type="number" placeholder="0" />
                </div>
                <Input label="সর্বোচ্চ প্রতিযোগী" field="max_participants" type="number" placeholder="100" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="শুরুর সময়" field="start_time" type="datetime-local" />
                  <Input label="শেষের সময়" field="end_time" type="datetime-local" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">বিবরণ</label>
                  <textarea value={form.description} onChange={set('description')}
                    className="input-field resize-none" rows={2} placeholder="টুর্নামেন্টের বিবরণ" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">নিয়মাবলী</label>
                  <textarea value={form.rules} onChange={set('rules')}
                    className="input-field resize-none" rows={3} placeholder="নিয়মাবলী লিখুন" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-gray-400 border border-white/10 text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>বাতিল</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={save} disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-black text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                  {saving ? 'সংরক্ষণ হচ্ছে...' : '✅ সংরক্ষণ করুন'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
