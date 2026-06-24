import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiCloseLine, RiSaveLine } from 'react-icons/ri';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const PAGES = [
  { slug: 'about', label: 'আমাদের সম্পর্কে' },
  { slug: 'terms', label: 'শর্তাবলী' },
  { slug: 'privacy', label: 'গোপনীয়তা নীতি' },
  { slug: 'rules', label: 'টুর্নামেন্ট নিয়ম' },
];

export default function AdminContent() {
  const [tab, setTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [pages, setPages] = useState({});
  const [annModal, setAnnModal] = useState(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '' });
  const [pageContent, setPageContent] = useState({ slug: 'about', title: '', content: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tab === 'announcements') fetchAnnouncements();
    if (tab === 'pages') fetchPages();
  }, [tab]);

  const fetchAnnouncements = async () => {
    api.get('/admin/announcements').then(r => setAnnouncements(r.data || [])).catch(() => {});
  };
  const fetchPages = async () => {
    api.get('/admin/pages').then(r => {
      const map = {};
      (r.data || []).forEach(p => map[p.slug] = p);
      setPages(map);
      if (r.data?.length) {
        const first = r.data[0];
        setPageContent({ slug: first.slug, title: first.title || '', content: first.content || '' });
      }
    }).catch(() => {});
  };

  const saveAnn = async () => {
    setSaving(true);
    try {
      if (annModal === 'create') await api.post('/admin/announcements', annForm);
      else await api.put(`/admin/announcements/${annModal}`, annForm);
      toast.success(annModal === 'create' ? 'ঘোষণা তৈরি হয়েছে!' : 'আপডেট হয়েছে!');
      setAnnModal(null);
      fetchAnnouncements();
    } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
    finally { setSaving(false); }
  };

  const deleteAnn = async (id) => {
    if (!window.confirm('মুছে ফেলবেন?')) return;
    try { await api.delete(`/admin/announcements/${id}`); toast.success('মুছে ফেলা হয়েছে'); fetchAnnouncements(); }
    catch { toast.error('ব্যর্থ'); }
  };

  const savePage = async () => {
    setSaving(true);
    try {
      await api.post('/admin/pages', pageContent);
      toast.success('পেজ সংরক্ষিত হয়েছে!');
    } catch { toast.error('ব্যর্থ হয়েছে'); }
    finally { setSaving(false); }
  };

  const selectPage = (slug) => {
    const p = pages[slug] || { slug, title: PAGES.find(x => x.slug === slug)?.label || '', content: '' };
    setPageContent({ slug, title: p.title, content: p.content || '' });
  };

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-white mb-6">কন্টেন্ট ম্যানেজমেন্ট</h2>

      <div className="flex gap-2 mb-5">
        {[{ v: 'announcements', l: '📢 ঘোষণা' }, { v: 'pages', l: '📄 পেজ' }].map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{ background: tab === t.v ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.04)', borderColor: tab === t.v ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.08)', color: tab === t.v ? '#22d3ee' : '#9ca3af' }}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'announcements' && (
        <div>
          <div className="flex justify-end mb-3">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setAnnForm({ title: '', content: '' }); setAnnModal('create'); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
              <RiAddLine />নতুন ঘোষণা
            </motion.button>
          </div>
          <div className="space-y-2">
            {announcements.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">কোনো ঘোষণা নেই</p> :
            announcements.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-white/8"
                style={{ background: '#13131F' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{a.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{a.content?.replace(/<[^>]*>/g, '').slice(0, 60)}</p>
                </div>
                <div className="flex gap-1 ml-3">
                  <button onClick={() => { setAnnForm({ title: a.title, content: a.content }); setAnnModal(a.id); }}
                    className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10">
                    <RiEditLine className="text-base" />
                  </button>
                  <button onClick={() => deleteAnn(a.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10">
                    <RiDeleteBinLine className="text-base" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pages' && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: '#13131F' }}>
            {PAGES.map(p => (
              <button key={p.slug} onClick={() => selectPage(p.slug)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-colors ${pageContent.slug === p.slug ? 'bg-cyan-400/10 text-cyan-400 font-semibold' : 'text-gray-300 hover:bg-white/3'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="md:col-span-3 space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">শিরোনাম</label>
              <input type="text" value={pageContent.title} onChange={e => setPageContent(f => ({ ...f, title: e.target.value }))}
                className="input-field" placeholder="পেজের শিরোনাম" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">কন্টেন্ট</label>
              <textarea value={pageContent.content} onChange={e => setPageContent(f => ({ ...f, content: e.target.value }))}
                className="input-field resize-none" rows={10} placeholder="HTML বা সাদা টেক্সট লিখুন..." />
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={savePage} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-black text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
              <RiSaveLine />সংরক্ষণ করুন
            </motion.button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {annModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center px-4"
            onClick={() => setAnnModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-3xl p-5 border border-white/10"
              style={{ background: '#13131F' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold text-white text-sm">{annModal === 'create' ? 'নতুন ঘোষণা' : 'ঘোষণা সম্পাদনা'}</h3>
                <button onClick={() => setAnnModal(null)} className="text-gray-500 hover:text-white"><RiCloseLine className="text-xl" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">শিরোনাম *</label>
                  <input type="text" value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))}
                    className="input-field" placeholder="ঘোষণার শিরোনাম" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">বিবরণ *</label>
                  <textarea value={annForm.content} onChange={e => setAnnForm(f => ({ ...f, content: e.target.value }))}
                    className="input-field resize-none" rows={4} placeholder="ঘোষণার বিবরণ" required />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setAnnModal(null)} className="flex-1 py-3 rounded-xl text-gray-400 border border-white/10 text-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>বাতিল</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveAnn} disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-black text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                  {saving ? 'সংরক্ষণ...' : '✅ সংরক্ষণ করুন'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
