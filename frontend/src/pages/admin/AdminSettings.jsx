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
      toast.success('Settings saved!');
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const createMod = async (e) => {
    e.preventDefault();
    setCreatingMod(true);
    try {
      await api.post('/admin/moderators', modForm);
      toast.success('Moderator created!');
      setModForm({ username: '', email: '', password: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setCreatingMod(false); }
  };

  const Section = ({ title, children, onSave, keys }) => (
    <div className="card neon-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-bold text-white text-sm">{title}</h3>
        {onSave && (
          <button onClick={() => save(keys)} disabled={saving} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
            <FiSave className="text-xs" /> Save
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
      <h2 className="font-orbitron font-bold text-xl text-white">Settings</h2>

      {/* Site Info */}
      <Section title="🌐 Site Information" onSave keys={['site_name', 'site_email']}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Site Name" id="site_name" placeholder="FF Arena" />
          <Field label="Contact Email" id="site_email" placeholder="support@ffarena.com" type="email" />
        </div>
      </Section>

      {/* Payment Settings */}
      <Section title="💳 Payment Methods" onSave keys={['bkash_number', 'nagad_number', 'rocket_number', 'min_deposit', 'min_withdrawal']}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="bKash Number" id="bkash_number" placeholder="01XXXXXXXXX" />
          <Field label="Nagad Number" id="nagad_number" placeholder="01XXXXXXXXX" />
          <Field label="Rocket Number" id="rocket_number" placeholder="01XXXXXXXXX" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Min Deposit (৳)" id="min_deposit" type="number" placeholder="50" />
          <Field label="Min Withdrawal (৳)" id="min_withdrawal" type="number" placeholder="100" />
        </div>
      </Section>

      {/* SMS Webhook */}
      <Section title="📱 SMS Webhook (Auto-Deposit)" onSave keys={['sms_webhook_secret']}>
        <div>
          <Field label="Webhook Secret" id="sms_webhook_secret" placeholder="your-secret-key" />
          <p className="text-xs text-gray-500 mt-1">Webhook URL: <code className="text-cyan-400">{window.location.origin}/api/sms-webhook?secret=YOUR_SECRET</code></p>
        </div>
      </Section>

      {/* SMTP Settings */}
      <Section title="📧 Email / SMTP Settings" onSave keys={['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from']}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SMTP Host" id="smtp_host" placeholder="smtp.gmail.com" />
          <Field label="SMTP Port" id="smtp_port" type="number" placeholder="587" />
          <Field label="SMTP Username" id="smtp_user" placeholder="your@email.com" />
          <Field label="SMTP Password" id="smtp_pass" type="password" placeholder="••••••••" />
          <Field label="From Email" id="smtp_from" placeholder="noreply@ffarena.com" />
        </div>
      </Section>

      {/* Moderator creation (admin only) */}
      {user?.role === 'admin' && (
        <Section title="👮 Create Moderator">
          <form onSubmit={createMod} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Username</label>
              <input value={modForm.username} onChange={e => setModForm(f => ({...f, username: e.target.value}))} className="input-field text-sm" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Email</label>
              <input type="email" value={modForm.email} onChange={e => setModForm(f => ({...f, email: e.target.value}))} className="input-field text-sm" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Password</label>
              <input type="password" value={modForm.password} onChange={e => setModForm(f => ({...f, password: e.target.value}))} className="input-field text-sm" required />
            </div>
            <div className="sm:col-span-3">
              <button type="submit" disabled={creatingMod} className="btn-primary text-sm px-6 py-2 flex items-center gap-2">
                <FiPlus /> {creatingMod ? 'Creating...' : 'Create Moderator'}
              </button>
            </div>
          </form>
        </Section>
      )}
    </div>
  );
}
