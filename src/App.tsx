import { useState, useRef, useEffect, useCallback } from "react";

// ─── Tema visual ────────────────────────────────────────────────────────────
const C = {
  bg: "#080b14",
  surface: "rgba(255,255,255,0.05)",
  surfaceHigh: "rgba(255,255,255,0.09)",
  border: "rgba(148,105,255,0.22)",
  accent: "#9461ff",
  accentSoft: "rgba(148,97,255,0.18)",
  cyan: "#22d3ee",
  cyanSoft: "rgba(34,211,238,0.15)",
  green: "#34d399",
  text: "#e2e8f0",
  muted: "#64748b",
  highlight: "rgba(148,97,255,0.35)",
};

// ─── Plantillas de meditación ────────────────────────────────────────────────
const PLANTILLAS = [
  {
    nombre: "Respiración consciente",
    icono: "🌬️",
    color: "#9461ff",
    texto: `Cierra los ojos suavemente. Deja que tu cuerpo se afloje poco a poco.

Inhala profundamente por la nariz... cuenta uno, dos, tres, cuatro.

Retén el aire un momento... uno, dos.

Exhala lentamente por la boca... uno, dos, tres, cuatro, cinco, seis.

Siente cómo la tensión abandona tus hombros con cada exhalación.

Inhala de nuevo... llenando primero el vientre, luego el pecho.

Exhala... vaciando primero el pecho, luego el vientre.

Estás exactamente donde necesitas estar. En este momento. Respirando.

Continúa así. Con cada respiración te sumerges más en una calma profunda y serena.`,
  },
  {
    nombre: "Relajación del cuerpo",
    icono: "🌿",
    color: "#34d399",
    texto: `Acuéstate cómodamente. Permite que tus ojos se cierren.

Lleva tu atención a los pies. Siente cómo se relajan... se aflojan... se vuelven pesados.

Ahora las pantorrillas y las rodillas. Toda tensión se disuelve como nieve al sol.

Los muslos, las caderas, el abdomen. Todo blando, pesado, relajado.

El pecho se abre con cada respiración suave. Los hombros caen hacia abajo.

Los brazos, las manos, los dedos. Completamente flojos.

El cuello, la mandíbula, los ojos. La frente completamente lisa y tranquila.

Tu cuerpo entero descansa en paz. Eres peso pleno sobre la tierra.

Permanece aquí, en esta quietud perfecta, tanto como necesites.`,
  },
  {
    nombre: "Visualización del bosque",
    icono: "🌲",
    color: "#22d3ee",
    texto: `Imagina que caminas por un bosque tranquilo al amanecer.

El aire es fresco y huele a tierra mojada y pino. Cada bocanada te nutre.

Escuchas el suave murmullo de un arroyo cercano. El agua fluye sin prisa, como tus pensamientos.

Los rayos del sol filtran entre las hojas, creando manchas doradas en el suelo.

Caminas descalzo. Sientes la hierba suave bajo tus pies.

Un pájaro canta a lo lejos. Todo está en perfecto equilibrio.

Te sientas junto al arroyo. Observas el agua pasar.

Tus preocupaciones son como hojas que caen al agua y se alejan flotando.

Aquí eres libre. Aquí hay paz. Aquí eres tú.`,
  },
  {
    nombre: "Gratitud y amor propio",
    icono: "💜",
    color: "#f472b6",
    texto: `Coloca una mano sobre tu corazón. Siente su latido constante.

Este corazón ha latido cada segundo de tu vida, sosteniéndote en silencio.

Piensa en algo pequeño por lo que estar agradecida hoy.

Quizás una taza de té caliente. Una llamada de alguien querido. La luz de la mañana.

Permite que esa gratitud se expanda en tu pecho como una luz cálida.

Ahora díte a ti misma con suavidad: estoy bien. Estoy a salvo. Merezco descanso.

Tu cuerpo hace un trabajo increíble cada día. Tu mente merece pausa.

Respira hondo y recibe tu propio amor. Eres suficiente exactamente como eres.

Con cada respiración, renueva esa promesa de cuidarte con amabilidad.`,
  },
  {
    nombre: "Noche tranquila",
    icono: "🌙",
    color: "#818cf8",
    texto: `El día llega a su fin. Es hora de soltar todo lo que cargaste hoy.

Respira profundamente y, al exhalar, deja ir el trabajo, las preocupaciones, las listas pendientes.

No hay nada que resolver esta noche. Mañana puede esperar.

Tu cuerpo sabe cómo descansar. Solo necesitas permitírselo.

Siente el peso de tu cuerpo hundirse en la cama. Estás segura. Estás en calma.

El silencio de la noche te envuelve como una manta suave.

Cada respiración te lleva más adentro del descanso. Más adentro de la paz.

Los pensamientos pasan como nubes. No los sigues. Solo observas y dejas ir.

Duerme en paz. Mañana es un nuevo comienzo. Por ahora, solo descansa.`,
  },
];

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Tab = "texto" | "voz" | "plantillas";
type PlayState = "idle" | "playing" | "paused";

