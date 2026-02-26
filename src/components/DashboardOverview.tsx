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
import { motion } from 'motion/react';
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
  const [guildConfig, setGuildConfig] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return;
      
      const [members, squads, finances, noticesData, configData, eventsData, rulesData] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('squads').select('id', { count: 'exact' }),
        supabase.from('finances').select('amount, type'),
        supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('guild_config').select('*').single(),
        supabase.from('events').select('*').eq('status', 'upcoming').order('event_date', { ascending: true }).limit(3),
        supabase.from('guild_rules').select('*').limit(5)
      ]);

      const balance = finances.data?.reduce((acc, curr) => {
        return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
      }, 0) || 0;

      setStats({
        totalMembers: members.count || 0,
        totalSquads: squads.count || 0,
        totalBalance: configData.data?.balance || balance,
        activeNotices: noticesData.data?.length || 0
      });
      setNotices(noticesData.data || []);
      setGuildConfig(configData.data || { level: 1, exp: 0, next_level_exp: 1000 });
      setEvents(eventsData.data || []);
      setRules(rulesData.data || []);
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
    { label: 'মোট সদস্য', value: stats.totalMembers, icon: Users, color: 'text-blue-500', trend: '+১২%' },
    { label: 'মোট স্কোয়াড', value: stats.totalSquads, icon: Activity, color: 'text-yellow-500', trend: '+২' },
    { label: 'বর্তমান ব্যালেন্স', value: `৳${stats.totalBalance}`, icon: Wallet, color: 'text-green-500', trend: '৳৫০০+' },
    { label: 'সক্রিয় নোটিশ', value: stats.activeNotices, icon: ShieldAlert, color: 'text-red-500', trend: 'নতুন' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-bengali">কমান্ড সেন্টার</h2>
          <p className="text-white/60 font-bengali">গিল্ডের বর্তমান অবস্থা এবং রিয়েল-টাইম পরিসংখ্যান</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Calendar size={18} className="text-white/40" />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Guild Level Progress */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f27d26]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#f27d26] to-[#ff4e00] flex items-center justify-center text-3xl font-black shadow-lg shadow-[#f27d26]/20">
            LV.{guildConfig?.level || 1}
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-bengali">গিল্ড প্রগ্রেস</h3>
                <p className="text-sm text-white/40 font-bengali">
                  পরবর্তী লেভেলে পৌঁছাতে আর মাত্র {Math.max(0, (guildConfig?.next_level_exp || 1000) - (guildConfig?.exp || 0))} EXP প্রয়োজন
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#f27d26]">
                  {Math.min(100, Math.round(((guildConfig?.exp || 0) / (guildConfig?.next_level_exp || 1000)) * 100))}%
                </div>
                <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Experience</div>
              </div>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round(((guildConfig?.exp || 0) / (guildConfig?.next_level_exp || 1000)) * 100))}%` }}
                className="h-full bg-gradient-to-r from-[#f27d26] to-[#ff4e00] rounded-full shadow-[0_0_15px_rgba(242,125,38,0.5)]"
              ></motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card p-6 group hover:border-[#f27d26]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <TrendingUp size={14} className="text-[#f27d26]" />
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className="text-[10px] font-bold text-[#f27d26] bg-[#f27d26]/10 px-2 py-1 rounded-lg">
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-white/40 font-bengali">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg font-bengali">আসন্ন ইভেন্টসমূহ (Upcoming Events)</h3>
            <button className="text-xs font-bold text-[#f27d26] font-bengali">সব দেখুন</button>
          </div>
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[#f27d26]/20 transition-all group">
                  <div className="w-16 h-16 bg-[#f27d26]/10 rounded-lg flex flex-col items-center justify-center text-[#f27d26] border border-[#f27d26]/20 shrink-0">
                    <span className="text-xs font-bold uppercase">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-black">{new Date(event.event_date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg truncate group-hover:text-[#f27d26] transition-colors">{event.title}</h4>
                    <p className="text-sm text-white/40 line-clamp-1">{event.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60 font-mono">
                        {new Date(event.event_date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.status === 'active' && (
                        <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded font-bold animate-pulse">
                          চলছে
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-[#f27d26] hover:text-white rounded-lg text-sm font-bold transition-all font-bengali whitespace-nowrap">
                    বিস্তারিত
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/10">
                <Calendar size={48} className="mb-4" />
                <p className="font-bengali">কোনো ইভেন্ট নেই</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 border-[#f27d26]/20 bg-gradient-to-b from-[#f27d26]/5 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg font-bengali">গিল্ড রুলস</h3>
            <ShieldAlert size={20} className="text-[#f27d26]" />
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {rules.length > 0 ? (
              rules.map((rule, index) => (
                <div key={rule.id} className="flex gap-3">
                  <span className="text-[#f27d26] font-bold font-mono mt-1">{index + 1}.</span>
                  <div>
                    <p className="text-sm text-white/80 font-bengali leading-relaxed">{rule.rule_text}</p>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider">{rule.category}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/20 font-bengali">
                কোনো রুলস পাওয়া যায়নি
              </div>
            )}
          </div>

          <button className="w-full mt-6 bg-[#f27d26] hover:bg-[#ff4e00] text-white py-3 rounded-xl text-sm font-bold transition-all font-bengali">
            সব রুলস পড়ুন
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg font-bengali mb-6">সেরা প্লেয়ার (Leaderboard)</h3>
          <div className="space-y-4">
            {[
              { name: 'STB Soyeb', id: '12345678', kd: '5.2', rank: 'Grandmaster' },
              { name: 'STB Rahul', id: '87654321', kd: '4.8', rank: 'Master' },
              { name: 'STB Fahim', id: '11223344', kd: '4.5', rank: 'Master' },
            ].map((player, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#f27d26]/20 flex items-center justify-center text-[#f27d26] font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{player.name}</div>
                    <div className="text-[10px] text-white/40">ID: {player.id}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#f27d26]">{player.kd} K/D</div>
                  <div className="text-[10px] text-white/20 uppercase font-bold">{player.rank}</div>
                </div>
              </div>
            ))}
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
