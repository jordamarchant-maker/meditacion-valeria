import React from 'react';
import { AVAILABLE_VOICES } from '../data/backgroundSounds';
import { AudioTrackConfig } from '../types';
import { Mic, UserCheck, Sliders, Volume2 } from 'lucide-react';

interface VoiceSettingsProps {
  config: AudioTrackConfig;
  onChange: (newConfig: AudioTrackConfig) => void;
  hasApiKey: boolean;
  onOpenKeysModal: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  config,
  onChange,
  hasApiKey,
  onOpenKeysModal
}) => {
  // Find currently chosen voice details
  const currentVoice = AVAILABLE_VOICES.find((v) => v.id === config.voiceId) || AVAILABLE_VOICES[0];

  // Helper to filter voices by engine or group
  const currentGender = currentVoice?.gender || 'female';

  const handleGenderChange = (gender: 'male' | 'female') => {
    // Find the first voice with this gender that matches current engine or default
    let matchingVoice = AVAILABLE_VOICES.find(
      (v) => v.gender === gender && v.engine === config.engine
    );
    if (!matchingVoice) {
      matchingVoice = AVAILABLE_VOICES.find((v) => v.gender === gender);
    }
    if (matchingVoice) {
      onChange({ ...config, voiceId: matchingVoice.id });
    }
  };

  const handleEngineChange = (engine: 'streamelements' | 'browser' | 'elevenlabs') => {
    if (engine === 'elevenlabs' && !hasApiKey) {
      onOpenKeysModal();
      return;
    }

    // Find voice matching new engine and current gender
    let newVoice = AVAILABLE_VOICES.find(
      (v) => v.engine === engine && v.gender === currentGender
    );
    if (!newVoice) {
      newVoice = AVAILABLE_VOICES.find((v) => v.engine === engine);
    }
    if (newVoice) {
      onChange({ ...config, engine, voiceId: newVoice.id });
    }
  };

  const availableVoicesForEngine = AVAILABLE_VOICES.filter((v) => v.engine === config.engine);

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow-xl flex flex-col justify-between">
      <div>
        
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-700/50">
          <Mic className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-semibold text-slate-200">Ajustes de Voz & Tono</h2>
        </div>

        {/* 1. Engine / Quality Mode Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Motor de Conversión (Español Latino)
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-700/50">
            <button
              type="button"
              onClick={() => handleEngineChange('streamelements')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                config.engine === 'streamelements'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Voces Nube MP3
            </button>
            <button
              type="button"
              onClick={() => handleEngineChange('browser')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                config.engine === 'browser'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Nativa Local
            </button>
            <button
              type="button"
              onClick={() => handleEngineChange('elevenlabs')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all relative ${
                config.engine === 'elevenlabs'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              Studio IA
              {!hasApiKey && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* 2. Gender Selection (Hombre / Mujer) */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Género de la Voz
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleGenderChange('female')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                currentGender === 'female'
                  ? 'bg-teal-500/10 border-teal-500/50 text-teal-300'
                  : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${currentGender === 'female' ? 'text-teal-400' : ''}`} />
              <span>Mujer (Voz Suave)</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenderChange('male')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                currentGender === 'male'
                  ? 'bg-teal-500/10 border-teal-500/50 text-teal-300'
                  : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${currentGender === 'male' ? 'text-teal-400' : ''}`} />
              <span>Hombre (Voz Grave)</span>
            </button>
          </div>
        </div>

        {/* 3. Specific Voice Model Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Variante de Voz
          </label>
          <select
            value={config.voiceId}
            onChange={(e) => onChange({ ...config, voiceId: e.target.value })}
            className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            {availableVoicesForEngine
              .filter((v) => v.gender === currentGender)
              .map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1.5 italic bg-slate-900/40 p-2 rounded-lg border border-slate-700/30">
            "{currentVoice?.description}"
          </p>
        </div>

        {/* 4. Speed & Cadence Control */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-teal-400" />
              <span>Velocidad de Lectura</span>
            </label>
            <span className="text-xs font-mono text-teal-300">{config.speed}x</span>
          </div>
          <input
            type="range"
            min="0.65"
            max="1.1"
            step="0.05"
            value={config.speed}
            onChange={(e) => onChange({ ...config, speed: parseFloat(e.target.value) })}
            className="w-full accent-teal-500 bg-slate-700 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Muy lento (Zen)</span>
            <span>Normal</span>
          </div>
        </div>

        {/* 5. Smart Pauses checkbox */}
        <div className="mt-3 bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={config.addPauses}
                onChange={(e) => onChange({ ...config, addPauses: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-300 block">
                Alargar pausas en puntos y comas
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                Inyecta silencio meditativo automático tras cada frase para respirar.
              </span>
            </div>
          </label>
        </div>

      </div>

      {/* Helpful Preview Note */}
      <div className="mt-4 pt-3 border-t border-slate-700/40">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Volume2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Voz configurada sin tonos robóticos, optimizada para relajación total.</span>
        </div>
      </div>

    </div>
  );
};
