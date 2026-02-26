import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ShieldAlert, UserPlus, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase কনফিগার করা হয়নি। দয়া করে আপনার .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY সেট করুন।');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;
        
        if (data.session) {
          // User is logged in immediately (email confirmation disabled)
          onSuccess();
        } else {
          alert('রেজিস্ট্রেশন সফল! আপনার ইমেইল ভেরিফাই করুন (যদি প্রয়োজন হয়) অথবা লগইন করুন।');
          setMode('login');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#f27d26]/20 rounded-2xl flex items-center justify-center mx-auto text-[#f27d26] mb-4">
            {mode === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h2 className="text-2xl font-bold font-bengali">
            {mode === 'login' ? 'লগইন করুন' : 'রেজিস্ট্রেশন করুন'}
          </h2>
          <p className="text-white/40 text-sm font-bengali">
            {mode === 'login' ? 'আপনার জিমেইল এবং পাসওয়ার্ড দিয়ে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm font-bengali">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm text-white/60 font-bengali ml-1">পুরো নাম</label>
                <div className="relative">
                  <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#f27d26] transition-colors"
                    placeholder="আপনার নাম"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-white/60 font-bengali ml-1">ইমেইল (Gmail)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#f27d26] transition-colors"
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60 font-bengali ml-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#f27d26] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#f27d26] hover:bg-[#ff4e00] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-bengali"
          >
            {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'লগইন' : 'রেজিস্ট্রেশন')}
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-[#f27d26] hover:underline font-bengali"
            >
              {mode === 'login' ? 'নতুন অ্যাকাউন্ট তৈরি করতে চান? রেজিস্ট্রেশন করুন' : 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
