import React from 'react';
import { Target, Zap, Shield, TrendingUp, Search } from 'lucide-react';

export const WeaponStats: React.FC = () => {
  const weapons = [
    { name: 'M1887', type: 'Shotgun', damage: 100, range: 20, speed: 40, accuracy: 10 },
    { name: 'MP40', type: 'SMG', damage: 48, range: 22, speed: 83, accuracy: 17 },
    { name: 'AK47', type: 'AR', damage: 61, range: 72, speed: 56, accuracy: 41 },
    { name: 'AWM', type: 'Sniper', damage: 90, range: 91, speed: 27, accuracy: 90 },
    { name: 'SCAR', type: 'AR', damage: 53, range: 60, speed: 61, accuracy: 42 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-bengali">অস্ত্রের পরিসংখ্যান (Weapon Stats)</h2>
          <p className="text-white/60 font-bengali">ফ্রী ফায়ার গেমের সেরা অস্ত্রগুলোর বিস্তারিত তথ্য</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="অস্ত্রের নাম..." 
            className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2 focus:outline-none focus:border-[#f27d26] text-sm font-bengali"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weapons.map((weapon, i) => (
          <div key={i} className="glass-card p-6 border-white/5 hover:border-[#f27d26]/30 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black italic text-[#f27d26]">{weapon.name}</h3>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{weapon.type}</span>
            </div>

            <div className="space-y-4">
              <StatBar label="Damage" value={weapon.damage} />
              <StatBar label="Range" value={weapon.range} />
              <StatBar label="Rate of Fire" value={weapon.speed} />
              <StatBar label="Accuracy" value={weapon.accuracy} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
      <span className="text-white/40">{label}</span>
      <span className="text-[#f27d26]">{value}</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-[#f27d26] to-[#ff4e00] rounded-full"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);
