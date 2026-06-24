import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all', user_id: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    api.get('/admin/notifications?limit=20').then(r => setSent(r.data?.notifications || [])).catch(() => {}).finally(() => setLoadingList(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/notifications/send', form);
      toast.success('নোটিফিকেশন পাঠানো হয়েছে!');
      setForm({ title: '', message: '', type: 'info', target: 'all', user_id: '' });
      api.get('/admin/notifications?limit=20').then(r => setSent(r.data?.notifications || [])).catch(() => {});
    } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
    finally { setLoading(false); }
  };

  const TYPES = [{ v: 'info', l: 'তথ্য', c: 'text-blue-400' }, { v: 'success', l: 'সফলতা', c: 'text-green-400' }, { v: 'warning', l: 'সতর্কতা', c: 'text-yellow-400' }, { v: 'error', l: 'ত্রুটি', c: 'text-red-400' }];

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-white mb-6">নোটিফিকেশন পাঠান</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">নতুন নোটিফিকেশন</h3>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">শিরোনাম *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-field" placeholder="নোটিফিকেশনের শিরোনাম" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">বার্তা *</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="input-field resize-none" rows={3} placeholder="বিস্তারিত বার্তা" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ধরন</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                  {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">প্রাপক</label>
                <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} className="input-field">
                  <option value="all">সকলে</option>
                  <option value="specific">নির্দিষ্ট ইউজার</option>
                </select>
              </div>
            </div>
            {form.target === 'specific' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ইউজার আইডি</label>
                <input type="number" value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                  className="input-field" placeholder="ইউজার আইডি" />
              </div>
            )}
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-black text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
              {loading ? 'পাঠানো হচ্ছে...' : '📤 পাঠান'}
            </motion.button>
          </form>
        </div>

        <div className="card rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">সাম্প্রতিক নোটিফিকেশন</h3>
          {loadingList ? (
            <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-12 rounded-xl shimmer"/>)}</div>
          ) : sent.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">কোনো নোটিফিকেশন নেই</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sent.map((n, i) => (
                <div key={n.id} className="p-2.5 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-white text-xs font-semibold">{n.title}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5 truncate">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
