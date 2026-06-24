import { useState, useEffect } from 'react';
import { RiSaveLine, RiAddLine } from 'react-icons/ri';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [modForm, setModForm] = useState({ username: '', email: '', password: '' });
  const [creatingMod, setCreatingMod] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(r => setSettings(r.data || {})).catch(() => {});
  }, []);

  const set = (key) => (e) => setSettings(s => ({ ...s, [key]: e.target.value }));

  const save = async (keys) => {
    setSaving(true);
    try {
      const subset = {};
      keys.forEach(k => subset[k] = settings[k] || '');
      await api.put('/admin/settings', { settings: subset });
      toast.success('সেটিংস সংরক্ষিত হয়েছে!');
    } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
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

  const Section = ({ title, children, saveKeys }) => (
    <div className="card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-semibold text-white text-sm">{title}</h3>
        {saveKeys && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => save(saveKeys)} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
            <RiSaveLine className="text-sm" />সংরক্ষণ
          </motion.button>
        )}
      </div>
      {children}
    </div>
  );

  const Field = ({ label, skey, type = 'text', placeholder }) => (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input type={type} value={settings[skey] || ''} onChange={set(skey)}
        className="input-field" placeholder={placeholder} />
    </div>
  );

  return (
    <div>
      <h2 className="font-orbitron font-bold text-xl text-white mb-6">সিস্টেম সেটিংস</h2>

      <div className="space-y-4">
        <Section title="🌸 bKash" saveKeys={['bkash_number', 'bkash_type']}>
          <Field label="bKash নম্বর" skey="bkash_number" placeholder="01XXXXXXXXX" />
          <div>
            <label className="text-xs text-gray-400 mb-1 block">একাউন্টের ধরন</label>
            <select value={settings.bkash_type || 'personal'} onChange={set('bkash_type')} className="input-field">
              <option value="personal">Personal</option>
              <option value="merchant">Merchant</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        </Section>

        <Section title="🟠 Nagad" saveKeys={['nagad_number']}>
          <Field label="Nagad নম্বর" skey="nagad_number" placeholder="01XXXXXXXXX" />
        </Section>

        <Section title="🚀 Rocket" saveKeys={['rocket_number']}>
          <Field label="Rocket নম্বর" skey="rocket_number" placeholder="01XXXXXXXXX" />
        </Section>

        <Section title="💰 পেমেন্ট লিমিট" saveKeys={['min_deposit', 'max_deposit', 'min_withdrawal', 'max_withdrawal']}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ন্যূনতম ডিপোজিট (৳)" skey="min_deposit" type="number" placeholder="10" />
            <Field label="সর্বোচ্চ ডিপোজিট (৳)" skey="max_deposit" type="number" placeholder="50000" />
            <Field label="ন্যূনতম উইথড্র (৳)" skey="min_withdrawal" type="number" placeholder="100" />
            <Field label="সর্বোচ্চ উইথড্র (৳)" skey="max_withdrawal" type="number" placeholder="10000" />
          </div>
        </Section>

        <Section title="🔴 মেইনটেন্যান্স মোড" saveKeys={['maintenance_mode', 'maintenance_message']}>
          <div className="flex items-center gap-3">
            <label className="relative flex-shrink-0">
              <input type="checkbox" checked={settings.maintenance_mode === 'true'} onChange={e => setSettings(s=>({...s, maintenance_mode: e.target.checked ? 'true' : 'false'}))} className="sr-only" />
              <div className={`w-10 h-5.5 rounded-full transition-all ${settings.maintenance_mode === 'true' ? 'bg-red-500' : 'bg-gray-600'}`}
                onClick={() => setSettings(s=>({...s, maintenance_mode: s.maintenance_mode === 'true' ? 'false' : 'true'}))}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${settings.maintenance_mode === 'true' ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>
            <span className="text-sm text-gray-300">মেইনটেন্যান্স মোড</span>
          </div>
          <Field label="মেইনটেন্যান্স বার্তা" skey="maintenance_message" placeholder="সাইট মেইনটেন্যান্স চলছে..." />
        </Section>

        {user?.role === 'admin' && (
          <Section title="🛡️ মডারেটর তৈরি">
            <form onSubmit={createMod} className="space-y-3">
              <Field label="ইউজারনেম" skey="__" placeholder="" />
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ইউজারনেম</label>
                  <input type="text" value={modForm.username} onChange={e => setModForm(f => ({ ...f, username: e.target.value }))}
                    className="input-field" placeholder="মডারেটর ইউজারনেম" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ইমেইল</label>
                  <input type="email" value={modForm.email} onChange={e => setModForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field" placeholder="মডারেটর ইমেইল" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">পাসওয়ার্ড</label>
                  <input type="password" value={modForm.password} onChange={e => setModForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field" placeholder="পাসওয়ার্ড" required minLength={6} />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={creatingMod}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #d946ef, #a21caf)' }}>
                <RiAddLine />মডারেটর তৈরি করুন
              </motion.button>
            </form>
          </Section>
        )}
      </div>
    </div>
  );
}
