import { useState, useRef, useEffect, useCallback } from "react";

// ─── Tema ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#080b14",
  surface: "rgba(255,255,255,0.05)",
  border: "rgba(148,105,255,0.22)",
  accent: "#9461ff",
  accentSoft: "rgba(148,97,255,0.18)",
  cyan: "#22d3ee",
  cyanSoft: "rgba(34,211,238,0.15)",
  green: "#34d399",
  rose: "#f472b6",
  text: "#e2e8f0",
  muted: "#64748b",
  highlight: "rgba(148,97,255,0.35)",
};

// ─── Idiomas disponibles ──────────────────────────────────────────────────────
type LangKey = "es-ES" | "es-LATAM" | "es-NEUTRO" | "en-US";
type Gender = "all" | "female" | "male";
type Tab = "texto" | "voz" | "plantillas";
type PlayState = "idle" | "playing" | "paused";

const LANGS: Record<LangKey, { label: string; sub: string; flag: string; ttsLang: string; match: (l: string) => boolean }> = {
  "es-ES":    { label: "Español",  sub: "España",   flag: "🇪🇸", ttsLang: "es", match: l => l === "es-ES" || l === "es_ES" },
  "es-LATAM": { label: "Español",  sub: "Latino",   flag: "🌎", ttsLang: "es", match: l => l.startsWith("es") && l !== "es-ES" && l !== "es_ES" && !l.startsWith("es-ES") },
  "es-NEUTRO":{ label: "Español",  sub: "Neutro",   flag: "🌐", ttsLang: "es", match: l => l.startsWith("es") },
  "en-US":    { label: "English",  sub: "EEUU",     flag: "🇺🇸", ttsLang: "en", match: l => l === "en-US" || l === "en_US" || l.startsWith("en-US") },
};

function detectGender(v: SpeechSynthesisVoice): "male" | "female" | "unknown" {
  const n = v.name.toLowerCase();
  const M = ["male","hombre","masculin","jorge","carlos","pablo","miguel","juan","diego","enrique","antonio","mark","james","david","tom","john","aaron","fred","daniel"];
  const F = ["female","mujer","femenin","monica","paulina","luciana","elena","carmen","rosa","maria","laura","silvia","valeria","sofia","anna","alice","emma","samantha","karen","victoria","zira","lupe","marisol","paloma"];
  if (M.some(w => n.includes(w))) return "male";
  if (F.some(w => n.includes(w))) return "female";
  return "unknown";
}

// ─── Plantillas de meditación ─────────────────────────────────────────────────
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

