import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Search, Filter, MoreVertical, Ban, UserCheck, Loader2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Profile } from '../types';

export const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('profiles').select('*');
      if (data) setMembers(data as Profile[]);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    if (!supabase) return;
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);
      
      if (error) throw error;

      setMembers(members.map(m => m.id === userId ? { ...m, status: newStatus as any } : m));

      // Log activity
      await supabase.from('activity_logs').insert({
        module: 'members',
        action: `সদস্য ${newStatus === 'active' ? 'আনব্যান' : 'ব্যান'} করা হয়েছে`,
        details: { userId }
      });
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ full_name: '', game_id: '', role: 'member' });

  const handleAddMember = async () => {
    if (!supabase) {
      alert('Supabase is not configured!');
      return;
    }
    if (!newMember.full_name || !newMember.game_id) {
      alert('সবগুলো ঘর পূরণ করুন!');
      return;
    }
    
    try {
      // 1. Insert the new member
      const { data, error } = await supabase.from('profiles').insert({
        full_name: newMember.full_name,
        game_id: newMember.game_id,
        role: newMember.role,
        status: 'active'
      }).select();

      if (error) {
        console.error('Error adding member:', error);
        throw error;
      }
      
      // 2. Log activity
      await supabase.from('activity_logs').insert({
        module: 'members',
        action: 'নতুন সদস্য যোগ',
        details: { name: newMember.full_name, added_by: 'admin' }
      });

      alert('সদস্য সফলভাবে যোগ করা হয়েছে!');
      setShowAddModal(false);
      setNewMember({ full_name: '', game_id: '', role: 'member' });
      
      // 3. Refresh list
      const { data: updatedList } = await supabase.from('profiles').select('*');
      if (updatedList) setMembers(updatedList as Profile[]);
      
    } catch (err: any) {
      console.error('Full error object:', err);
      alert('ত্রুটি: ' + (err.message || 'অজানা সমস্যা'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#f27d26] animate-spin" />
      </div>
    );
  }
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'sub_admin': return 'bg-[#f27d26]/10 text-[#f27d26] border-[#f27d26]/20';
      case 'leader': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'সুপার এডমিন';
      case 'sub_admin': return 'সহকারী এডমিন';
      case 'leader': return 'টিম লিডার';
      default: return 'সদস্য';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-bengali">সদস্য ব্যবস্থাপনা</h2>
          <p className="text-white/60 font-bengali">গিল্ডের সকল সদস্যের তালিকা এবং নিয়ন্ত্রণ</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#f27d26] hover:bg-[#ff4e00] text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all font-bengali"
        >
          <UserPlus size={20} />
          নতুন সদস্য যোগ করুন
        </button>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="glass-card w-full max-w-md p-8 space-y-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <XCircle size={24} />
            </button>
            <h3 className="text-2xl font-bold font-bengali">নতুন সদস্য যোগ করুন</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">পুরো নাম</label>
                <input 
                  type="text" 
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
                  placeholder="সদস্যের নাম"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">গেম আইডি</label>
                <input 
                  type="text" 
                  value={newMember.game_id}
                  onChange={(e) => setNewMember({...newMember, game_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
                  placeholder="গেম আইডি"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">রোল</label>
                <select 
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26] appearance-none"
                >
                  <option value="member">সদস্য</option>
                  <option value="leader">টিম লিডার</option>
                  <option value="sub_admin">সহকারী এডমিন</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleAddMember}
              className="w-full bg-[#f27d26] hover:bg-[#ff4e00] text-white font-bold py-4 rounded-xl transition-all font-bengali"
            >
              সদস্য যোগ করুন
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="সদস্য খুঁজুন (নাম বা আইডি)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#f27d26] transition-colors font-bengali"
          />
        </div>
        <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors font-bengali">
          <Filter size={18} />
          ফিল্টার
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">সদস্য</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">গেম আইডি</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">রোল</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">স্কোয়াড</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase text-right font-bengali">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#f27d26]">
                        {member.full_name[0]}
                      </div>
                      <div className="font-medium">{member.full_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-white/60">
                    {member.game_id}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold border font-bengali",
                      getRoleBadge(member.role)
                    )}>
                      {getRoleLabel(member.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/40 font-bengali">
                    {member.squad_id || 'নেই'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        member.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      )} />
                      <span className="text-xs font-bengali">{member.status === 'active' ? 'অ্যাক্টিভ' : 'ব্যানড'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {member.role !== 'super_admin' && (
                        <>
                          <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                            {member.status === 'active' ? <Ban size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </>
                      )}
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
