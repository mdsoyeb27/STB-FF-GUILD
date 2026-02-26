import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Swords, Target, Star, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Match {
  id: string;
  tournament_name: string;
  match_type: string;
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
  winner: string;
  match_date: string;
  mvp: string;
}

export const TournamentBrackets: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('match_results')
        .select('*')
        .order('match_date', { ascending: false });
      if (data) setMatches(data as Match[]);
      setLoading(false);
    };
    fetchMatches();
  }, []);

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
          <h2 className="text-3xl font-bold font-bengali">টুর্নামেন্ট ব্র্যাকেট ও রেজাল্ট</h2>
          <p className="text-white/60 font-bengali">সাম্প্রতিক ম্যাচের ফলাফল এবং আগামী ম্যাচের সময়সূচী</p>
        </div>
        <div className="flex items-center gap-2 bg-[#f27d26]/10 text-[#f27d26] px-4 py-2 rounded-xl border border-[#f27d26]/20 font-bold text-sm">
          <Trophy size={18} />
          <span>Live Tournament</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Match History */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-bengali flex items-center gap-2">
            <Swords className="text-[#f27d26]" />
            সাম্প্রতিক ম্যাচসমূহ
          </h3>
          
          <div className="space-y-4">
            {matches.length > 0 ? (
              matches.map((match) => (
                <div key={match.id} className="glass-card p-6 border-white/5 hover:border-[#f27d26]/30 transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{match.match_type}</span>
                    <span className="text-[10px] text-[#f27d26] font-bold">{new Date(match.match_date).toLocaleDateString('bn-BD')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-center space-y-2">
                      <div className="w-12 h-12 bg-white/5 rounded-full mx-auto flex items-center justify-center border border-white/10 group-hover:border-[#f27d26]/50 transition-colors">
                        <Target size={24} className="text-white/60" />
                      </div>
                      <div className="font-bold text-sm truncate">{match.team_a}</div>
                      <div className={cn(
                        "text-2xl font-black",
                        match.score_a > match.score_b ? "text-[#f27d26]" : "text-white/40"
                      )}>{match.score_a}</div>
                    </div>

                    <div className="text-xl font-black text-white/10 italic">VS</div>

                    <div className="flex-1 text-center space-y-2">
                      <div className="w-12 h-12 bg-white/5 rounded-full mx-auto flex items-center justify-center border border-white/10 group-hover:border-[#f27d26]/50 transition-colors">
                        <Target size={24} className="text-white/60" />
                      </div>
                      <div className="font-bold text-sm truncate">{match.team_b}</div>
                      <div className={cn(
                        "text-2xl font-black",
                        match.score_b > match.score_a ? "text-[#f27d26]" : "text-white/40"
                      )}>{match.score_b}</div>
                    </div>
                  </div>

                  {match.mvp && (
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-white/40 font-bengali">MVP:</span>
                      <span className="font-bold text-yellow-500">{match.mvp}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-card p-12 text-center text-white/20 font-bengali">
                কোনো ম্যাচের ফলাফল পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>

        {/* Tournament Info / Brackets Mockup */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-bengali flex items-center gap-2">
            <Trophy className="text-[#f27d26]" />
            টুর্নামেন্ট প্রগ্রেস
          </h3>

          <div className="glass-card p-8 space-y-8">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-white/5"></div>
              
              <div className="space-y-12">
                {[
                  { stage: 'ফাইনাল', team: 'STB Elite vs Team X', status: 'Upcoming', date: '২৭ ফেব্রুয়ারি' },
                  { stage: 'সেমি-ফাইনাল ১', team: 'STB Elite (Winner)', status: 'Completed', date: '২৪ ফেব্রুয়ারি' },
                  { stage: 'সেমি-ফাইনাল ২', team: 'Team X (Winner)', status: 'Completed', date: '২৪ ফেব্রুয়ারি' },
                  { stage: 'কোয়ার্টার ফাইনাল', team: '৮টি টিম অংশগ্রহণ করেছে', status: 'Completed', date: '২২ ফেব্রুয়ারি' },
                ].map((item, i) => (
                  <div key={i} className="relative pl-10">
                    <div className={cn(
                      "absolute left-[11px] top-1 w-3 h-3 rounded-full border-2 border-[#151619]",
                      item.status === 'Upcoming' ? "bg-[#f27d26] shadow-[0_0_10px_#f27d26]" : "bg-white/20"
                    )}></div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-[#f27d26] uppercase tracking-widest">{item.stage}</div>
                      <div className="font-bold">{item.team}</div>
                      <div className="text-xs text-white/40 font-bengali">{item.date} • {item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all font-bengali">
              সম্পূর্ণ ব্র্যাকেট দেখুন
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
