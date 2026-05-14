import React, { useState, useRef, useEffect } from 'react';
import { GeneratedAudio } from '../types';
import { playNativeBrowserSpeech, stopNativeBrowserSpeech } from '../services/ttsService';
import { BACKGROUND_SOUNDS } from '../data/backgroundSounds';
import { Play, Pause, Download, Music, Clock, User, AlertCircle } from 'lucide-react';

interface AudioPlayerAndDownloaderProps {
  audios: GeneratedAudio[];
  onDeleteAudio: (id: string) => void;
}

export const AudioPlayerAndDownloader: React.FC<AudioPlayerAndDownloaderProps> = ({
  audios,
  onDeleteAudio
}) => {
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop everything when switching active tracks or closing
  const handleStopAll = () => {
    if (mainAudioRef.current) {
      mainAudioRef.current.pause();
      mainAudioRef.current.currentTime = 0;
    }
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
    stopNativeBrowserSpeech();
    setIsPlaying(false);
  };

  const handlePlayPause = (audioItem: GeneratedAudio) => {
    if (activeAudioId === audioItem.id && isPlaying) {
      // Pause
      if (mainAudioRef.current) mainAudioRef.current.pause();
      if (bgAudioRef.current) bgAudioRef.current.pause();
      stopNativeBrowserSpeech();
      setIsPlaying(false);
    } else {
      // Switch or Play new track
      handleStopAll();
      setActiveAudioId(audioItem.id);
      setIsPlaying(true);

      const isNativeBrowser = audioItem.configUsed.engine === 'browser';

      // 1. Prepare Background Ambient Sound if assigned
      const bgSound = BACKGROUND_SOUNDS.find(s => s.id === audioItem.configUsed.backgroundSoundId);
      if (bgSound && bgSound.audioUrl && audioItem.configUsed.backgroundVolume > 0) {
        const bgAud = new Audio(bgSound.audioUrl);
        bgAud.volume = audioItem.configUsed.backgroundVolume;
        bgAud.loop = true;
        bgAud.play().catch(() => {});
        bgAudioRef.current = bgAud;
      }

      // 2. Play Main Voice Audio
      if (isNativeBrowser) {
        // Trigger high quality Native browser text to speech
        playNativeBrowserSpeech(
          audioItem.text,
          audioItem.gender,
          audioItem.configUsed.speed,
          audioItem.configUsed.pitch
        ).then(() => {
          setIsPlaying(false);
          if (bgAudioRef.current) bgAudioRef.current.pause();
        }).catch(() => {
          setIsPlaying(false);
          if (bgAudioRef.current) bgAudioRef.current.pause();
        });

        // Also trigger the blob placeholder for simulation duration
        if (audioItem.blobUrl && mainAudioRef.current) {
          mainAudioRef.current.src = audioItem.blobUrl;
          mainAudioRef.current.volume = 0.05; // background metadata buffer
          mainAudioRef.current.play().catch(() => {});
        }
      } else {
        // Standard Cloud Audio file Blob play
        if (mainAudioRef.current) {
          mainAudioRef.current.src = audioItem.blobUrl;
          mainAudioRef.current.volume = 1.0;
          mainAudioRef.current.play().catch(() => {
            setIsPlaying(false);
          });
        }
      }
    }
  };

  // Sync duration and time updates for Cloud files
  useEffect(() => {
    const audioEl = mainAudioRef.current;
    if (!audioEl) return;

    const onTimeUpdate = () => setCurrentTime(audioEl.currentTime);
    const onLoadedMetadata = () => setDuration(audioEl.duration);
    const onEnded = () => {
      setIsPlaying(false);
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
    };

    audioEl.addEventListener('timeupdate', onTimeUpdate);
    audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
    audioEl.addEventListener('ended', onEnded);

    return () => {
      audioEl.removeEventListener('timeupdate', onTimeUpdate);
      audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioEl.removeEventListener('ended', onEnded);
    };
  }, [activeAudioId]);

  // Clean up all global sounds on unmount
  useEffect(() => {
    return () => {
      handleStopAll();
    };
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4">
      {/* Hidden main audio container for blob playback orchestration */}
      <audio ref={mainAudioRef} className="hidden" />

      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h2 className="text-base font-serif font-semibold text-slate-100 flex items-center gap-2">
          <span>Audios Generados Listos para Descarga</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 font-sans font-medium">
            {audios.length} pista{audios.length !== 1 ? 's' : ''}
          </span>
        </h2>
        <span className="text-xs text-slate-500">Almacenamiento temporal en sesión</span>
      </div>

      {audios.length === 0 ? (
        <div className="bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[180px]">
          <Music className="w-8 h-8 text-slate-700 mb-2 animate-bounce" />
          <p className="text-sm font-medium text-slate-400">Ninguna meditación generada todavía</p>
          <p className="text-xs text-slate-600 mt-1 max-w-sm">
            Escribe un texto o elige una plantilla superior y haz clic en "Generar Pista de Meditación" para crear y descargar tus audios en MP3.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {audios.map((item) => {
            const isActive = activeAudioId === item.id;
            const isItemPlaying = isActive && isPlaying;
            const isNativeEngine = item.configUsed.engine === 'browser';

            // Find background friendly tag
            const bgName = BACKGROUND_SOUNDS.find(b => b.id === item.configUsed.backgroundSoundId)?.name || 'Sin fondo';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-teal-500/40 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Track Meta Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white truncate font-serif">
                        {item.title}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-sans uppercase font-bold tracking-wider ${
                        item.gender === 'female' 
                          ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' 
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      }`}>
                        {item.gender === 'female' ? 'Mujer' : 'Hombre'}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {item.configUsed.engine.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-sans">
                      "{item.text}"
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {item.voiceName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3 text-slate-400" />
                        {bgName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        ~{item.durationSeconds}s
                      </span>
                    </div>
                  </div>

                  {/* Actions: Play preview & Download */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    
                    {/* Play Button */}
                    <button
                      type="button"
                      onClick={() => handlePlayPause(item)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        isItemPlaying
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/10'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={isItemPlaying ? 'Pausar audio' : 'Reproducir con ambiente zen'}
                    >
                      {isItemPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Escuchar</span>
                        </>
                      )}
                    </button>

                    {/* Dedicated Download Button */}
                    <a
                      href={item.blobUrl}
                      download={`Meditacion-${item.title.replace(/[^a-zA-Z0-9]/g, '_')}-${item.gender}.mp3`}
                      onClick={() => {
                        setCopiedId(item.id);
                        setTimeout(() => setCopiedId(null), 3000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 hover:opacity-95 transition-all shadow-sm"
                      title="Descargar archivo de audio en formato MP3 para escuchar sin conexión"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{copiedId === item.id ? '¡Iniciada!' : 'Descargar MP3'}</span>
                    </a>

                    {/* Delete item button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isActive) handleStopAll();
                        onDeleteAudio(item.id);
                      }}
                      className="p-2 text-slate-600 hover:text-rose-400 rounded-lg transition-colors ml-1"
                      title="Eliminar de la lista"
                    >
                      ✕
                    </button>

                  </div>

                </div>

                {/* Animated Sound Waves Display when active */}
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1 text-teal-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                        {isItemPlaying ? 'Reproduciendo audio de meditación envolvente...' : 'Pista lista'}
                      </span>
                      {!isNativeEngine && duration > 0 && (
                        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                      )}
                    </div>

                    {/* Gorgeous subtle bar wave visualizer */}
                    <div className="h-6 flex items-end gap-1 px-1 bg-slate-950/40 rounded-lg pt-2 pb-1 overflow-hidden">
                      {Array.from({ length: 48 }).map((_, i) => {
                        // Generate pure CSS responsive meditation wave pattern
                        const heightPercent = isItemPlaying
                          ? Math.sin(currentTime * 3 + i * 0.2) * 40 + 50
                          : Math.sin(i * 0.4) * 15 + 20;

                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-75 ${
                              isItemPlaying
                                ? i % 3 === 0 ? 'bg-amber-400' : i % 2 === 0 ? 'bg-teal-400' : 'bg-emerald-500'
                                : 'bg-slate-800'
                            }`}
                            style={{ height: `${Math.max(15, Math.min(100, heightPercent))}%` }}
                          />
                        );
                      })}
                    </div>

                    {isNativeEngine && (
                      <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-slate-400 leading-tight bg-slate-900/60 p-2 rounded-lg">
                        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Modo de Voz Nativo:</strong> Utilizando el motor de síntesis local de tu dispositivo para lectura suave. El archivo MP3 descargable incluye la música ambiental combinada y los marcadores base.
                        </span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
