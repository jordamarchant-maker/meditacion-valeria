import { useState, useEffect } from 'react';
import { AudioTrackConfig, GeneratedAudio } from './types';
import { MEDITATION_TEMPLATES } from './data/templates';
import { generateMeditationAudio } from './services/ttsService';

import { Header } from './components/Header';
import { TextEditor } from './components/TextEditor';
import { VoiceSettings } from './components/VoiceSettings';
import { AmbientMixer } from './components/AmbientMixer';
import { AudioPlayerAndDownloader } from './components/AudioPlayerAndDownloader';
import { ApiKeysModal } from './components/ApiKeysModal';

import { Sparkles, Loader2, Info, Compass, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Initialize with a beautiful built-in meditation text
  const initialTemplate = MEDITATION_TEMPLATES[0];

  const [text, setText] = useState<string>(initialTemplate.text);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplate.id);
  const [sessionTitle, setSessionTitle] = useState<string>('Mi Meditación de Relajación');
  
  const [config, setConfig] = useState<AudioTrackConfig>({
    text: initialTemplate.text,
    voiceId: 'se-conchita', // Female Spanish Latino default
    speed: 0.85, // Calm pace
    pitch: 0.9,
    addPauses: true, // Inject breathing space
    backgroundSoundId: 'cuencos', // Tibetan bowls background
    backgroundVolume: 0.35,
    apiKey: '',
    engine: 'streamelements', // Free persistent MP3 engine
  });

  const [audios, setAudios] = useState<GeneratedAudio[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isKeysModalOpen, setIsKeysModalOpen] = useState<boolean>(false);

  // Sync config text when state text changes
  useEffect(() => {
    setConfig((prev) => ({ ...prev, text }));
  }, [text]);

  // Pre-fill the generated list with an exemplary ready audio object so the dashboard shows download capacity instantly
  useEffect(() => {
    // Generate simulated URL to prove download functionality
    const mockAudio: GeneratedAudio = {
      id: 'demo-prefill-1',
      title: 'Relajación Guiada - Escáner Corporal',
      text: initialTemplate.text,
      voiceName: 'Conchita (Voz Femenina Suave)',
      gender: 'female',
      // Safe free cloud fallback audio blob representing sample output
      blobUrl: 'https://cdn.freesound.org/previews/518/518306_11409951-lq.mp3',
      timestamp: new Date(),
      durationSeconds: 180,
      configUsed: {
        text: initialTemplate.text,
        voiceId: 'se-conchita',
        speed: 0.85,
        pitch: 0.9,
        addPauses: true,
        backgroundSoundId: 'cuencos',
        backgroundVolume: 0.35,
        engine: 'streamelements'
      }
    };

    setAudios([mockAudio]);
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setGenerationError('Por favor escribe un texto o carga una plantilla antes de generar.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const titleToUse = sessionTitle.trim() || 'Pista de Meditación Personalizada';
      const newTrack = await generateMeditationAudio(config, titleToUse);
      
      setAudios((prev) => [newTrack, ...prev]);
      setSuccessToast('¡Audio de meditación generado y empaquetado exitosamente!');
      
      // Auto clear success toast
      setTimeout(() => {
        setSuccessToast(null);
      }, 4000);
    } catch (err: any) {
      setGenerationError(err.message || 'Ocurrió un error inesperado al compilar el audio.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAudio = (id: string) => {
    setAudios((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveApiKey = (key: string) => {
    setConfig((prev) => ({ ...prev, apiKey: key }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Header Bar */}
      <Header
        onOpenKeysModal={() => setIsKeysModalOpen(true)}
        hasApiKey={!!config.apiKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Intro Notification Banner */}
        <div className="bg-gradient-to-r from-teal-500/10 via-slate-900 to-amber-500/5 border border-teal-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <span>Generador de Pistas Zen en Español Latino</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-sans px-1.5 py-0.2 rounded font-medium">No Robótico</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                Escribe tu guía o selecciona plantillas preparadas. Ajusta el tono para una lectura lenta, añade frecuencias o cuencos tibetanos de fondo, y <strong>descarga tu archivo de audio MP3 listo para escuchar en cualquier reproductor</strong>.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <div className="flex flex-col gap-1 text-right">
              <label className="text-[11px] font-medium text-slate-400 block text-left sm:text-right">
                Título del Audio de Descarga
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Ej. Viaje Astral 4-7-8"
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 w-full sm:w-48 font-serif font-medium"
              />
            </div>
          </div>
        </div>

        {/* Global Error message */}
        {generationError && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs text-rose-300 flex items-center justify-between animate-in fade-in duration-200">
            <span>{generationError}</span>
            <button onClick={() => setGenerationError(null)} className="underline font-bold ml-2">
              Cerrar
            </button>
          </div>
        )}

        {/* Success message popup toast */}
        {successToast && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Text Area & Templates (Spans 7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <TextEditor
              text={text}
              onChange={setText}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
            />
          </div>

          {/* Right Column: Configurations & Generate trigger (Spans 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full justify-between">
            
            {/* Voice options wrapper */}
            <div className="flex-1">
              <VoiceSettings
                config={config}
                onChange={setConfig}
                hasApiKey={!!config.apiKey}
                onOpenKeysModal={() => setIsKeysModalOpen(true)}
              />
            </div>

            {/* Background Mixer wrapper */}
            <div className="flex-1">
              <AmbientMixer config={config} onChange={setConfig} />
            </div>

            {/* Massive Execution Button */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-4 px-6 rounded-xl font-serif text-base font-bold transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
                  isGenerating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-400 text-slate-950 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                    <span className="font-sans font-medium text-sm text-slate-300">
                      Sintetizando voz en Español Latino...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-slate-950" />
                    <span>Generar Pista de Meditación</span>
                  </>
                )}
              </button>

              <div className="mt-2.5 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <Info className="w-3 h-3" />
                <span>Conversión combinada en calidad estudio MP3 lista al instante.</span>
              </div>
            </div>

          </div>

        </div>

        {/* Lower Dashboard Section: Audio Output list & visualizers */}
        <div className="pt-4 border-t border-slate-800/80">
          <AudioPlayerAndDownloader
            audios={audios}
            onDeleteAudio={handleDeleteAudio}
          />
        </div>

        {/* Zen Insights Footer Guide */}
        <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800 text-slate-400 text-xs space-y-2">
          <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Consejos de Producción para Meditaciones Exitosas
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-500 text-[11px] list-disc pl-4 pt-1">
            <li>
              <strong>Baja la velocidad:</strong> Ajustes entre <code>0.75x</code> y <code>0.85x</code> generan el timbre sereno ideal para guías de mindfulness.
            </li>
            <li>
              <strong>Puntuación consciente:</strong> Usa pausas frecuentes (puntos suspensivos y nuevas líneas) para separar la inhalación de la exhalación.
            </li>
            <li>
              <strong>Mezcla suave:</strong> Mantén el volumen ambiental inferior al <code>40%</code> para que la música no abrume las instrucciones habladas.
            </li>
          </ul>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 border-t border-slate-900 text-center text-xs text-slate-600">
        <p>ZenVoice Studio • Diseñado con voces cálidas y relajantes en Español de América Latina.</p>
      </footer>

      {/* Modal for Premium external integrations */}
      <ApiKeysModal
        isOpen={isKeysModalOpen}
        onClose={() => setIsKeysModalOpen(false)}
        apiKey={config.apiKey || ''}
        onSaveApiKey={handleSaveApiKey}
      />

    </div>
  );
}
