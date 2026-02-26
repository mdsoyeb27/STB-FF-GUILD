import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { AIStatsAnalysis } from './components/AIStatsAnalysis';
import { TournamentSlots } from './components/TournamentSlots';
import { SquadBuilder } from './components/SquadBuilder';
import { MemberList } from './components/MemberList';
import { CommunicationHub } from './components/CommunicationHub';
import { Accounts } from './components/Accounts';
import { AdminPanel } from './components/AdminPanel';
import { NoticeBoard } from './components/NoticeBoard';
import { TournamentBrackets } from './components/TournamentBrackets';
import { WeaponStats } from './components/WeaponStats';
import { ActivityLog } from './components/ActivityLog';
import { Auth } from './components/Auth';
import { Menu, Bell, Search, User, ShieldCheck, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setUserRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (data) setUserRole(data.role);
  };

  const isAdmin = userRole === 'super_admin' || userRole === 'sub_admin';

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserRole(null);
    setActiveTab('overview');
    setIsProfileOpen(false);
    setIsAuthOpen(false);
  };

  const renderContent = () => {
    if (isAuthOpen && !session) {
      return <Auth onSuccess={() => setIsAuthOpen(false)} />;
    }

    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'members':
        return <MemberList />;
      case 'squads':
        return <SquadBuilder />;
      case 'slots':
        return <TournamentSlots />;
      case 'brackets':
        return <TournamentBrackets />;
      case 'accounts':
        return <Accounts />;
      case 'chat':
        return <CommunicationHub />;
      case 'stats':
        return <AIStatsAnalysis />;
      case 'weapons':
        return <WeaponStats />;
      case 'notice':
        return <NoticeBoard />;
      case 'history':
        return <ActivityLog />;
      case 'admin_panel':
      case 'roles':
        return userRole === 'super_admin' ? (
          <AdminPanel onVisitWebsite={() => setActiveTab('overview')} />
        ) : (
          <DashboardOverview />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-white/20">
            <h2 className="text-4xl font-bold font-bengali mb-4">শীঘ্রই আসছে</h2>
            <p className="font-bengali">এই বিভাগটি বর্তমানে উন্নয়নের কাজ চলছে</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#f27d26]/30 flex overflow-hidden">
      <div className={cn(
        "hidden lg:flex flex-col w-64 bg-[#151619] border-r border-white/5 h-screen sticky top-0 transition-all duration-300",
        isAdmin && "border-r-[#f27d26]/20 bg-[#0d0e10]"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg",
              isAdmin ? "bg-[#f27d26] shadow-[#f27d26]/20" : "bg-white/5 border border-white/10"
            )}>S</div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">STB FF GUILD</h1>
              <div className="text-[10px] text-[#f27d26] font-bold uppercase tracking-widest">
                {isAdmin ? 'Admin Dashboard' : 'Member Portal'}
              </div>
            </div>
          </div>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen} 
            onLogout={handleLogout}
          />
        </div>
      </div>

      <main className="flex-1 h-screen overflow-y-auto relative flex flex-col">
        {/* Header */}
        <header className={cn(
          "h-20 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between transition-colors shrink-0",
          isAdmin && "border-b-[#f27d26]/10 bg-[#0d0e10]/80"
        )}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-64 lg:w-96">
              <Search size={18} className="text-white/40" />
              <input 
                type="text" 
                placeholder="সার্চ করুন..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full font-bengali"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userRole ? (
              <>
                {userRole === 'super_admin' && (
                  <button 
                    onClick={() => setActiveTab('admin_panel')}
                    className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl border border-red-500/20 text-xs font-bold font-bengali"
                  >
                    <ShieldCheck size={16} />
                    এডমিন প্যানেল
                  </button>
                )}
                <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Bell size={20} className="text-white/60" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#f27d26] rounded-full border-2 border-[#0a0a0a]"></span>
                </button>
                <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors group"
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold leading-none">{session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0]}</div>
                      <div className="text-[10px] text-[#f27d26] font-bold uppercase tracking-wider mt-1">
                        {userRole === 'super_admin' ? 'Super Admin' : userRole === 'sub_admin' ? 'Sub Admin' : userRole || 'Member'}
                      </div>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-full p-[2px]",
                      isAdmin ? "bg-gradient-to-tr from-[#f27d26] to-[#ff4e00]" : "bg-white/10"
                    )}>
                      <div className="w-full h-full rounded-full bg-[#151619] flex items-center justify-center overflow-hidden">
                        {session?.user?.user_metadata?.avatar_url ? (
                          <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-white/60" />
                        )}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-[#151619] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-2">
                          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bengali hover:bg-white/5 rounded-xl transition-colors">
                            <User size={18} className="text-white/40" />
                            প্রোফাইল
                          </button>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bengali hover:bg-red-500/10 text-red-500 rounded-xl transition-colors"
                          >
                            <ShieldCheck size={18} />
                            লগ আউট
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-2 text-sm font-bold font-bengali text-white/60 hover:text-white transition-colors"
                >
                  লগইন
                </button>
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-[#f27d26] hover:bg-[#ff4e00] text-white px-6 py-2 rounded-xl text-sm font-bold font-bengali transition-all shadow-lg shadow-[#f27d26]/20"
                >
                  রেজিস্ট্রেশন
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className={cn(
          "p-6 lg:p-10 flex-1",
          isAdmin && "bg-[#0d0e10]"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with Hidden Admin Link */}
        <footer className="p-8 border-t border-white/5 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-white/20 text-xs font-bengali">
            <span>গোপনীয়তা নীতি</span>
            <span>শর্তাবলী</span>
            <span>যোগাযোগ</span>
          </div>
          <div className="text-white/10 text-[10px] font-bengali flex items-center gap-2">
            &copy; ২০২৬ STB FF GUILD. সর্বস্বত্ব সংরক্ষিত।
            {/* Hidden Admin Link - Subtle dot */}
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="w-1 h-1 bg-white/5 rounded-full hover:bg-[#f27d26] transition-colors cursor-default"
              title="Admin Access"
            />
          </div>
        </footer>
      </main>
    </div>
  );
}
