import React, { useState } from 'react';
import { Menu, Send } from 'lucide-react';
import { TabType } from './types';
import Sidebar from './components/Sidebar';
import HandicapCalculator from './components/HandicapCalculator';
import GoalsCalculator from './components/GoalsCalculator';
import EvCalculator from './components/EvCalculator';
import KellyCalculator from './components/KellyCalculator';
import SurebetCalculator from './components/SurebetCalculator';
import AverageOddCalculator from './components/AverageOddCalculator';
import InfoButton from './components/InfoButton';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('handicap');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'handicap':
        return <HandicapCalculator />;
      case 'goals':
        return <GoalsCalculator />;
      case 'ev':
        return <EvCalculator />;
      case 'kelly':
        return <KellyCalculator />;
      case 'surebet':
        return <SurebetCalculator />;
      case 'average':
        return <AverageOddCalculator />;
      default:
        return <HandicapCalculator />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-slate-700 bg-slate-800 z-10">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-slate-300 hover:text-white p-2"
            >
                <Menu size={24} />
            </button>
            <h1 className="ml-4 text-lg font-bold text-white">Handicap.com.br</h1>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            <div className="max-w-5xl mx-auto py-4">
                {renderContent()}
            </div>
            
            {/* Social Footer */}
            <div className="mt-12 text-center border-t border-slate-800 pt-8 pb-4">
                <a 
                    href="https://t.me/gilbertoneto16" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors"
                >
                    <Send size={16} />
                    <span>@gilbertoneto16</span>
                </a>
            </div>
        </main>
      </div>

      <InfoButton />
    </div>
  );
};

export default App;