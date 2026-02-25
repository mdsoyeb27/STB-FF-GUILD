import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Bell, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Info, 
  Zap,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'urgent';
  created_at: string;
}

export const NoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (data) setNotices(data as Notice[]);
      setLoading(false);
    };
    fetchNotices();
  }, []);

  const [newNotice, setNewNotice] = useState({ title: '', content: '', type: 'general' as const });
  const [saving, setSaving] = useState(false);

  const handleAddNotice = async () => {
    if (!supabase || !newNotice.title || !newNotice.content) return;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('notices').insert({
        title: newNotice.title,
        content: newNotice.content,
        type: newNotice.type,
        author_id: userData.user?.id
      });

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        module: 'notices',
        action: 'নতুন নোটিশ প্রকাশ',
        details: { title: newNotice.title }
      });

      alert('নোটিশ সফলভাবে প্রকাশ করা হয়েছে!');
      setShowAddModal(false);
      setNewNotice({ title: '', content: '', type: 'general' });
      // Refresh
      const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (data) setNotices(data as Notice[]);
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

  const getTypeStyles = (type: Notice['type']) => {
    switch (type) {
      case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'important': return 'bg-[#f27d26]/10 text-[#f27d26] border-[#f27d26]/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getTypeIcon = (type: Notice['type']) => {
    switch (type) {
      case 'urgent': return <AlertCircle size={16} />;
      case 'important': return <Zap size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-bengali">নোটিশ বোর্ড ম্যানেজমেন্ট</h2>
          <p className="text-white/60 font-bengali">এখান থেকে ওয়েবসাইটের সব নোটিশ নিয়ন্ত্রণ করুন</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#f27d26] hover:bg-[#ff4e00] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all font-bengali"
        >
          <Plus size={20} />
          নতুন নোটিশ দিন
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notices.map((notice) => (
          <div key={notice.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-6 group">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border",
              getTypeStyles(notice.type)
            )}>
              {getTypeIcon(notice.type)}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg font-bengali">{notice.title}</h3>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold font-bengali uppercase",
                  getTypeStyles(notice.type)
                )}>
                  {notice.type === 'urgent' ? 'জরুরী' : notice.type === 'important' ? 'গুরুত্বপূর্ণ' : 'সাধারণ'}
                </span>
              </div>
              <p className="text-white/60 text-sm font-bengali leading-relaxed">{notice.content}</p>
              <div className="text-[10px] text-white/20 pt-2">{notice.date}</div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors">
                <Edit3 size={18} />
              </button>
              <button className="p-3 hover:bg-red-500/10 rounded-xl text-white/40 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="glass-card w-full max-w-2xl p-8 space-y-6">
            <h3 className="text-xl font-bold font-bengali">নতুন নোটিশ তৈরি করুন</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">শিরোনাম</label>
                <input type="text" placeholder="নোটিশের শিরোনাম লিখুন" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">ধরণ</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26] font-bengali">
                  <option value="general">সাধারণ</option>
                  <option value="important">গুরুত্বপূর্ণ</option>
                  <option value="urgent">জরুরী</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">বিস্তারিত বিবরণ</label>
                <textarea rows={4} placeholder="বিস্তারিত লিখুন..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26] font-bengali" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-xl bg-white/5 font-bengali">বাতিল</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-xl bg-[#f27d26] font-bold font-bengali flex items-center justify-center gap-2">
                <CheckCircle2 size={20} />
                নোটিশ পাবলিশ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
