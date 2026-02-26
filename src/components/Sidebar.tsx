import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Trophy, 
  Swords,
  Zap,
  Wallet, 
  Bell, 
  MessageSquare, 
  Settings, 
  BarChart3,
  LogOut,
  Menu,
  X,
  History
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'overview', label: 'হোম পেজ', icon: LayoutDashboard },
  { id: 'admin_panel', label: 'প্রধান নিয়ন্ত্রণ', icon: Settings },
  { id: 'members', label: 'সদস্য ব্যবস্থাপনা', icon: Users },
  { id: 'squads', label: 'স্কোয়াড বিল্ডার', icon: ShieldCheck },
  { id: 'slots', label: 'টুর্নামেন্ট স্লট', icon: Trophy },
  { id: 'brackets', label: 'ব্র্যাকেট ও রেজাল্ট', icon: Swords },
  { id: 'accounts', label: 'আর্থিক হিসাব', icon: Wallet },
  { id: 'notice', label: 'নোটিশ বোর্ড', icon: Bell },
  { id: 'chat', label: 'চ্যাট হাব', icon: MessageSquare },
  { id: 'stats', label: 'AI স্ট্যাটস', icon: BarChart3 },
  { id: 'weapons', label: 'অস্ত্রের তথ্য', icon: Zap },
  { id: 'history', label: 'অ্যাক্টিভিটি লগ', icon: History },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) => {
  return (
    <>
      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsOpen(false)} />

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-[#151619] border-r border-white/5 transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f27d26] rounded-lg flex items-center justify-center font-bold text-xl">S</div>
              <span className="font-bold text-lg tracking-tight">STB FF GUILD</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/60">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  activeTab === item.id 
                    ? "bg-[#f27d26] text-white shadow-lg shadow-[#f27d26]/20" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  activeTab === item.id ? "text-white" : "text-white/40 group-hover:text-white"
                )} />
                <span className="font-medium font-bengali">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium font-bengali">লগ আউট</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Navigation List (Used inside App.tsx container) */}
      <div className="hidden lg:flex flex-col h-full">
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-[#f27d26] text-white shadow-lg shadow-[#f27d26]/20" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-white" : "text-white/40 group-hover:text-white"
              )} />
              <span className="font-medium font-bengali">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 mt-4 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium font-bengali">লগ আউট</span>
          </button>
        </div>
      </div>
    </>
  );
};
