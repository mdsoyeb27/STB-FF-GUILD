import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Globe, Shield, Send, User, Crown, Loader2, ShieldAlert } from 'lucide-react';
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
  const [activeChat, setActiveChat] = useState<'global' | 'squad' | 'rules'>('global');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('member');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data) setUserRole(data.role);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!supabase) return;
      setLoading(true);
      
      let query = supabase
        .from('messages')
        .select('*, sender:sender_id(full_name, role)')
        .order('created_at', { ascending: true });

      if (activeChat === 'squad') {
        query = query.eq('channel', 'squad');
      } else if (activeChat === 'rules') {
        query = query.eq('channel', 'rules');
      } else {
        query = query.eq('channel', 'global');
      }

      const { data, error } = await query;
      
      if (data) {
        setMessages(data.map((m: any) => ({
          id: m.id,
          sender_name: m.sender?.full_name || 'Unknown',
          content: m.content,
          created_at: m.created_at,
          is_me: false, // We'll update this in a second pass or just check sender_id
          sender_id: m.sender_id,
          role: m.sender?.role || 'member'
        })));

        // Update is_me
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setMessages(prev => prev.map(m => ({ ...m, is_me: m.sender_id === user.id })));
        }
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

      // Check if user can post in rules
      if (activeChat === 'rules' && !['super_admin', 'sub_admin'].includes(userRole)) {
        alert('শুধুমাত্র এডমিনরা রুলস চ্যানেলে মেসেজ দিতে পারবে');
        return;
      }

      let squadId = null;
      if (activeChat === 'squad') {
        const { data } = await supabase.from('profiles').select('squad_id').eq('id', userData.user.id).single();
        squadId = data?.squad_id;
        if (!squadId) {
          alert('আপনি কোনো স্কোয়াডে নেই');
          return;
        }
      }

      const { error } = await supabase.from('messages').insert({
        content: message,
        sender_id: userData.user.id,
        squad_id: squadId,
        channel: activeChat
      });

      if (error) throw error;
      setMessage('');
      
      // Refresh messages (duplicate logic, could be refactored)
      let query = supabase
        .from('messages')
        .select('*, sender:sender_id(full_name, role)')
        .order('created_at', { ascending: true });

      if (activeChat === 'squad') {
        query = query.eq('channel', 'squad');
      } else if (activeChat === 'rules') {
        query = query.eq('channel', 'rules');
      } else {
        query = query.eq('channel', 'global');
      }

      const { data } = await query;
      if (data) {
        setMessages(data.map((m: any) => ({
          id: m.id,
          sender_name: m.sender?.full_name || 'Unknown',
          content: m.content,
          created_at: m.created_at,
          is_me: m.sender_id === userData.user.id,
          sender_id: m.sender_id,
          role: m.sender?.role || 'member'
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
            গ্লোবাল
          </button>
          <button 
            onClick={() => setActiveChat('squad')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all flex items-center gap-2",
              activeChat === 'squad' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-white/40 hover:text-white"
            )}
          >
            <Shield size={16} />
            টিম
          </button>
          <button 
            onClick={() => setActiveChat('rules')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold font-bengali transition-all flex items-center gap-2",
              activeChat === 'rules' ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : "text-white/40 hover:text-white"
            )}
          >
            <ShieldAlert size={16} />
            রুলস
          </button>
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              activeChat === 'global' ? "bg-[#f27d26]/20 text-[#f27d26]" :
              activeChat === 'squad' ? "bg-red-500/20 text-red-500" :
              "bg-yellow-500/20 text-yellow-500"
            )}>
              {activeChat === 'global' ? <Globe size={20} /> : 
               activeChat === 'squad' ? <Shield size={20} /> :
               <ShieldAlert size={20} />}
            </div>
            <div>
              <h3 className="font-bold font-bengali">
                {activeChat === 'global' ? 'গ্লোবাল চ্যাট বক্স' : 
                 activeChat === 'squad' ? 'টিম চ্যাট বক্স (গোপন)' :
                 'গিল্ড রুলস ও নোটিশ'}
              </h3>
              <p className="text-[10px] text-white/40 font-bengali">
                {activeChat === 'global' ? 'গিল্ডের সবাই এই মেসেজ দেখতে পাবে' : 
                 activeChat === 'squad' ? 'শুধুমাত্র আপনার স্কোয়াড মেম্বাররা দেখতে পাবে' :
                 'শুধুমাত্র এডমিনরা এখানে মেসেজ দিতে পারবে'}
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
