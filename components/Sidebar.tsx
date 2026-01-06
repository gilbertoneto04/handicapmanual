import React from 'react';
import { Calculator, Goal, Percent, TrendingUp, Scale, Layers } from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const menuItems = [
    { id: 'handicap', label: 'Handicap Manual', icon: <Calculator size={20} /> },
    { id: 'goals', label: 'Calculadora de Gols', icon: <Goal size={20} /> },
    { id: 'ev', label: 'Calculadora EV%', icon: <Percent size={20} /> },
    { id: 'kelly', label: 'Critério de Kelly', icon: <TrendingUp size={20} /> },
    { id: 'surebet', label: 'Calculadora Surebet', icon: <Scale size={20} /> },
    { id: 'average', label: 'Odd Média', icon: <Layers size={20} /> },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id as TabType);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <nav className={`
        fixed top-0 left-0 h-full bg-slate-800 border-r border-slate-700 w-64 z-30 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
      `}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Handicap.com.br
            </h1>
        </div>

        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium
                ${activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-4 text-center text-xs text-slate-500 border-t border-slate-700">
            &copy; {new Date().getFullYear()} Gilberto Neto
        </div>
      </nav>
    </>
  );
};

export default Sidebar;