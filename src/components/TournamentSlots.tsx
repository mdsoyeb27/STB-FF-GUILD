import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, CheckCircle2, Clock, XCircle, Users, Plus, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Slot {
  id: string;
  tournament_name: string;
  slot_number: number;
  booked_by: string;
  payment_status: 'pending' | 'verified' | 'rejected';
  is_external_player: boolean;
  profiles?: { full_name: string };
}

export const TournamentSlots: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('tournament_slots')
        .select('*, profiles(full_name)')
        .order('slot_number', { ascending: true });
      if (data) setSlots(data as any);
      setLoading(false);
    };
    fetchSlots();
  }, []);

  const handleBookSlot = async () => {
    if (!supabase) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('লগইন করুন');

      const slotNumber = slots.length + 1;
      const { error } = await supabase.from('tournament_slots').insert({
        tournament_name: 'STB Weekly Cup',
        slot_number: slotNumber,
        booked_by: userData.user.id,
        payment_status: 'pending'
      });

      if (error) throw error;

      // Log
      await supabase.from('activity_logs').insert({
        module: 'slots',
        action: 'স্লট বুকিং',
        details: { slotNumber }
      });

      alert('স্লট বুকিং রিকোয়েস্ট পাঠানো হয়েছে!');
      // Refresh
      const { data } = await supabase.from('tournament_slots').select('*, profiles(full_name)').order('slot_number', { ascending: true });
      if (data) setSlots(data as any);
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-bengali">টুর্নামেন্ট স্লট বুকিং</h2>
          <p className="text-white/60 font-bengali">চলমান টুর্নামেন্টের স্লট বুক করুন এবং স্ট্যাটাস দেখুন</p>
        </div>
        <button 
          onClick={handleBookSlot}
          className="bg-[#f27d26] hover:bg-[#ff4e00] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all font-bengali"
        >
          <Plus size={20} />
          নতুন স্লট বুক করুন
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => (
          <div key={slot.id} className="glass-card p-6 relative overflow-hidden group">
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rotate-12 opacity-10 transition-transform group-hover:scale-110",
              slot.payment_status === 'verified' ? "text-green-500" : "text-white"
            )}>
              <Trophy size={96} />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-bold text-xl border border-white/10">
                {slot.slot_number}
              </div>
              <div>
                <h3 className="font-bold text-lg">{slot.tournament_name}</h3>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Users size={12} />
                  <span className="font-bengali">{slot.is_external_player ? 'বহিরাগত প্লেয়ার' : 'গিল্ড মেম্বার'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60 font-bengali">বুক করেছেন:</span>
                <span className="font-medium">{slot.profiles?.full_name || 'অজানা'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-bengali">পেমেন্ট স্ট্যাটাস:</span>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-bengali",
                  slot.payment_status === 'verified' && "bg-green-500/10 text-green-500",
                  slot.payment_status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                  slot.payment_status === 'rejected' && "bg-red-500/10 text-red-500",
                )}>
                  {slot.payment_status === 'verified' && <CheckCircle2 size={14} />}
                  {slot.payment_status === 'pending' && <Clock size={14} />}
                  {slot.payment_status === 'rejected' && <XCircle size={14} />}
                  {slot.payment_status === 'verified' && 'ভেরিফাইড'}
                  {slot.payment_status === 'pending' && 'পেন্ডিং'}
                  {slot.payment_status === 'rejected' && 'বাতিল'}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
              <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors font-bengali">
                বিস্তারিত
              </button>
              {slot.payment_status === 'pending' && (
                <button className="flex-1 bg-[#f27d26]/10 hover:bg-[#f27d26]/20 text-[#f27d26] py-2 rounded-lg text-sm font-bold transition-colors font-bengali">
                  পেমেন্ট করুন
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
