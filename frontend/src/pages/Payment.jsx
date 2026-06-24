import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowDownCircle, FiArrowUpCircle, FiCopy, FiCheck } from 'react-icons/fi';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PageTransition from '../components/PageTransition.jsx';

export default function Payment() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'deposit');
  const [settings, setSettings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const [depositForm, setDepositForm] = useState({ amount: '', method: 'bKash', sender_number: '', transaction_id: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'bKash', account_number: '' });

  useEffect(() => {
    api.get('/payments/settings').then(r => setSettings(r.data)).catch(() => {});
    api.get('/payments/transactions').then(r => setTransactions(r.data.transactions)).catch(() => {});
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const submitDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments/deposit', depositForm);
      toast.success('Deposit request submitted! It will be reviewed within 24h.');
      setDepositForm({ amount: '', method: 'bKash', sender_number: '', transaction_id: '' });
      api.get('/payments/transactions').then(r => setTransactions(r.data.transactions));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const submitWithdraw = async (e) => {
    e.preventDefault();
    if (parseFloat(withdrawForm.amount) > parseFloat(user?.balance || 0)) {
      return toast.error('Insufficient balance');
    }
    setLoading(true);
    try {
      await api.post('/payments/withdraw', withdrawForm);
      toast.success('Withdrawal request submitted!');
      setWithdrawForm({ amount: '', method: 'bKash', account_number: '' });
      api.get('/payments/transactions').then(r => setTransactions(r.data.transactions));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const METHODS = ['bKash', 'Nagad', 'Rocket'];
  const methodNumbers = { bKash: settings.bkash_number, Nagad: settings.nagad_number, Rocket: settings.rocket_number };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="section-title">💰 Wallet</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-400">Current Balance:</p>
            <span className="font-orbitron font-bold text-2xl text-yellow-400">৳{Number(user?.balance || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button onClick={() => setTab('deposit')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${tab === 'deposit' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
            <FiArrowDownCircle /> Deposit
          </button>
          <button onClick={() => setTab('withdraw')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${tab === 'withdraw' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-dark-700 text-gray-400 border border-dark-500'}`}>
            <FiArrowUpCircle /> Withdraw
          </button>
        </div>

        {tab === 'deposit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instructions */}
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">📋 How to Deposit</h2>
              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2"><span className="text-cyan-400 font-bold">1.</span> Select your payment method below</li>
                <li className="flex gap-2"><span className="text-cyan-400 font-bold">2.</span> Send money to our number</li>
                <li className="flex gap-2"><span className="text-cyan-400 font-bold">3.</span> Note down the Transaction ID (TrxID)</li>
                <li className="flex gap-2"><span className="text-cyan-400 font-bold">4.</span> Fill the form and submit</li>
              </ol>
              <div className="mt-4 space-y-2">
                {METHODS.map(m => methodNumbers[m] && (
                  <div key={m} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg border border-dark-500">
                    <div>
                      <p className="text-sm font-semibold text-white">{m}</p>
                      <p className="text-xs text-gray-400">{methodNumbers[m]}</p>
                    </div>
                    <button onClick={() => copy(methodNumbers[m], m)} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                      {copied === m ? <FiCheck className="text-green-400" /> : <FiCopy />}
                    </button>
                  </div>
                ))}
              </div>
              {settings.min_deposit && <p className="text-xs text-gray-500 mt-3">Minimum deposit: ৳{settings.min_deposit}</p>}
            </div>

            {/* Form */}
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">Submit Deposit</h2>
              <form onSubmit={submitDeposit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Payment Method</label>
                  <select value={depositForm.method} onChange={e => setDepositForm(f => ({...f, method: e.target.value}))} className="input-field">
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Amount (BDT)</label>
                  <input type="number" value={depositForm.amount} onChange={e => setDepositForm(f => ({...f, amount: e.target.value}))} className="input-field" placeholder="0.00" required min={settings.min_deposit || 10} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Your Number (Sender)</label>
                  <input type="text" value={depositForm.sender_number} onChange={e => setDepositForm(f => ({...f, sender_number: e.target.value}))} className="input-field" placeholder="01XXXXXXXXX" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Transaction ID (TrxID)</label>
                  <input type="text" value={depositForm.transaction_id} onChange={e => setDepositForm(f => ({...f, transaction_id: e.target.value}))} className="input-field" placeholder="e.g. AB1234567890" required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
                  {loading ? 'Submitting...' : '✅ Submit Deposit'}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === 'withdraw' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">📋 Withdrawal Info</h2>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Withdrawals are processed manually within 24 hours</li>
                <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Your balance will be deducted immediately</li>
                <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> If rejected, balance is refunded automatically</li>
                {settings.min_withdrawal && <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Minimum withdrawal: ৳{settings.min_withdrawal}</li>}
              </ul>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400">
                ⚠️ Current Balance: ৳{Number(user?.balance || 0).toFixed(2)}
              </div>
            </div>
            <div className="card neon-border">
              <h2 className="font-orbitron font-bold text-white mb-4">Submit Withdrawal</h2>
              <form onSubmit={submitWithdraw} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Payment Method</label>
                  <select value={withdrawForm.method} onChange={e => setWithdrawForm(f => ({...f, method: e.target.value}))} className="input-field">
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Amount (BDT)</label>
                  <input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({...f, amount: e.target.value}))} className="input-field" placeholder="0.00" required max={user?.balance || 0} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Your Account Number</label>
                  <input type="text" value={withdrawForm.account_number} onChange={e => setWithdrawForm(f => ({...f, account_number: e.target.value}))} className="input-field" placeholder="01XXXXXXXXX" required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
                  {loading ? 'Submitting...' : '💸 Request Withdrawal'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="card neon-border mt-8 overflow-hidden">
          <h2 className="font-orbitron font-bold text-white mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-dark-600 text-gray-500">
                  <th className="pb-2 text-left">Type</th><th className="pb-2 text-left">Amount</th>
                  <th className="pb-2 text-left hidden sm:table-cell">Method</th><th className="pb-2 text-left hidden md:table-cell">TrxID</th>
                  <th className="pb-2 text-left">Status</th><th className="pb-2 text-left">Date</th>
                </tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} className="border-b border-dark-600/30">
                      <td className="py-2 capitalize font-semibold" style={{color: t.type==='deposit'?'#4ade80':t.type==='prize'?'#e879f9':t.type==='withdrawal'?'#f87171':'#fbbf24'}}>{t.type}</td>
                      <td className="py-2 text-white font-orbitron">৳{Number(t.amount).toFixed(2)}</td>
                      <td className="py-2 text-gray-400 hidden sm:table-cell">{t.method || '-'}</td>
                      <td className="py-2 text-gray-500 hidden md:table-cell truncate max-w-[100px]">{t.transaction_id || '-'}</td>
                      <td className="py-2"><span className={`badge-${t.status}`}>{t.status}</span></td>
                      <td className="py-2 text-gray-500">{format(new Date(t.created_at), 'MMM dd')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
