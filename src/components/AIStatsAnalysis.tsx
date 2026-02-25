import React, { useState } from 'react';
import { analyzePlayerStats, AIAnalysisResult } from '../services/geminiService';
import { BarChart3, Loader2, Send, Trophy, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AIStatsAnalysis: React.FC = () => {
  const [stats, setStats] = useState({
    kdRatio: 2.5,
    winRate: 15,
    headshotRate: 35
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const analysis = await analyzePlayerStats(stats);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-bengali">প্লেয়ার পারফরম্যান্স বিশ্লেষণ</h2>
          <p className="text-white/60 font-bengali">Gemini AI ব্যবহার করে আপনার গেমপ্লে স্ট্যাটস বিশ্লেষণ করুন</p>
        </div>
        <BarChart3 className="text-[#f27d26]" size={32} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-lg font-semibold font-bengali mb-4">আপনার স্ট্যাটস ইনপুট দিন</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2 font-bengali">K/D Ratio</label>
              <input 
                type="number" 
                step="0.1"
                value={stats.kdRatio}
                onChange={(e) => setStats({...stats, kdRatio: parseFloat(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2 font-bengali">Win Rate (%)</label>
              <input 
                type="number" 
                value={stats.winRate}
                onChange={(e) => setStats({...stats, winRate: parseFloat(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2 font-bengali">Headshot Rate (%)</label>
              <input 
                type="number" 
                value={stats.headshotRate}
                onChange={(e) => setStats({...stats, headshotRate: parseFloat(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f27d26] transition-colors"
              />
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-[#f27d26] hover:bg-[#ff4e00] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bengali"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
            বিশ্লেষণ শুরু করুন
          </button>
        </div>

        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold font-bengali mb-4">AI বিশ্লেষণ ফলাফল</h3>
          
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col gap-6"
              >
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-[#f27d26] flex items-center justify-center text-6xl font-black text-[#f27d26] shadow-[0_0_30px_rgba(242,125,38,0.3)]">
                      {result.grade}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Grade
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <p className="text-lg leading-relaxed font-bengali text-white/90 italic">
                    "{result.summary}"
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <Trophy className="mx-auto mb-2 text-yellow-500" size={20} />
                    <div className="text-xs text-white/40 font-bengali">উইন রেট</div>
                    <div className="font-bold">{stats.winRate}%</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <Target className="mx-auto mb-2 text-red-500" size={20} />
                    <div className="text-xs text-white/40 font-bengali">হেডশট</div>
                    <div className="font-bold">{stats.headshotRate}%</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <Zap className="mx-auto mb-2 text-blue-500" size={20} />
                    <div className="text-xs text-white/40 font-bengali">K/D</div>
                    <div className="font-bold">{stats.kdRatio}</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                <BarChart3 size={64} className="mb-4 opacity-20" />
                <p className="font-bengali">বিশ্লেষণ শুরু করতে বাম পাশের ফর্মটি পূরণ করুন</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