Caminas descalza. Sientes la hierba suave bajo tus pies.

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

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>("texto");
  const [texto, setTexto] = useState(PLANTILLAS[0].texto);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [selectedLang, setSelectedLang] = useState<LangKey>("es-ES");
  const [selectedGender, setSelectedGender] = useState<Gender>("all");
  const [rate, setRate] = useState(0.75);
  const [pitch, setPitch] = useState(0.9);
  const [volume, setVolume] = useState(1.0);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [currentCharLength, setCurrentCharLength] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const load = () => {
      const vs = window.speechSynthesis.getVoices();
      if (vs.length === 0) return;
      setVoices(vs);
      const esES = vs.find(v => v.lang === "es-ES" || v.lang === "es_ES");
      const esAny = vs.find(v => v.lang.startsWith("es"));
      setSelectedVoice(esES ?? esAny ?? vs[0]);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { synthRef.current?.cancel(); };
  }, []);

  // Voces filtradas por idioma y género
  const filteredVoices = voices.filter(v => {
    if (!LANGS[selectedLang].match(v.lang)) return false;
    if (selectedGender === "all") return true;
    const g = detectGender(v);
    return g === selectedGender || g === "unknown";
  });

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
    utt.lang = selectedVoice?.lang ?? "es-ES";
    utt.onstart = () => setPlayState("playing");
    utt.onend = () => { setPlayState("idle"); setCurrentCharIndex(-1); setCurrentCharLength(0); };
    utt.onerror = () => { setPlayState("idle"); setCurrentCharIndex(-1); };
    utt.onboundary = e => {
      if (e.name === "word") { setCurrentCharIndex(e.charIndex); setCurrentCharLength(e.charLength ?? 0); }
    };
    synthRef.current.speak(utt);
    setPlayState("playing");
  }, [texto, selectedVoice, rate, pitch, volume]);

  const pausarReanudar = useCallback(() => {
    if (!synthRef.current) return;
    if (playState === "playing") { synthRef.current.pause(); setPlayState("paused"); }
    else if (playState === "paused") { synthRef.current.resume(); setPlayState("playing"); }
  }, [playState]);

  const descargar = useCallback(async () => {
    if (!texto.trim() || isDownloading) return;
    setIsDownloading(true);
    setDownloadMsg("Generando audio...");
    try {
      const resp = await fetch("/api/tts-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: texto,
          lang: LANGS[selectedLang].ttsLang,
          slow: rate <= 0.85,
        }),
      });
      if (!resp.ok) {
        const e = await resp.json();
        throw new Error(e.error ?? "Error del servidor");
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "meditacion-valeria.mp3";
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setDownloadMsg("¡Descargado!");
      setTimeout(() => setDownloadMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setDownloadMsg(`Error: ${msg}`);
      setTimeout(() => setDownloadMsg(""), 5000);
    } finally {
      setIsDownloading(false);
    }
  }, [texto, selectedLang, rate, isDownloading]);

  const usarPlantilla = (p: typeof PLANTILLAS[0]) => {
    detener(); setTexto(p.texto); setTab("texto");
  };

  // Cuando cambia el idioma, limpiar voz seleccionada si no coincide
  useEffect(() => {
    if (selectedVoice && !LANGS[selectedLang].match(selectedVoice.lang)) {
      const first = voices.find(v => LANGS[selectedLang].match(v.lang));
      if (first) setSelectedVoice(first);
    }
  }, [selectedLang]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Nunito','Segoe UI',sans-serif", color: C.text, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#080b14;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(148,97,255,0.4);border-radius:2px;}
        .glass{background:${C.surface};backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid ${C.border};}
        .tap:active{transform:scale(0.95);}
        .tap{transition:transform 0.12s ease;}
        input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:${C.accent};cursor:pointer;}
        textarea{font-family:inherit;}
        @keyframes breathe{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.13);opacity:1}}
        @keyframes ripple{0%{transform:scale(.8);opacity:1}100%{transform:scale(2.4);opacity:0}}
        mark.hl{background:${C.highlight};border-radius:3px;padding:0 2px;color:${C.text};}
      `}</style>

      {/* Header */}
      <header className="glass" style={{ flexShrink: 0, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg,${C.accent},${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🌿</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.3px" }}>
              Meditación <span style={{ color: C.accent }}>ValerIA</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Texto a audio de meditación</div>
          </div>
          <div style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 20, background: C.cyanSoft, border: `1px solid rgba(34,211,238,.25)`, fontSize: 11, color: C.cyan, fontWeight: 700, whiteSpace: "nowrap" }}>
            {playState === "playing" ? "▶ Reproduciendo" : playState === "paused" ? "⏸ Pausa" : "✦ Listo"}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        {tab === "texto" && (
          <VistaTexto
            texto={texto} setTexto={setTexto}
            playState={playState}
            currentCharIndex={currentCharIndex} currentCharLength={currentCharLength}
            rate={rate} setRate={setRate}
            pitch={pitch} setPitch={setPitch}
            volume={volume} setVolume={setVolume}
            selectedVoice={selectedVoice}
          />
        )}
        {tab === "voz" && (
          <VistaVoz
            voices={voices} filteredVoices={filteredVoices}
            selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}
            selectedLang={selectedLang} setSelectedLang={setSelectedLang}
            selectedGender={selectedGender} setSelectedGender={setSelectedGender}
          />
        )}
        {tab === "plantillas" && <VistaPlantillas onUsar={usarPlantilla} />}
      </main>

      {/* Barra de reproducción + descarga */}
      <PlayerBar
        playState={playState}
        onPlay={reproducir} onPauseResume={pausarReanudar} onStop={detener}
        selectedVoice={selectedVoice} rate={rate}
        onDownload={descargar} isDownloading={isDownloading} downloadMsg={downloadMsg}
      />

      {/* Nav inferior */}
      <nav className="glass" style={{ flexShrink: 0, position: "sticky", bottom: 0, zIndex: 40 }}>
        <div style={{ display: "flex" }}>
          {([
            { id: "texto" as Tab, icon: "📝", label: "Texto" },
            { id: "voz" as Tab, icon: "🎙", label: "Voz" },
            { id: "plantillas" as Tab, icon: "🌸", label: "Plantillas" },
          ]).map(item => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", background: "transparent", border: "none", cursor: "pointer", position: "relative" }}>
                {active && <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 32, height: 3, borderRadius: 2, background: `linear-gradient(90deg,${C.accent},${C.cyan})` }} />}
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: active ? C.cyan : C.muted }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── Vista Texto ──────────────────────────────────────────────────────────────
function VistaTexto({ texto, setTexto, playState, currentCharIndex, currentCharLength, rate, setRate, pitch, setPitch, volume, setVolume, selectedVoice }: {
  texto: string; setTexto: (t: string) => void;
  playState: PlayState; currentCharIndex: number; currentCharLength: number;
  rate: number; setRate: (v: number) => void;
  pitch: number; setPitch: (v: number) => void;
  volume: number; setVolume: (v: number) => void;
  selectedVoice: SpeechSynthesisVoice | null;
}) {
  const isActive = playState !== "idle";

  const textoResaltado = () => {
    if (currentCharIndex < 0 || currentCharLength === 0)
      return <span style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.85 }}>{texto}</span>;
    return (
      <span style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.85 }}>
        {texto.slice(0, currentCharIndex)}
        <mark className="hl">{texto.slice(currentCharIndex, currentCharIndex + currentCharLength)}</mark>
        {texto.slice(currentCharIndex + currentCharLength)}
      </span>
    );
  };

  return (
    <div style={{ padding: "16px 16px 180px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Animación mientras reproduce */}
      {playState === "playing" && (
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 6px" }}>
          <div style={{ position: "relative", width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C.accent}`, animation: "ripple 2.2s ease-out infinite" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C.cyan}`, animation: "ripple 2.2s ease-out infinite .8s" }} />
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, animation: "breathe 4s ease-in-out infinite" }}>🌿</div>
          </div>
        </div>
      )}

      {/* Área de texto */}
      <div className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: "9px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>TEXTO DE MEDITACIÓN</span>
          <span style={{ fontSize: 11, color: C.muted }}>{texto.trim().split(/\s+/).filter(Boolean).length} palabras</span>
        </div>
        {isActive ? (
          <div style={{ padding: "14px 16px", minHeight: 200, maxHeight: 300, overflowY: "auto", color: C.text }}>
            {textoResaltado()}
          </div>
        ) : (
          <textarea
            value={texto} onChange={e => setTexto(e.target.value)}
            placeholder="Escribe o pega tu texto de meditación..."
            style={{ width: "100%", minHeight: 200, maxHeight: 300, background: "transparent", border: "none", outline: "none", padding: "14px 16px", color: C.text, fontSize: 15, lineHeight: 1.85, resize: "none" }}
          />
        )}
      </div>

      {/* Voz activa */}
      <div className="glass" style={{ borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🎙</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedVoice?.name ?? "Sin voz — ve a la pestaña Voz"}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>{selectedVoice?.lang ?? "—"}</div>
        </div>
        <div style={{ fontSize: 11, color: C.cyan, background: C.cyanSoft, padding: "3px 9px", borderRadius: 8, fontWeight: 700 }}>
          {Math.round(rate * 100)}% vel
        </div>
      </div>

      {/* Ajustes */}
      <div className="glass" style={{ borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: C.muted, letterSpacing: "0.5px" }}>AJUSTES DE VOZ</div>
        <Slider label="Velocidad" icon="⏩" value={rate} min={0.4} max={1.2} step={0.05} onChange={setRate}
          display={rate <= 0.6 ? "Muy lenta" : rate <= 0.82 ? "Lenta · meditación" : rate <= 1.0 ? "Normal" : "Rápida"}
          grad={`${C.accent},${C.cyan}`} />
        <Slider label="Tono" icon="🎵" value={pitch} min={0.5} max={1.5} step={0.05} onChange={setPitch}
          display={pitch <= 0.72 ? "Muy grave" : pitch <= 0.97 ? "Grave · sereno" : pitch <= 1.08 ? "Normal" : "Agudo"}
          grad={`${C.green},${C.cyan}`} />
        <Slider label="Volumen" icon="🔊" value={volume} min={0.1} max={1.0} step={0.05} onChange={setVolume}
          display={volume <= 0.35 ? "Bajo" : volume <= 0.7 ? "Medio" : "Alto"}
          grad={`${C.rose},#818cf8`} />
      </div>
    </div>
  );
}

