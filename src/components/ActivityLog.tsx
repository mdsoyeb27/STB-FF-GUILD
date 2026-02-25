import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { History, Clock, User, Tag, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('activity_logs')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#f27d26] animate-spin" />
      </div>
    );
  }

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'admin': return 'text-red-500 bg-red-500/10';
      case 'members': return 'text-blue-500 bg-blue-500/10';
      case 'squads': return 'text-yellow-500 bg-yellow-500/10';
      case 'slots': return 'text-purple-500 bg-purple-500/10';
      case 'accounts': return 'text-green-500 bg-green-500/10';
      case 'notices': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-white/40 bg-white/5';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-bengali">অ্যাক্টিভিটি লগ (History)</h2>
        <p className="text-white/60 font-bengali">পুরো সিস্টেমের সকল কার্যক্রমের ইতিহাস</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">সময়</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">মডিউল</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">ইউজার</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">অ্যাকশন</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase font-bengali">বিস্তারিত</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20 font-bengali">
                    কোনো ইতিহাস পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/60 text-xs">
                        <Clock size={14} />
                        {new Date(log.created_at).toLocaleString('bn-BD')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", getModuleColor(log.module))}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-white/20" />
                        <span className="text-sm">{log.profiles?.full_name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-[#f27d26]" />
                        <span className="text-sm font-bengali">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-white/40 font-mono truncate max-w-[200px]">
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