// ─── Componente principal ─────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>("texto");
  const [texto, setTexto] = useState(PLANTILLAS[0].texto);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(0.75);
  const [pitch, setPitch] = useState(0.9);
  const [volume, setVolume] = useState(1.0);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(-1);
  const [currentCharLength, setCurrentCharLength] = useState<number>(0);
  const [voiceFilter, setVoiceFilter] = useState<"es" | "all">("es");

  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Cargar voces
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const cargarVoces = () => {
      const vs = synthRef.current!.getVoices();
      if (vs.length > 0) {
        setVoices(vs);
        const esVoice = vs.find(v => v.lang.startsWith("es")) || vs[0];
        setSelectedVoice(esVoice);
      }
    };
    cargarVoces();
    window.speechSynthesis.onvoiceschanged = cargarVoces;
    return () => { synthRef.current?.cancel(); };
  }, []);

  const voicesFiltradas = voiceFilter === "es"
    ? voices.filter(v => v.lang.startsWith("es"))
    : voices;

  const detener = useCallback(() => {
    synthRef.current?.cancel();
    setPlayState("idle");
    setCurrentCharIndex(-1);
    setCurrentCharLength(0);
  }, []);

  const reproducir = useCallback(() => {
    if (!synthRef.current || !texto.trim()) return;
    synthRef.current.cancel();

    const utt = new SpeechSynthesisUtterance(texto);
    if (selectedVoice) utt.voice = selectedVoice;
    utt.rate = rate;
    utt.pitch = pitch;
    utt.volume = volume;
    utt.lang = selectedVoice?.lang || "es-ES";

    utt.onstart = () => setPlayState("playing");
    utt.onend = () => { setPlayState("idle"); setCurrentCharIndex(-1); setCurrentCharLength(0); };
    utt.onerror = () => { setPlayState("idle"); setCurrentCharIndex(-1); };
    utt.onboundary = (e) => {
      if (e.name === "word") {
        setCurrentCharIndex(e.charIndex);
        setCurrentCharLength(e.charLength ?? 0);
      }
    };

    uttRef.current = utt;
    synthRef.current.speak(utt);
    setPlayState("playing");
  }, [texto, selectedVoice, rate, pitch, volume]);

  const pausarReanudar = useCallback(() => {
    if (!synthRef.current) return;
    if (playState === "playing") {
      synthRef.current.pause();
      setPlayState("paused");
    } else if (playState === "paused") {
      synthRef.current.resume();
      setPlayState("playing");
    }
  }, [playState]);

  const usarPlantilla = (t: typeof PLANTILLAS[0]) => {
    detener();
    setTexto(t.texto);
    setTab("texto");
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Nunito', 'Segoe UI', sans-serif", color: C.text, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b14; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(148,97,255,0.4); border-radius: 2px; }
        .glass { background: ${C.surface}; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid ${C.border}; }
        .btn-tap:active { transform: scale(0.95); }
        .btn-tap { transition: transform 0.12s ease; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${C.accent}; cursor: pointer; }
        textarea { font-family: inherit; }
        @keyframes breathe { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.12);opacity:1} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(148,97,255,0.3)} 50%{box-shadow:0 0 40px rgba(148,97,255,0.7)} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2.2);opacity:0} }
        .word-highlight { background: ${C.highlight}; border-radius: 3px; padding: 0 2px; }
      `}</style>

      {/* Header */}
      <header className="glass" style={{ flexShrink: 0, zIndex: 40, position: "sticky", top: 0 }}>
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🌿</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17 }}>Meditación · Voz</div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Convierte texto en audio de meditación</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: C.cyanSoft, border: `1px solid rgba(34,211,238,0.25)`, fontSize: 11, color: C.cyan, fontWeight: 700 }}>
            {playState === "playing" ? "▶ Reproduciendo" : playState === "paused" ? "⏸ En pausa" : "✦ Listo"}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {tab === "texto" && (
          <VistaTexto
            texto={texto}
            setTexto={setTexto}
            playState={playState}
            currentCharIndex={currentCharIndex}
            currentCharLength={currentCharLength}
            rate={rate}
            setRate={setRate}
            pitch={pitch}
            setPitch={setPitch}
            volume={volume}
            setVolume={setVolume}
            selectedVoice={selectedVoice}
            onPlay={reproducir}
            onPauseResume={pausarReanudar}
            onStop={detener}
          />
        )}
        {tab === "voz" && (
          <VistaVoz
            voices={voicesFiltradas}
            allVoices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            voiceFilter={voiceFilter}
            setVoiceFilter={setVoiceFilter}
          />
        )}
        {tab === "plantillas" && (
          <VistaPlantillas onUsar={usarPlantilla} />
        )}
      </main>

      {/* Control de reproducción fijo */}
      <PlayerBar
        playState={playState}
        onPlay={reproducir}
        onPauseResume={pausarReanudar}
        onStop={detener}
        selectedVoice={selectedVoice}
        rate={rate}
      />

      {/* Bottom Nav */}
      <nav className="glass" style={{ flexShrink: 0, zIndex: 40, position: "sticky", bottom: 0 }}>
        <div style={{ display: "flex" }}>
          {([
            { id: "texto" as Tab, icon: "📝", label: "Texto" },
            { id: "voz" as Tab, icon: "🎙", label: "Voz" },
            { id: "plantillas" as Tab, icon: "🌸", label: "Plantillas" },
          ]).map((item) => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", background: "transparent", border: "none", cursor: "pointer", position: "relative" }}>
                {active && <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 32, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})` }} />}
                <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: active ? C.cyan : C.muted }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── Vista Texto ─────────────────────────────────────────────────────────────
