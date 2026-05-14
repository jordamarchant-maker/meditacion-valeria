import React, { useRef, useState } from 'react';
import { BACKGROUND_SOUNDS } from '../data/backgroundSounds';
import { AudioTrackConfig } from '../types';
import { Sparkles, Waves, CloudRain, Radio, VolumeX, Volume2, Play, Square } from 'lucide-react';

interface AmbientMixerProps {
  config: AudioTrackConfig;
  onChange: (newConfig: AudioTrackConfig) => void;
}

export const AmbientMixer: React.FC<AmbientMixerProps> = ({ config, onChange }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Waves': return <Waves className="w-4 h-4" />;
      case 'CloudRain': return <CloudRain className="w-4 h-4" />;
      case 'Radio': return <Radio className="w-4 h-4" />;
      default: return <VolumeX className="w-4 h-4" />;
    }
  };

  const handleTogglePreview = (soundId: string, url: string) => {
    if (!url) return;

    if (playingId === soundId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(url);
      newAudio.volume = config.backgroundVolume || 0.3;
      newAudio.loop = true;
      newAudio.play().catch(() => {});
      audioRef.current = newAudio;
      setPlayingId(soundId);
    }
  };

  // Stop background preview when selecting another configuration option or unmounting
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync volume with currently playing preview
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = config.backgroundVolume;
    }
  }, [config.backgroundVolume]);

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow-xl flex flex-col justify-between h-full">
      <div>
        
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-700/50">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-200">Música Ambiental de Fondo</h2>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Añade una capa sonora tenue detrás de la voz para profundizar el estado de meditación.
        </p>

        {/* Ambient Choices list */}
        <div className="space-y-2 mb-4">
          {BACKGROUND_SOUNDS.map((sound) => {
            const isSelected = config.backgroundSoundId === sound.id;
            const isPlayingPreview = playingId === sound.id;

            return (
              <div
                key={sound.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/40 border-slate-700/40 text-slate-300 hover:bg-slate-900/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...config,
                      backgroundSoundId: sound.id,
                      // Automatically set sensible default volume if previously muted
                      backgroundVolume: sound.volume > 0 && config.backgroundVolume === 0 ? sound.volume : config.backgroundVolume
                    });
                  }}
                  className="flex items-center gap-2.5 flex-1 text-left text-xs font-medium"
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                    {getIcon(sound.icon)}
                  </div>
                  <span className="truncate">{sound.name}</span>
                </button>

                {sound.audioUrl && (
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(sound.id, sound.audioUrl)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ml-2 border ${
                      isPlayingPreview
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                    title={isPlayingPreview ? 'Pausar prueba' : 'Escuchar prueba de fondo'}
                  >
                    {isPlayingPreview ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Volume slider */}
      {config.backgroundSoundId !== 'none' && (
        <div className="mt-2 pt-3 border-t border-slate-700/40">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Volumen de Fondo</span>
            </label>
            <span className="text-xs font-mono text-amber-300">
              {Math.round(config.backgroundVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={config.backgroundVolume}
            onChange={(e) => onChange({ ...config, backgroundVolume: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-slate-700 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Muy suave</span>
            <span>Intenso</span>
          </div>
        </div>
      )}

    </div>
  );
};
