import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Plus, Trash2, Edit3, Users as UsersIcon, Crown, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Squad, Profile } from '../types';

export const SquadBuilder: React.FC = () => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSquads = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('squads').select('*');
      if (data) setSquads(data as Squad[]);
      setLoading(false);
    };
    fetchSquads();
  }, []);

  const [newSquadName, setNewSquadName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCreateSquad = async () => {
    if (!supabase || !newSquadName.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('squads')
        .insert({ squad_name: newSquadName })
        .select()
        .single();
      
      if (error) throw error;

      if (data) setSquads([...squads, data as Squad]);
      setNewSquadName('');

      // Log activity
      await supabase.from('activity_logs').insert({
        module: 'squads',
        action: 'নতুন স্কোয়াড তৈরি',
        details: { squadName: newSquadName }
      });

      alert('স্কোয়াড সফলভাবে তৈরি হয়েছে!');
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setCreating(false);
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
          <h2 className="text-3xl font-bold font-bengali">স্কোয়াড বিল্ডার</h2>
          <p className="text-white/60 font-bengali">৪-৫ জনের টিম তৈরি করুন এবং লিডার নিয়োগ দিন</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#f27d26] hover:bg-[#ff4e00] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all font-bengali"
        >
          <Plus size={20} />
          নতুন স্কোয়াড তৈরি করুন
        </button>
      </div>

      {/* Create Squad Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="glass-card w-full max-w-md p-8 space-y-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <Trash2 size={24} />
            </button>
            <h3 className="text-2xl font-bold font-bengali">নতুন স্কোয়াড তৈরি করুন</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2 font-bengali">স্কোয়াড নাম</label>
                <input 
                  type="text" 
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26]"
                  placeholder="স্কোয়াডের নাম লিখুন"
                />
              </div>
            </div>

            <button 
              onClick={handleCreateSquad}
              disabled={creating}
              className="w-full bg-[#f27d26] hover:bg-[#ff4e00] text-white font-bold py-4 rounded-xl transition-all font-bengali disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin mx-auto" /> : 'স্কোয়াড তৈরি করুন'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {squads.map((squad) => (
          <div key={squad.id} className="glass-card p-6 relative overflow-hidden group border-white/5 hover:border-[#f27d26]/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={80} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#f27d26]">{squad.squad_name}</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#f27d26]/20 flex items-center justify-center text-[#f27d26]">
                  <Crown size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-white/40 font-bengali">টিম লিডার আইডি</div>
                  <div className="text-sm font-bold">
                    {squad.leader_id || 'নিযুক্ত নেই'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-white/60">
                  <UsersIcon size={16} />
                  <span className="text-sm font-bengali">{squad.members_count} জন সদস্য</span>
                </div>
                <button className="text-xs font-bold text-[#f27d26] hover:underline font-bengali">
                  সদস্যদের দেখুন
                </button>
              </div>

              <div className="flex -space-x-2 pt-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#151619] bg-white/10 flex items-center justify-center text-[10px] font-bold">
                    U{i}
                  </div>
                ))}
                {squad.members_count > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-[#151619] bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                    +{squad.members_count - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
