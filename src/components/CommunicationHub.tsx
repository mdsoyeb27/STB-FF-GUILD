import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Globe, Shield, Send, User, Crown, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatMessage {
  id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_me: boolean;
  role: string;
}

export const CommunicationHub: React.FC = () => {
  const [activeChat, setActiveChat] = useState<'global' | 'squad'>('global');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!supabase) return;
      setLoading(true);
      
      let query = supabase
        .from('messages')
        .select('*, profiles(full_name, role)')
        .order('created_at', { ascending: true });

      if (activeChat === 'squad') {
        // In a real app, we would filter by the user's squad_id
        // For now, we'll just show messages that have a squad_id
        query = query.not('squad_id', 'is', null);
      } else {
        query = query.is('squad_id', null);
      }

      const { data } = await query;
      
      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          sender_name: m.profiles?.full_name || 'Unknown',
          content: m.content,
          created_at: m.created_at,
          is_me: false,
          role: m.profiles?.role || 'member'
        })));
      }
      setLoading(false);
    };
    fetchMessages();
  }, [activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !message.trim()) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('লগইন করুন');

      const { error } = await supabase.from('messages').insert({
        content: message,
        sender_id: userData.user.id,
        squad_id: activeChat === 'squad' ? (await supabase.from('profiles').select('squad_id').eq('id', userData.user.id).single()).data?.squad_id : null
      });

      if (error) throw error;
      setMessage('');
      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(full_name, role)')
        .order('created_at', { ascending: true });
      
      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          sender_name: m.profiles?.full_name || 'Unknown',
          content: m.content,
          created_at: m.created_at,
          is_me: m.sender_id === userData.user.id,
          role: m.profiles?.role || 'member'
        })));
      }
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
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-bengali">চ্যাট হাব</h2>
          <p className="text-white/60 font-bengali">গিল্ডের সবার সাথে যোগাযোগ করুন</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveChat('global')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all flex items-center gap-2",
              activeChat === 'global' ? "bg-[#f27d26] text-white" : "text-white/40 hover:text-white"
            )}
          >
            <Globe size={16} />
            গ্লোবাল চ্যাট
          </button>
          <button 
            onClick={() => setActiveChat('squad')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all flex items-center gap-2",
              activeChat === 'squad' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-white/40 hover:text-white"
            )}
          >
            <Shield size={16} />
            টিম চ্যাট (গোপন)
          </button>
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f27d26]/20 rounded-full flex items-center justify-center text-[#f27d26]">
              {activeChat === 'global' ? <Globe size={20} /> : <Shield size={20} />}
            </div>
            <div>
              <h3 className="font-bold font-bengali">
                {activeChat === 'global' ? 'গ্লোবাল চ্যাট বক্স' : 'টিম চ্যাট বক্স (গোপন)'}
              </h3>
              <p className="text-[10px] text-white/40 font-bengali">
                {activeChat === 'global' ? 'গিল্ডের সবাই এই মেসেজ দেখতে পাবে' : 'শুধুমাত্র আপনার স্কোয়াড মেম্বাররা দেখতে পাবে'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex gap-3 max-w-[80%]",
              msg.is_me ? "ml-auto flex-row-reverse" : "mr-auto"
            )}>
              {!msg.is_me && (
                <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10">
                  <User size={20} className="text-white/40" />
                </div>
              )}
              <div className="space-y-1">
                {!msg.is_me && (
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold text-white/60">{msg.sender_name}</span>
                    {msg.role === 'super_admin' && <Crown size={12} className="text-yellow-500" />}
                  </div>
                )}
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm font-bengali leading-relaxed",
                  msg.is_me 
                    ? "bg-[#f27d26] text-white rounded-tr-none" 
                    : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                <div className={cn(
                  "text-[10px] text-white/30 px-1",
                  msg.is_me ? "text-right" : "text-left"
                )}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5">
          <div className="relative">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="আপনার মেসেজ লিখুন..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-[#f27d26] transition-colors font-bengali"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#f27d26] rounded-lg flex items-center justify-center text-white hover:bg-[#ff4e00] transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
