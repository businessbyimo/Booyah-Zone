import { useState, useEffect } from 'react';
import { FiSave, FiPlus } from 'react-icons/fi';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [modForm, setModForm] = useState({ username: '', email: '', password: '' });
  const [creatingMod, setCreatingMod] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(r => setSettings(r.data));
  }, []);

  const set = (key) => (e) => setSettings(s => ({ ...s, [key]: e.target.value }));

  const save = async (keys) => {
    setSaving(true);
    try {
      const subset = {};
      keys.forEach(k => subset[k] = settings[k] || '');
      await api.put('/admin/settings', { settings: subset });
      toast.success('সেটিংস সংরক্ষিত হয়েছে!');
    } catch (err) { toast.error(err.response?.data?.error || 'সংরক্ষণ ব্যর্থ হয়েছে'); }
    finally { setSaving(false); }
  };

  const createMod = async (e) => {
    e.preventDefault();
    setCreatingMod(true);
    try {
      await api.post('/admin/moderators', modForm);
      toast.success('মডারেটর তৈরি হয়েছে!');
      setModForm({ username: '', email: '', password: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
    finally { setCreatingMod(false); }
  };

  const Section = ({ title, children, keys }) => (
    <div className="card neon-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-bold text-white text-sm">{title}</h3>
        {keys && (
          <button onClick={() => save(keys)} disabled={saving} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
            <FiSave className="text-xs" /> সংরক্ষণ
          </button>
        )}
      </div>
      {children}
    </div>
  );

  const Field = ({ label, id, type = 'text', placeholder }) => (
    <div>
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <input type={type} value={settings[id] || ''} onChange={set(id)} className="input-field text-sm" placeholder={placeholder} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="font-orbitron font-bold text-xl text-white">সেটিংস</h2>

      <Section title="🌐 সাইট তথ্য" keys={['site_name', 'site_email']}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="সাইটের নাম" id="site_name" placeholder="BooyahZone" />
          <Field label="যোগাযোগের ইমেইল" id="site_email" placeholder="support@booyahzone.com" type="email" />
        </div>
      </Section>

      <Section title="💳 পেমেন্ট মেথড" keys={['bkash_number', 'nagad_number', 'rocket_number', 'min_deposit', 'min_withdrawal']}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="bKash নম্বর" id="bkash_number" placeholder="01XXXXXXXXX" />
          <Field label="Nagad নম্বর" id="nagad_number" placeholder="01XXXXXXXXX" />
          <Field label="Rocket নম্বর" id="rocket_number" placeholder="01XXXXXXXXX" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="সর্বনিম্ন ডিপোজিট (৳)" id="min_deposit" type="number" placeholder="50" />
          <Field label="সর্বনিম্ন উইথড্র (৳)" id="min_withdrawal" type="number" placeholder="100" />
        </div>
      </Section>

      <Section title="📱 SMS ওয়েবহুক (অটো-ডিপোজিট)" keys={['sms_webhook_secret']}>
        <div>
          <Field label="ওয়েবহুক সিক্রেট" id="sms_webhook_secret" placeholder="your-secret-key" />
          <p className="text-xs text-gray-500 mt-1">ওয়েবহুক URL: <code className="text-cyan-400">{window.location.origin}/api/sms-webhook?secret=YOUR_SECRET</code></p>
        </div>
      </Section>

      <Section title="📧 ইমেইল / SMTP সেটিংস" keys={['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from']}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SMTP হোস্ট" id="smtp_host" placeholder="smtp.gmail.com" />
          <Field label="SMTP পোর্ট" id="smtp_port" type="number" placeholder="587" />
          <Field label="SMTP ইউজারনেম" id="smtp_user" placeholder="your@email.com" />
          <Field label="SMTP পাসওয়ার্ড" id="smtp_pass" type="password" placeholder="••••••••" />
          <Field label="প্রেরক ইমেইল" id="smtp_from" placeholder="noreply@booyahzone.com" />
        </div>
      </Section>

      {user?.role === 'admin' && (
        <Section title="👮 মডারেটর তৈরি করুন">
          <form onSubmit={createMod} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">ইউজারনেম</label>
              <input value={modForm.username} onChange={e => setModForm(f => ({...f, username: e.target.value}))} className="input-field text-sm" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">ইমেইল</label>
              <input type="email" value={modForm.email} onChange={e => setModForm(f => ({...f, email: e.target.value}))} className="input-field text-sm" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">পাসওয়ার্ড</label>
              <input type="password" value={modForm.password} onChange={e => setModForm(f => ({...f, password: e.target.value}))} className="input-field text-sm" required />
            </div>
            <div className="sm:col-span-3">
              <button type="submit" disabled={creatingMod} className="btn-primary text-sm px-6 py-2 flex items-center gap-2">
                <FiPlus /> {creatingMod ? 'তৈরি হচ্ছে...' : 'মডারেটর তৈরি করুন'}
              </button>
            </div>
          </form>
        </Section>
      )}
    </div>
  );
}
