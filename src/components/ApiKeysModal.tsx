import React, { useState } from 'react';
import { Key, ShieldCheck, X, Sparkles, HelpCircle } from 'lucide-react';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(tempKey.trim());
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Configuración de Voces Premium (Opcional)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Motor Gratuito Incluido:</strong> Tu aplicación ya está lista para usar voces gratuitas en la Nube y de Navegador ilimitadamente sin configurar nada. Si deseas voces con realismo premium humanoide (ElevenLabs), ingresa tu clave personal abajo.
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Clave de ElevenLabs (API Key)</span>
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <HelpCircle className="w-3 h-3" />
                <span>¿Obtener clave gratis?</span>
              </a>
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk_..."
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-slate-600"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Tu clave solo se guarda en la memoria local de tu navegador durante esta sesión y no se transfiere a ningún otro servidor externo.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conexión cifrada</span>
            </div>

            <div className="flex items-center gap-2">
              {tempKey && (
                <button
                  type="button"
                  onClick={() => {
                    setTempKey('');
                    onSaveApiKey('');
                  }}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-rose-400"
                >
                  Limpiar
                </button>
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
              >
                {showSavedToast ? '¡Guardada!' : 'Guardar y Activar'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
