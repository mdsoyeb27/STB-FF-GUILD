import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, ArrowUpRight, ArrowDownLeft, Filter, Download, Plus, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Accounts: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('finances').select('*').order('created_at', { ascending: false });
      if (data) setTransactions(data);
      setLoading(false);
    };
    fetchFinances();
  }, []);

  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [saving, setSaving] = useState(false);

  const handleAddTransaction = async () => {
    if (!supabase || !amount || !desc) return;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('finances').insert({
        amount: parseFloat(amount),
        description: desc,
        type: type,
        recorded_by: userData.user?.id
      });

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        module: 'accounts',
        action: `নতুন ${type === 'income' ? 'আয়' : 'ব্যয়'} যোগ করা হয়েছে`,
        details: { amount, desc }
      });

      alert('হিসাব সফলভাবে যোগ করা হয়েছে!');
      setAmount('');
      setDesc('');
      // Refresh
      const { data } = await supabase.from('finances').select('*').order('created_at', { ascending: false });
      if (data) setTransactions(data);
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#f27d26] animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-bengali">আর্থিক হিসাব</h2>
          <p className="text-white/60 font-bengali">টুর্নামেন্টের এন্ট্রি ফি এবং পেমেন্ট ভেরিফিকেশন</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl flex items-center gap-2 font-bold transition-all font-bengali border border-white/10">
            <Download size={18} />
            রিপোর্ট
          </button>
          <button className="bg-[#f27d26] hover:bg-[#ff4e00] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all font-bengali">
            <Plus size={20} />
            নতুন এন্ট্রি
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <ArrowUpRight size={24} />
            </div>
            <span className="text-xs font-bold text-green-500">+৳১,৫০০</span>
          </div>
          <div className="text-sm text-white/40 font-bengali">মোট আয়</div>
          <div className="text-2xl font-bold">৳৪,৫০০</div>
        </div>
        <div className="glass-card p-6 border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <ArrowDownLeft size={24} />
            </div>
            <span className="text-xs font-bold text-red-500">-৳২০০</span>
          </div>
          <div className="text-sm text-white/40 font-bengali">মোট খরচ</div>
          <div className="text-2xl font-bold">৳৮০০</div>
        </div>
        <div className="glass-card p-6 border-[#f27d26]/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#f27d26]/10 text-[#f27d26]">
              <Wallet size={24} />
            </div>
          </div>
          <div className="text-sm text-white/40 font-bengali">বর্তমান ব্যালেন্স</div>
          <div className="text-2xl font-bold text-[#f27d26]">৳৩,৭০০</div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold font-bengali">সাম্প্রতিক লেনদেন</h3>
          <button className="text-xs font-bold text-[#f27d26] flex items-center gap-1 font-bengali">
            <Filter size={14} /> ফিল্টার
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">বিবরণ</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">ধরণ</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">পরিমাণ</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">তারিখ</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bengali text-sm">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold font-bengali",
                      tx.type === 'income' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {tx.type === 'income' ? 'আয়' : 'খরচ'}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 font-bold",
                    tx.type === 'income' ? "text-green-500" : "text-red-500"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}৳{tx.amount}
                  </td>
                  <td className="px-6 py-4 text-xs text-white/40 font-bengali">{tx.date}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs font-bold font-bengali",
                      tx.status === 'verified' && "text-green-500",
                      tx.status === 'pending' && "text-yellow-500",
                      tx.status === 'rejected' && "text-red-500",
                    )}>
                      {tx.status === 'verified' && <CheckCircle2 size={14} />}
                      {tx.status === 'pending' && <Clock size={14} />}
                      {tx.status === 'rejected' && <XCircle size={14} />}
                      {tx.status === 'verified' && 'ভেরিফাইড'}
                      {tx.status === 'pending' && 'পেন্ডিং'}
                      {tx.status === 'rejected' && 'বাতিল'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
