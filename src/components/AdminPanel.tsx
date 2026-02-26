import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Settings, 
  Lock, 
  CheckCircle2, 
  XCircle,
  Palette,
  Globe,
  Save,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Profile } from '../types';

interface AdminPanelProps {
  onVisitWebsite?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onVisitWebsite }) => {
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'STB FF GUILD',
    logoUrl: '',
    bannerUrl: '',
    themeColor: '#f27d26'
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'roles' | 'guild' | 'events' | 'rules'>('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guildConfig, setGuildConfig] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', status: 'upcoming' });
  const [newRule, setNewRule] = useState({ text: '', category: 'General' });

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      
      try {
        const [settings, profiles, config, eventsData, rulesData] = await Promise.all([
          supabase.from('site_settings').select('*').single(),
          supabase.from('profiles').select('*'),
          supabase.from('guild_config').select('*').single(),
          supabase.from('events').select('*').order('created_at', { ascending: false }),
          supabase.from('guild_rules').select('*').order('created_at', { ascending: true })
        ]);

        if (settings.data) {
          setSiteSettings({
            siteName: settings.data.site_name,
            logoUrl: settings.data.logo_url || '',
            bannerUrl: settings.data.banner_url || '',
            themeColor: settings.data.theme_color || '#f27d26'
          });
        }

        if (profiles.data) setUsers(profiles.data as Profile[]);
        if (config.data) setGuildConfig(config.data);
        if (eventsData.data) setEvents(eventsData.data);
        if (rulesData.data) setRules(rulesData.data);

      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateGuildConfig = async () => {
    if (!supabase || !guildConfig) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('guild_config')
        .update({
          level: guildConfig.level,
          exp: guildConfig.exp,
          next_level_exp: guildConfig.next_level_exp,
          balance: guildConfig.balance
        })
        .eq('id', guildConfig.id);

      if (error) throw error;
      alert('গিল্ড কনফিগারেশন আপডেট হয়েছে!');
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          title: newEvent.title,
          description: newEvent.description,
          event_date: newEvent.date ? new Date(newEvent.date).toISOString() : null,
          status: newEvent.status
        }])
        .select()
        .single();

      if (error) throw error;
      setEvents([data, ...events]);
      setNewEvent({ title: '', description: '', date: '', status: 'upcoming' });
      alert('ইভেন্ট যোগ করা হয়েছে!');
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!supabase) return;
    if (!confirm('আপনি কি নিশ্চিত?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleAddRule = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('guild_rules')
        .insert([{
          rule_text: newRule.text,
          category: newRule.category
        }])
        .select()
        .single();

      if (error) throw error;
      setRules([...rules, data]);
      setNewRule({ text: '', category: 'General' });
      alert('রুল যোগ করা হয়েছে!');
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!supabase) return;
    if (!confirm('আপনি কি নিশ্চিত?')) return;
    try {
      const { error } = await supabase.from('guild_rules').delete().eq('id', id);
      if (error) throw error;
      setRules(rules.filter(r => r.id !== id));
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleSaveSettings = async () => {
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_name: siteSettings.siteName,
          logo_url: siteSettings.logoUrl,
          banner_url: siteSettings.bannerUrl,
          theme_color: siteSettings.themeColor
        })
        .eq('id', 1);
      
      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        module: 'admin',
        action: 'সাইট সেটিংস আপডেট',
        details: siteSettings
      });

      alert('সেটিংস সফলভাবে সেভ হয়েছে!');
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));

      // Log activity
      await supabase.from('activity_logs').insert({
        module: 'admin',
        action: 'রোল পরিবর্তন',
        details: { userId, newRole }
      });

      alert('রোল সফলভাবে আপডেট হয়েছে!');
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onVisitWebsite && (
            <button 
              onClick={onVisitWebsite}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors group"
              title="ওয়েবসাইটে ফিরে যান"
            >
              <Globe size={20} className="text-[#f27d26] group-hover:scale-110 transition-transform" />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-bold font-bengali">প্রধান নিয়ন্ত্রণ (Admin Panel)</h2>
            <p className="text-white/60 font-bengali">পুরো ওয়েবসাইটের নাম, থিম, লোগো এবং পারমিশন নিয়ন্ত্রণ করুন</p>
          </div>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto">
          <button 
            onClick={() => setActiveSubTab('settings')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all whitespace-nowrap",
              activeSubTab === 'settings' ? "bg-[#f27d26] text-white" : "text-white/40 hover:text-white"
            )}
          >
            সাইট সেটিংস
          </button>
          <button 
            onClick={() => setActiveSubTab('roles')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all whitespace-nowrap",
              activeSubTab === 'roles' ? "bg-[#f27d26] text-white" : "text-white/40 hover:text-white"
            )}
          >
            রোল ম্যানেজার
          </button>
          <button 
            onClick={() => setActiveSubTab('guild')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all whitespace-nowrap",
              activeSubTab === 'guild' ? "bg-[#f27d26] text-white" : "text-white/40 hover:text-white"
            )}
          >
            গিল্ড কনফিগ
          </button>
          <button 
            onClick={() => setActiveSubTab('events')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all whitespace-nowrap",
              activeSubTab === 'events' ? "bg-[#f27d26] text-white" : "text-white/40 hover:text-white"
            )}
          >
            ইভেন্ট
          </button>
          <button 
            onClick={() => setActiveSubTab('rules')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all whitespace-nowrap",
              activeSubTab === 'rules' ? "bg-[#f27d26] text-white" : "text-white/40 hover:text-white"
            )}
          >
            রুলস
          </button>
        </div>
      </div>

      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-xl font-bold font-bengali mb-4">সাধারণ সেটিংস</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">ওয়েবসাইটের নাম</label>
                <input 
                  type="text" 
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">লোগো URL</label>
                <input 
                  type="text" 
                  value={siteSettings.logoUrl}
                  onChange={(e) => setSiteSettings({...siteSettings, logoUrl: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">ব্যানার URL</label>
                <input 
                  type="text" 
                  value={siteSettings.bannerUrl}
                  onChange={(e) => setSiteSettings({...siteSettings, bannerUrl: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
                />
              </div>
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full bg-[#f27d26] hover:bg-[#ff4e00] text-white font-bold py-4 rounded-xl transition-all font-bengali disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              সেটিংস সেভ করুন
            </button>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-xl font-bold font-bengali mb-4">থিম ও ভিজ্যুয়াল</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">প্রাইমারি কালার</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={siteSettings.themeColor}
                    onChange={(e) => setSiteSettings({...siteSettings, themeColor: e.target.value})}
                    className="w-12 h-12 bg-transparent border-none cursor-pointer"
                  />
                  <span className="text-sm font-mono text-white/40">{siteSettings.themeColor}</span>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xs text-white/40 mb-4 font-bengali uppercase tracking-wider">প্রিভিউ</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl" style={{ backgroundColor: siteSettings.themeColor }}>S</div>
                  <span className="font-bold text-lg tracking-tight">{siteSettings.siteName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'roles' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="font-bold font-bengali flex items-center gap-2">
                <Users size={20} className="text-[#f27d26]" />
                কাস্টম পারমিশন (Role Manager)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">ইউজার</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">রোল</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">পারমিশন</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase text-right font-bengali">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#f27d26]">
                            {user.full_name[0]}
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-[10px] text-white/40 font-mono">{user.game_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold font-bengali focus:outline-none focus:border-[#f27d26]"
                        >
                          <option value="member">সদস্য</option>
                          <option value="leader">টিম লিডার</option>
                          <option value="sub_admin">সহকারী এডমিন</option>
                          <option value="super_admin">সুপার এডমিন</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(user.permissions || {}).map(([key, val]) => (
                            <span key={key} className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold font-bengali",
                              val ? "bg-[#f27d26]/20 text-[#f27d26]" : "bg-white/5 text-white/10"
                            )}>
                              {key.replace('can_', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-[#f27d26] transition-colors">
                          <Settings size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'guild' && guildConfig && (
        <div className="glass-card p-8 space-y-6">
          <h3 className="text-xl font-bold font-bengali mb-4">গিল্ড কনফিগারেশন</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-2 font-bengali">গিল্ড লেভেল</label>
              <input 
                type="number" 
                value={guildConfig.level}
                onChange={(e) => setGuildConfig({...guildConfig, level: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2 font-bengali">বর্তমান EXP</label>
              <input 
                type="number" 
                value={guildConfig.exp}
                onChange={(e) => setGuildConfig({...guildConfig, exp: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2 font-bengali">পরবর্তী লেভেল EXP</label>
              <input 
                type="number" 
                value={guildConfig.next_level_exp}
                onChange={(e) => setGuildConfig({...guildConfig, next_level_exp: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2 font-bengali">গিল্ড ব্যালেন্স</label>
              <input 
                type="number" 
                value={guildConfig.balance}
                onChange={(e) => setGuildConfig({...guildConfig, balance: parseFloat(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              />
            </div>
          </div>
          <button 
            onClick={handleUpdateGuildConfig}
            disabled={saving}
            className="w-full bg-[#f27d26] hover:bg-[#ff4e00] text-white font-bold py-4 rounded-xl transition-all font-bengali disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            কনফিগারেশন আপডেট করুন
          </button>
        </div>
      )}

      {activeSubTab === 'events' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold font-bengali mb-4">নতুন ইভেন্ট যোগ করুন</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="ইভেন্টের নাম"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              />
              <input 
                type="datetime-local" 
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              />
              <textarea 
                placeholder="বিবরণ"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26] md:col-span-2"
              />
              <select 
                value={newEvent.status}
                onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              >
                <option value="upcoming">আসছে (Upcoming)</option>
                <option value="active">চলছে (Active)</option>
                <option value="completed">শেষ হয়েছে (Completed)</option>
              </select>
              <button 
                onClick={handleAddEvent}
                className="bg-[#f27d26] hover:bg-[#ff4e00] text-white font-bold py-3 rounded-xl transition-all font-bengali"
              >
                যোগ করুন
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{event.title}</h4>
                  <p className="text-sm text-white/60">{event.description}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="bg-white/10 px-2 py-1 rounded">{new Date(event.event_date).toLocaleString()}</span>
                    <span className={cn(
                      "px-2 py-1 rounded font-bold uppercase",
                      event.status === 'active' ? "bg-green-500/20 text-green-500" :
                      event.status === 'completed' ? "bg-white/10 text-white/40" :
                      "bg-blue-500/20 text-blue-500"
                    )}>{event.status}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold font-bengali mb-4">নতুন রুল যোগ করুন</h3>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="রুল লিখুন..."
                value={newRule.text}
                onChange={(e) => setNewRule({...newRule, text: e.target.value})}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              />
              <select 
                value={newRule.category}
                onChange={(e) => setNewRule({...newRule, category: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
              >
                <option value="General">সাধারণ</option>
                <option value="War">ওয়ার</option>
                <option value="Activity">অ্যাক্টিভিটি</option>
              </select>
              <button 
                onClick={handleAddRule}
                className="bg-[#f27d26] hover:bg-[#ff4e00] text-white font-bold px-6 rounded-xl transition-all font-bengali"
              >
                যোগ করুন
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-white/60">{rule.category}</span>
                  <span className="font-bengali">{rule.rule_text}</span>
                </div>
                <button 
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