function VistaTexto({ texto, setTexto, playState, currentCharIndex, currentCharLength, rate, setRate, pitch, setPitch, volume, setVolume, selectedVoice, onPlay, onPauseResume, onStop }: {
  texto: string; setTexto: (t: string) => void;
  playState: PlayState; currentCharIndex: number; currentCharLength: number;
  rate: number; setRate: (v: number) => void;
  pitch: number; setPitch: (v: number) => void;
  volume: number; setVolume: (v: number) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  onPlay: () => void; onPauseResume: () => void; onStop: () => void;
}) {
  const isPlaying = playState === "playing" || playState === "paused";

  // Construir texto con palabra resaltada
  const textoResaltado = () => {
    if (currentCharIndex < 0 || currentCharLength === 0) return <span style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.85, color: C.text }}>{texto}</span>;
    const antes = texto.slice(0, currentCharIndex);
    const palabra = texto.slice(currentCharIndex, currentCharIndex + currentCharLength);
    const despues = texto.slice(currentCharIndex + currentCharLength);
    return (
      <span style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.85, color: C.text }}>
        {antes}<mark className="word-highlight">{palabra}</mark>{despues}
      </span>
    );
  };

  return (
    <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 140 }}>

      {/* Animación de reproducción */}
      {playState === "playing" && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0 8px", gap: 0 }}>
          <div style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C.accent}`, animation: "ripple 2s ease-out infinite" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C.cyan}`, animation: "ripple 2s ease-out infinite 0.7s" }} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, animation: "breathe 4s ease-in-out infinite" }}>🌿</div>
          </div>
        </div>
      )}

      {/* Área de texto */}
      <div className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>TEXTO DE MEDITACIÓN</span>
          <span style={{ fontSize: 11, color: C.muted }}>{texto.split(/\s+/).filter(Boolean).length} palabras</span>
        </div>
        {isPlaying ? (
          <div style={{ padding: "14px 16px", minHeight: 200, maxHeight: 320, overflowY: "auto" }}>
            {textoResaltado()}
          </div>
        ) : (
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escribe o pega tu texto de meditación aquí..."
            style={{ width: "100%", minHeight: 200, maxHeight: 320, background: "transparent", border: "none", outline: "none", padding: "14px 16px", color: C.text, fontSize: 15, lineHeight: 1.85, resize: "none" }}
          />
        )}
      </div>

      {/* Voz seleccionada (mini) */}
      <div className="glass" style={{ borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🎙</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedVoice?.name || "Sin voz cargada"}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>{selectedVoice?.lang || "—"}</div>
        </div>
        <div style={{ fontSize: 11, color: C.cyan, background: C.cyanSoft, padding: "3px 8px", borderRadius: 8, fontWeight: 700, whiteSpace: "nowrap" }}>
          {(rate * 100).toFixed(0)}% vel
        </div>
      </div>

      {/* Controles de ajuste */}
      <div className="glass" style={{ borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.muted }}>AJUSTES DE VOZ</div>

        <SliderControl label="Velocidad" icon="⏩" value={rate} min={0.4} max={1.2} step={0.05}
          onChange={setRate} color={C.accent}
          display={rate <= 0.65 ? "Muy lenta" : rate <= 0.85 ? "Lenta (meditación)" : rate <= 1.0 ? "Normal" : "Rápida"}
          gradient={`linear-gradient(90deg, #9461ff, #22d3ee)`} />

        <SliderControl label="Tono" icon="🎵" value={pitch} min={0.5} max={1.5} step={0.05}
          onChange={setPitch} color={C.green}
          display={pitch <= 0.75 ? "Muy grave" : pitch <= 0.95 ? "Grave (sereno)" : pitch <= 1.05 ? "Normal" : "Agudo"}
          gradient={`linear-gradient(90deg, #34d399, #22d3ee)`} />

        <SliderControl label="Volumen" icon="🔊" value={volume} min={0.1} max={1.0} step={0.05}
          onChange={setVolume} color="#f472b6"
          display={volume <= 0.3 ? "Bajo" : volume <= 0.7 ? "Medio" : "Alto"}
          gradient={`linear-gradient(90deg, #f472b6, #818cf8)`} />
      </div>
    </div>
  );
}

