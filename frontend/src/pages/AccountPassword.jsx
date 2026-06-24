import { useState } from 'react';
import { motion } from 'framer-motion';
import { RiLockLine, RiEyeLine, RiEyeOffLine, RiArrowLeftLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition.jsx';

export default function AccountPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast.error('নতুন পাসওয়ার্ড মিলছে না'); return; }
    if (form.newPassword.length < 6) { toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে!');
      navigate('/account');
    } catch (err) { toast.error(err.response?.data?.error || 'ব্যর্থ হয়েছে'); }
    finally { setLoading(false); }
  };

  const Field = ({ label, field, showKey }) => (
    <div>
      <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
      <div className="relative">
        <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type={show[showKey] ? 'text' : 'password'} value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          className="input-field pl-10 pr-10" placeholder={label} required />
        <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
          {show[showKey] ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
        </button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/account')} className="p-2 rounded-xl border border-white/10 text-gray-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <RiArrowLeftLine className="text-lg" />
          </button>
          <h2 className="font-orbitron font-bold text-sm text-white">পাসওয়ার্ড পরিবর্তন</h2>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="card rounded-2xl p-4 space-y-4">
            <Field label="বর্তমান পাসওয়ার্ড" field="currentPassword" showKey="cur" />
            <Field label="নতুন পাসওয়ার্ড" field="newPassword" showKey="new" />
            <Field label="পাসওয়ার্ড নিশ্চিত করুন" field="confirm" showKey="con" />
          </div>
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-black text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #d946ef, #a21caf)' }}>
            {loading ? <span className="flex items-center justify-center gap-2"><span className="dot-pulse"><span/><span/><span/></span>পরিবর্তন হচ্ছে...</span> : '🔒 পাসওয়ার্ড পরিবর্তন করুন'}
          </motion.button>
        </form>
      </div>
    </PageTransition>
  );
}
