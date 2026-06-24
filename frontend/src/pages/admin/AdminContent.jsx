import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const PAGES = ['about', 'terms', 'privacy', 'rules'];

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
    const r = await api.get('/admin/announcements');
    setAnnouncements(r.data);
  };

  const fetchPages = async () => {
    const r = await api.get('/admin/pages');
    const map = {};
    r.data.forEach(p => map[p.slug] = p);
    setPages(map);
    if (r.data.length) setPageContent({ slug: r.data[0].slug, title: r.data[0].title, content: r.data[0].content || '' });
  };

  const saveAnn = async () => {
    setSaving(true);
    try {
      if (annModal?.id) await api.put(`/admin/announcements/${annModal.id}`, annForm);
      else await api.post('/admin/announcements', annForm);
      toast.success('Saved!');
      setAnnModal(null);
      fetchAnnouncements();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const deleteAnn = async (id) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/admin/announcements/${id}`);
    toast.success('Deleted');
    fetchAnnouncements();
  };

  const toggleActive = async (ann) => {
    await api.put(`/admin/announcements/${ann.id}`, { is_active: !ann.is_active });
    fetchAnnouncements();
  };

  const savePage = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/pages/${pageContent.slug}`, { title: pageContent.title, content: pageContent.content });
      toast.success('Page saved!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const selectPage = (slug) => {
    const p = pages[slug] || { slug, title: slug, content: '' };
    setPageContent({ slug, title: p.title || slug, content: p.content || '' });
  };

  return (
    <div className="space-y-4">
      <h2 className="font-orbitron font-bold text-xl text-white">Content Management</h2>
      <div className="flex gap-2">
        <button onClick={() => setTab('announcements')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'announcements' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
          📢 Announcements
        </button>
        <button onClick={() => setTab('pages')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'pages' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
          📄 Static Pages
        </button>
      </div>

      {tab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setAnnForm({ title: '', content: '' }); setAnnModal({}); }} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
              <FiPlus /> New Announcement
            </button>
          </div>
          <div className="space-y-3">
            {announcements.map(a => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card neon-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${a.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {a.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{a.content.replace(/<[^>]*>/g, '')}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(a)} className={`text-xs px-3 py-1 rounded-lg border transition-colors ${a.is_active ? 'border-gray-500 text-gray-400 hover:border-red-400 hover:text-red-400' : 'border-green-500/50 text-green-400 hover:bg-green-500/10'}`}>
                      {a.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => { setAnnForm({ title: a.title, content: a.content }); setAnnModal(a); }} className="p-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded"><FiEdit /></button>
                    <button onClick={() => deleteAnn(a.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"><FiTrash2 /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pages' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-2">
            {PAGES.map(slug => (
              <button key={slug} onClick={() => selectPage(slug)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm capitalize transition-all ${pageContent.slug === slug ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-cyan-500/30'}`}>
                {slug === 'about' ? 'About Us' : slug === 'terms' ? 'Terms & Conditions' : slug === 'privacy' ? 'Privacy Policy' : 'Tournament Rules'}
              </button>
            ))}
          </div>
          <div className="md:col-span-3 card neon-border space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Page Title</label>
              <input value={pageContent.title} onChange={e => setPageContent(f => ({...f, title: e.target.value}))} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Content (HTML supported)</label>
              <textarea value={pageContent.content} onChange={e => setPageContent(f => ({...f, content: e.target.value}))} rows={15} className="input-field text-sm resize-y font-mono text-xs" />
            </div>
            <button onClick={savePage} disabled={saving} className="btn-primary text-sm px-6 py-2 flex items-center gap-2">
              <FiSave /> {saving ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {annModal !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card neon-border w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron font-bold text-white">{annModal?.id ? 'Edit' : 'New'} Announcement</h3>
              <button onClick={() => setAnnModal(null)}><FiX className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Title</label>
                <input value={annForm.title} onChange={e => setAnnForm(f => ({...f, title: e.target.value}))} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Content</label>
                <textarea value={annForm.content} onChange={e => setAnnForm(f => ({...f, content: e.target.value}))} rows={4} className="input-field text-sm resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setAnnModal(null)} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
                <button onClick={saveAnn} disabled={saving} className="flex-1 btn-primary text-sm py-2">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