// ─── Control deslizante ───────────────────────────────────────────────────────
function SliderControl({ label, icon, value, min, max, step, onChange, display, gradient }: {
  label: string; icon: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; color: string; display: string; gradient: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, display: "flex", gap: 6, alignItems: "center" }}>
          <span>{icon}</span> {label}
        </span>
        <span style={{ fontSize: 12, color: C.cyan, fontWeight: 700, background: C.cyanSoft, padding: "2px 8px", borderRadius: 6 }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", background: `linear-gradient(90deg, ${gradient.slice(gradient.indexOf("#"))}, transparent ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }} />
    </div>
  );
}

// ─── Barra de reproducción ────────────────────────────────────────────────────
function PlayerBar({ playState, onPlay, onPauseResume, onStop, selectedVoice, rate }: {
  playState: PlayState; onPlay: () => void; onPauseResume: () => void; onStop: () => void;
  selectedVoice: SpeechSynthesisVoice | null; rate: number;
}) {
  const isActive = playState !== "idle";
  return (
    <div style={{ position: "sticky", bottom: 56, zIndex: 30, padding: "0 16px 10px" }}>
      <div className="glass" style={{ borderRadius: 20, padding: "14px 18px", background: isActive ? `linear-gradient(135deg, rgba(148,97,255,0.2), rgba(34,211,238,0.12))` : C.surface, border: `1px solid ${isActive ? "rgba(148,97,255,0.4)" : C.border}`, display: "flex", alignItems: "center", gap: 14, boxShadow: isActive ? "0 8px 32px rgba(148,97,255,0.25)" : "none" }}>

        {/* Botón principal */}
        {!isActive ? (
          <button className="btn-tap" onClick={onPlay} style={{ width: 54, height: 54, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, border: "none", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 20px rgba(148,97,255,0.5)` }}>
            ▶
          </button>
        ) : (
          <button className="btn-tap" onClick={onPauseResume} style={{ width: 54, height: 54, borderRadius: "50%", background: playState === "playing" ? `linear-gradient(135deg, ${C.accent}, ${C.cyan})` : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 20px rgba(148,97,255,0.4)` }}>
            {playState === "playing" ? "⏸" : "▶"}
          </button>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isActive ? (playState === "playing" ? "🎵 Reproduciendo..." : "⏸ En pausa") : "Listo para reproducir"}
          </div>
          <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedVoice?.name || "Sin voz"} · {(rate * 100).toFixed(0)}% velocidad
          </div>
        </div>

        {/* Detener */}
        {isActive && (
          <button className="btn-tap" onClick={onStop} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 16, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            ■
          </button>
        )}

        {/* Indicador de onda */}
        {playState === "playing" && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            {[4, 10, 7, 14, 5, 11, 8].map((h, i) => (
              <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: C.accent, animation: `breathe ${0.6 + i * 0.1}s ease-in-out infinite alternate` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Vista Voz ────────────────────────────────────────────────────────────────
function VistaVoz({ voices, allVoices, selectedVoice, setSelectedVoice, voiceFilter, setVoiceFilter }: {
  voices: SpeechSynthesisVoice[]; allVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (v: SpeechSynthesisVoice) => void;
  voiceFilter: "es" | "all"; setVoiceFilter: (f: "es" | "all") => void;
}) {
  const esCount = allVoices.filter(v => v.lang.startsWith("es")).length;
  return (
    <div style={{ padding: "16px 16px 120px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="glass" style={{ borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>🎙 Selecciona una voz</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
          Las voces disponibles dependen de tu dispositivo Android. Para meditación recomendamos voces femeninas en español.
        </div>
      </div>

      {/* Filtro */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["es", "all"] as const).map(f => (
          <button key={f} onClick={() => setVoiceFilter(f)} style={{ flex: 1, padding: "9px 0", borderRadius: 12, background: voiceFilter === f ? C.accentSoft : C.surface, border: `1px solid ${voiceFilter === f ? C.accent : C.border}`, color: voiceFilter === f ? C.accent : C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {f === "es" ? `🇪🇸 Español (${esCount})` : `🌍 Todas (${allVoices.length})`}
          </button>
        ))}
      </div>

      {voices.length === 0 ? (
        <div className="glass" style={{ borderRadius: 16, padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>😔</div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Sin voces disponibles</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            Tu navegador no ha cargado voces aún. Intenta abrir Ajustes → Accesibilidad → Texto a voz en tu teléfono y descarga voces en español.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {voices.map((v, i) => {
            const selected = selectedVoice?.name === v.name;
            const esFemenina = /female|femenin|mujer|woman|girl|she/i.test(v.name) || /Google español de Estados Unidos|Monica|Paulina|Luciana|Mónica/i.test(v.name);
            return (
              <button key={i} className="btn-tap" onClick={() => setSelectedVoice(v)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 14, background: selected ? C.accentSoft : C.surface, border: `1px solid ${selected ? C.accent : C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: C.text }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: selected ? `linear-gradient(135deg, ${C.accent}, ${C.cyan})` : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {esFemenina ? "👩" : "🎙"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selected ? C.accent : C.text }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                    <span>{v.lang}</span>
                    {v.localService && <span style={{ color: C.green, background: "rgba(52,211,153,0.12)", padding: "1px 6px", borderRadius: 4 }}>Local</span>}
                    {!v.localService && <span style={{ color: C.muted, background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4 }}>Online</span>}
                  </div>
                </div>
                {selected && <span style={{ color: C.cyan, fontSize: 18 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="glass" style={{ borderRadius: 14, padding: "12px 14px", borderColor: "rgba(34,211,238,0.25)" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.cyan, marginBottom: 4 }}>💡 Tip para meditación</div>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>Ajusta la velocidad a 70–80% y el tono a 0.85–0.95 para un sonido más suave y relajante. Las voces locales funcionan sin internet.</p>
      </div>
    </div>
  );
}

// ─── Vista Plantillas ─────────────────────────────────────────────────────────
function VistaPlantillas({ onUsar }: { onUsar: (t: typeof PLANTILLAS[0]) => void }) {
  const [expandida, setExpandida] = useState<number | null>(null);
  return (
    <div style={{ padding: "16px 16px 120px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="glass" style={{ borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>🌸 Textos de meditación</div>
        <div style={{ fontSize: 13, color: C.muted }}>Selecciona una plantilla o personaliza el texto en la pestaña Texto.</div>
      </div>

      {PLANTILLAS.map((p, i) => (
        <div key={i} className="glass" style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${expandida === i ? p.color + "55" : C.border}` }}>
          <button onClick={() => setExpandida(expandida === i ? null : i)} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, color: C.text }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${p.color}22`, border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {p.icono}
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{p.nombre}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{p.texto.split(/\s+/).length} palabras · ~{Math.ceil(p.texto.split(/\s+/).length / 100)} min</div>
            </div>
            <span style={{ color: C.muted, fontSize: 16, transition: "transform 0.2s", transform: expandida === i ? "rotate(180deg)" : "none" }}>▾</span>
          </button>

          {expandida === i && (
            <div style={{ borderTop: `1px solid ${C.border}` }}>
              <div style={{ padding: "12px 16px 8px", maxHeight: 200, overflowY: "auto" }}>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{p.texto}</p>
              </div>
              <div style={{ padding: "10px 16px 14px" }}>
                <button className="btn-tap" onClick={() => onUsar(p)} style={{ width: "100%", padding: "11px", borderRadius: 12, background: `linear-gradient(135deg, ${p.color}cc, ${p.color}88)`, border: "none", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {p.icono} Usar esta plantilla
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
