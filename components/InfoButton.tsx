import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

const InfoButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-14 right-0 mb-2 w-80 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl text-sm text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-slate-500 hover:text-white"
            >
                <X size={16} />
            </button>
            <h4 className="font-bold text-white mb-2">Sobre a Ferramenta</h4>
            <p className="mb-2">
                Ferramenta em desenvolvimento com intuito de ajudar a comunidade.
            </p>
            <p className="mb-2">
                <strong>Tutorial:</strong> https://youtu.be/7XNyII2FYtw
            </p>
            <p>
                Qualquer dúvida/feedback, entre em contato pelo Telegram <strong>@gilbertoneto16</strong>.
            </p>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900"
      >
        <Info size={24} />
      </button>
    </div>
  );
};

export default InfoButton;