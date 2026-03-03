import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DomainWarning: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the hostname is the old vercel domain
    if (window.location.hostname === 'handicapmanual.vercel.app') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-900 px-4 py-3 shadow-lg animate-in slide-in-from-top duration-500">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="shrink-0" size={24} />
          <p className="font-medium text-sm md:text-base">
            Você está acessando uma versão antiga. Acesse o novo endereço oficial: 
            <a 
              href="https://handicap.com.br" 
              className="underline font-bold ml-1 hover:text-slate-800"
            >
              handicap.com.br
            </a>
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-amber-600/20 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default DomainWarning;
