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
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'roles'>('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      
      const [settings, profiles] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('profiles').select('*')
      ]);

      if (settings.data) {
        setSiteSettings({
          siteName: settings.data.site_name,
          logoUrl: settings.data.logo_url || '',
          bannerUrl: settings.data.banner_url || '',
          themeColor: settings.data.theme_color || '#f27d26'
        });
      }

      if (profiles.data) {
        setUsers(profiles.data as Profile[]);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

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
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveSubTab('settings')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all",
              activeSubTab === 'settings' ? "bg-[#f27d26] text-white" : "text-white/40 hover:text-white"
            )}
          >
            সাইট সেটিংস
          </button>
          <button 
            onClick={() => setActiveSubTab('roles')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all",
              activeSubTab === 'roles' ? "bg-[#f27d26] text-white" : "text-white/40 hover:text-white"
            )}
          >
            রোল ম্যানেজার
          </button>
        </div>
      </div>

      {activeSubTab === 'settings' ? (
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
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Role Manager Content - Reusing the existing user table logic */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="font-bold font-bengali flex items-center gap-2">
                <Users size={20} className="text-[#f27d26]" />
                কাস্টম পারমিশন (Role Manager)
              </h3>
              <button className="text-xs font-bold text-[#f27d26] font-bengali">নতুন রোল যোগ করুন</button>
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
    </div>
  );
};
