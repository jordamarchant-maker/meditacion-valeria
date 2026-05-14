import React from 'react';
import { Sparkles, Headphones, Key } from 'lucide-react';

interface HeaderProps {
  onOpenKeysModal: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenKeysModal, hasApiKey }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* App Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl shadow-lg shadow-teal-500/20 text-slate-950">
            <Headphones className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-serif flex items-center gap-2 text-white">
              ZenVoice <span className="text-xs font-sans tracking-widest uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">Studio</span>
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Conversor de Rutinas de Meditación a Voz Suave & Descargable
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 text-xs text-slate-300 border border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Español Latino Activo</span>
          </div>

          <button
            onClick={onOpenKeysModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              hasApiKey
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Configurar claves de API opcionales"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasApiKey ? 'ElevenLabs Premium: Activado' : 'API Premium (Opcional)'}</span>
            {!hasApiKey && <Sparkles className="w-3 h-3 text-amber-400" />}
          </button>
        </div>

      </div>
    </header>
  );
};