function Slider({ label, icon, value, min, max, step, onChange, display, grad }: {
  label: string; icon: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string; grad: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const [c1, c2] = grad.split(",");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{icon} {label}</span>
        <span style={{ fontSize: 11, color: C.cyan, background: C.cyanSoft, padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ background: `linear-gradient(90deg,${c1} ${pct}%,rgba(255,255,255,.1) ${pct}%)` }} />
    </div>
  );
}

// ─── Barra de reproducción ────────────────────────────────────────────────────
function PlayerBar({ playState, onPlay, onPauseResume, onStop, selectedVoice, rate, onDownload, isDownloading, downloadMsg }: {
  playState: PlayState; onPlay: () => void; onPauseResume: () => void; onStop: () => void;
  selectedVoice: SpeechSynthesisVoice | null; rate: number;
  onDownload: () => void; isDownloading: boolean; downloadMsg: string;
}) {
  const isActive = playState !== "idle";
  return (
    <div style={{ position: "sticky", bottom: 56, zIndex: 30, padding: "0 14px 8px" }}>
      {downloadMsg && (
        <div style={{ marginBottom: 6, padding: "7px 14px", borderRadius: 12, background: downloadMsg.startsWith("Error") ? "rgba(248,113,113,0.15)" : "rgba(52,211,153,0.15)", border: `1px solid ${downloadMsg.startsWith("Error") ? "rgba(248,113,113,0.4)" : "rgba(52,211,153,0.4)"}`, fontSize: 12, color: downloadMsg.startsWith("Error") ? "#f87171" : C.green, fontWeight: 700, textAlign: "center" }}>
          {downloadMsg}
        </div>
      )}
      <div className="glass" style={{ borderRadius: 20, padding: "13px 16px", background: isActive ? "rgba(148,97,255,0.12)" : C.surface, border: `1px solid ${isActive ? "rgba(148,97,255,0.4)" : C.border}`, display: "flex", alignItems: "center", gap: 12, boxShadow: isActive ? "0 8px 32px rgba(148,97,255,0.25)" : "none" }}>

        {/* Play / Pause */}
        <button className="tap" onClick={isActive ? onPauseResume : onPlay} style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.cyan})`, border: "none", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 20px rgba(148,97,255,.45)`, color: "#fff" }}>
          {isActive ? (playState === "playing" ? "⏸" : "▶") : "▶"}
        </button>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isActive ? (playState === "playing" ? "🎵 Reproduciendo..." : "⏸ En pausa") : "Listo para reproducir"}
          </div>
          <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedVoice?.name ?? "Sin voz"} · {Math.round(rate * 100)}% velocidad
          </div>
        </div>

        {/* Ondas (solo cuando reproduce) */}
        {playState === "playing" && (
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            {[4, 10, 6, 14, 8, 12, 5].map((h, i) => (
              <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: C.accent, animation: `breathe ${0.55 + i * 0.09}s ease-in-out infinite alternate` }} />
            ))}
          </div>
        )}

        {/* Descargar MP3 */}
        <button className="tap" onClick={onDownload} disabled={isDownloading} title="Descargar MP3" style={{ width: 40, height: 40, borderRadius: 12, background: isDownloading ? "rgba(255,255,255,0.04)" : C.accentSoft, border: `1px solid ${isDownloading ? C.border : "rgba(148,97,255,0.45)"}`, cursor: isDownloading ? "not-allowed" : "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: isDownloading ? C.muted : C.accent }}>
          {isDownloading ? "⏳" : "📥"}
        </button>

        {/* Detener */}
        {isActive && (
          <button className="tap" onClick={onStop} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 15, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            ■
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Vista Voz ────────────────────────────────────────────────────────────────
function VistaVoz({ voices, filteredVoices, selectedVoice, setSelectedVoice, selectedLang, setSelectedLang, selectedGender, setSelectedGender }: {
  voices: SpeechSynthesisVoice[]; filteredVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null; setSelectedVoice: (v: SpeechSynthesisVoice) => void;
  selectedLang: LangKey; setSelectedLang: (l: LangKey) => void;
  selectedGender: Gender; setSelectedGender: (g: Gender) => void;
}) {
  return (
    <div style={{ padding: "16px 16px 180px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Idioma */}
      <div className="glass" style={{ borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: C.muted, marginBottom: 10, letterSpacing: "0.5px" }}>IDIOMA</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(Object.entries(LANGS) as [LangKey, typeof LANGS[LangKey]][]).map(([key, info]) => {
            const active = selectedLang === key;
            return (
              <button key={key} onClick={() => setSelectedLang(key)} className="tap" style={{ padding: "10px 10px", borderRadius: 12, background: active ? C.accentSoft : "rgba(255,255,255,0.04)", border: `1px solid ${active ? C.accent : C.border}`, cursor: "pointer", textAlign: "left", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>{info.flag}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: active ? C.accent : C.text }}>{info.label}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{info.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Género */}
      <div className="glass" style={{ borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: C.muted, marginBottom: 10, letterSpacing: "0.5px" }}>GÉNERO DE VOZ</div>
        <div style={{ display: "flex", gap: 8 }}>
          {([
            { id: "female" as Gender, label: "♀ Mujer", color: C.rose },
            { id: "male" as Gender, label: "♂ Hombre", color: C.cyan },
            { id: "all" as Gender, label: "≡ Todos", color: C.accent },
          ]).map(g => {
            const active = selectedGender === g.id;
            return (
              <button key={g.id} onClick={() => setSelectedGender(g.id)} className="tap" style={{ flex: 1, padding: "9px 4px", borderRadius: 12, background: active ? `${g.color}22` : "rgba(255,255,255,0.04)", border: `1px solid ${active ? g.color : C.border}`, cursor: "pointer", fontWeight: 700, fontSize: 13, color: active ? g.color : C.muted }}>
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de voces */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: "0.5px" }}>
          VOCES DISPONIBLES · {filteredVoices.length} {filteredVoices.length === 0 && voices.length > 0 ? "(prueba con «Neutro» o «Todos»)" : ""}
        </div>

        {voices.length === 0 ? (
          <div className="glass" style={{ borderRadius: 16, padding: "24px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>😔</div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Sin voces cargadas</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              Abre <strong style={{ color: C.accent }}>Chrome</strong> en tu Redmi 14C. Si sigues sin voces, ve a:<br />
              Ajustes → Accesibilidad → Texto a voz → Descargar voces en español.
            </div>
          </div>
        ) : filteredVoices.length === 0 ? (
          <div className="glass" style={{ borderRadius: 14, padding: "16px", textAlign: "center", color: C.muted, fontSize: 13 }}>
            No hay voces para este filtro. Prueba con <strong style={{ color: C.accent }}>Español Neutro</strong> o género <strong style={{ color: C.accent }}>Todos</strong>.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredVoices.map((v, i) => {
              const selected = selectedVoice?.name === v.name;
              const gender = detectGender(v);
              const gIcon = gender === "female" ? "♀" : gender === "male" ? "♂" : "·";
              const gColor = gender === "female" ? C.rose : gender === "male" ? C.cyan : C.muted;
              return (
                <button key={i} className="tap" onClick={() => setSelectedVoice(v)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 14, background: selected ? C.accentSoft : "rgba(255,255,255,0.04)", border: `1px solid ${selected ? C.accent : C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: C.text }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: selected ? `linear-gradient(135deg,${C.accent},${C.cyan})` : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, flexShrink: 0, color: selected ? "#fff" : gColor }}>
                    {gIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selected ? C.accent : C.text }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                      <span>{v.lang}</span>
                      <span style={{ color: v.localService ? C.green : C.muted, background: v.localService ? "rgba(52,211,153,.12)" : "rgba(255,255,255,.06)", padding: "1px 6px", borderRadius: 4 }}>
                        {v.localService ? "Local" : "Online"}
                      </span>
                    </div>
                  </div>
                  {selected && <span style={{ color: C.cyan, fontSize: 18, flexShrink: 0 }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass" style={{ borderRadius: 14, padding: "12px 14px", borderColor: "rgba(34,211,238,.25)" }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: C.cyan, marginBottom: 4 }}>💡 Para meditación</div>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
          Velocidad 70–80%, tono 0.85–0.95. Las voces <strong style={{ color: C.green }}>Local</strong> funcionan sin internet. El botón <strong style={{ color: C.accent }}>📥</strong> descarga el audio en MP3.
        </p>
      </div>
    </div>
  );
}

// ─── Vista Plantillas ─────────────────────────────────────────────────────────
function VistaPlantillas({ onUsar }: { onUsar: (p: typeof PLANTILLAS[0]) => void }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  return (
    <div style={{ padding: "16px 16px 180px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="glass" style={{ borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>🌸 Textos de meditación</div>
        <div style={{ fontSize: 13, color: C.muted }}>Toca una plantilla para preescucharla y usarla.</div>
      </div>
      {PLANTILLAS.map((p, i) => (
        <div key={i} className="glass" style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${abierta === i ? p.color + "55" : C.border}` }}>
          <button onClick={() => setAbierta(abierta === i ? null : i)} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, color: C.text }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${p.color}22`, border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {p.icono}
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{p.nombre}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {p.texto.split(/\s+/).length} palabras · ~{Math.ceil(p.texto.split(/\s+/).length / 90)} min
              </div>
            </div>
            <span style={{ color: C.muted, fontSize: 16, transition: "transform .2s", transform: abierta === i ? "rotate(180deg)" : "none" }}>▾</span>
          </button>
          {abierta === i && (
            <div style={{ borderTop: `1px solid ${C.border}` }}>
              <div style={{ padding: "12px 16px 8px", maxHeight: 190, overflowY: "auto" }}>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{p.texto}</p>
              </div>
              <div style={{ padding: "10px 16px 14px" }}>
                <button className="tap" onClick={() => onUsar(p)} style={{ width: "100%", padding: "11px", borderRadius: 12, background: `linear-gradient(135deg,${p.color}cc,${p.color}88)`, border: "none", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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
