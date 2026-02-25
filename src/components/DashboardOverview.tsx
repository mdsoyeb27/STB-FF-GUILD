import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Trophy, 
  Wallet, 
  TrendingUp, 
  Calendar,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalSquads: 0,
    totalBalance: 0,
    activeNotices: 0
  });
  const [loading, setLoading] = useState(true);

  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return;
      
      const [members, squads, finances, noticesData] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('squads').select('id', { count: 'exact' }),
        supabase.from('finances').select('amount, type'),
        supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(3)
      ]);

      const balance = finances.data?.reduce((acc, curr) => {
        return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
      }, 0) || 0;

      setStats({
        totalMembers: members.count || 0,
        totalSquads: squads.count || 0,
        totalBalance: balance,
        activeNotices: noticesData.data?.length || 0
      });
      setNotices(noticesData.data || []);
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#f27d26] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'মোট সদস্য', value: stats.totalMembers, icon: Users, color: 'text-blue-500' },
    { label: 'মোট স্কোয়াড', value: stats.totalSquads, icon: Activity, color: 'text-yellow-500' },
    { label: 'বর্তমান ব্যালেন্স', value: `৳${stats.totalBalance}`, icon: Wallet, color: 'text-green-500' },
    { label: 'সক্রিয় নোটিশ', value: stats.activeNotices, icon: ShieldAlert, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-bengali">সারসংক্ষেপ</h2>
          <p className="text-white/60 font-bengali">গিল্ডের বর্তমান অবস্থা এবং রিয়েল-টাইম পরিসংখ্যান</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Calendar size={18} className="text-white/40" />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card p-6 group hover:border-[#f27d26]/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-white/40 font-bengali">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg font-bengali mb-8">গিল্ড অ্যাক্টিভিটি গ্রাফ</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis stroke="#ffffff40" fontSize={12} />
                <YAxis stroke="#ffffff40" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151619', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#f27d26" fill="#f27d26" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center h-full -mt-[300px] text-white/10 font-bengali">
              পর্যাপ্ত ডাটা নেই
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-lg font-bengali mb-6">সাম্প্রতিক নোটিশ</h3>
          <div className="space-y-4">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[#f27d26]/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#f27d26] uppercase tracking-wider">{notice.category || 'General'}</span>
                    <span className="text-[10px] text-white/20">{new Date(notice.created_at).toLocaleDateString('bn-BD')}</span>
                  </div>
                  <h4 className="font-bold text-sm mb-1">{notice.title}</h4>
                  <p className="text-xs text-white/40 line-clamp-2">{notice.content}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/10">
                <ShieldAlert size={48} className="mb-4" />
                <p className="font-bengali">কোনো নোটিশ পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
