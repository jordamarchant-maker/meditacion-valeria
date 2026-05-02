import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg: "#0a0f1e",
  border: "rgba(255,165,80,0.18)",
  accent1: "#ff6b35",
  accent2: "#ff9f1c",
  accent3: "#2ec4b6",
  text: "#f0e6d3",
  muted: "#8b9ab0",
};

interface Materia {
  id: string;
  nivel: string;
  nombre: string;
  icono: string;
  color: string;
  temas: string[];
}

interface Mensaje {
  id: string;
  rol: "usuario" | "ia";
  contenido: string;
  ts: number;
}

type Vista = "inicio" | "chat" | "materia" | "perfil" | "horario";

const materias: Materia[] = [
  { id: "lenguaje1", nivel: "1M", nombre: "Lenguaje", icono: "📖", color: "#e63946", temas: ["Géneros literarios", "Textos argumentativos", "Gramática y ortografía", "Medios y comunicación"] },
  { id: "matematica1", nivel: "1M", nombre: "Matemática", icono: "🔢", color: "#7b2d8b", temas: ["Números racionales", "Álgebra básica", "Ecuaciones lineales", "Geometría plana"] },
  { id: "historia1", nivel: "1M", nombre: "Historia", icono: "🌍", color: "#e76f51", temas: ["Historia Universal antigua", "Civilizaciones clásicas", "Historia de Chile colonial", "Geografía física"] },
  { id: "biologia1", nivel: "1M", nombre: "Biología", icono: "🧬", color: "#2d6a4f", temas: ["Célula y organismos", "Genética básica", "Ecosistemas", "Cuerpo humano"] },
  { id: "fisica1", nivel: "1M", nombre: "Física", icono: "⚡", color: "#1d3557", temas: ["Movimiento y cinemática", "Fuerzas", "Energía y trabajo", "Ondas y sonido"] },
  { id: "quimica1", nivel: "1M", nombre: "Química", icono: "🧪", color: "#457b9d", temas: ["Materia y sus propiedades", "Tabla periódica", "Enlace químico", "Reacciones básicas"] },
  { id: "ingles1", nivel: "1M", nombre: "Inglés", icono: "🗣️", color: "#023e8a", temas: ["Present & Past tense", "Vocabulario esencial", "Reading comprehension", "Writing básico"] },
  { id: "lenguaje2", nivel: "2M", nombre: "Lenguaje", icono: "📝", color: "#c1121f", temas: ["Literatura hispanoamericana", "Textos no literarios", "Argumentación avanzada", "PSU Lenguaje"] },
  { id: "matematica2", nivel: "2M", nombre: "Matemática", icono: "📐", color: "#560bad", temas: ["Funciones cuadráticas", "Estadística y probabilidad", "Trigonometría", "Números complejos"] },
  { id: "historia2", nivel: "2M", nombre: "Historia", icono: "🏛️", color: "#d62828", temas: ["Historia de Chile republicana", "Siglo XX mundial", "Derechos humanos", "Ciudadanía"] },
  { id: "biologia2", nivel: "2M", nombre: "Biología", icono: "🔬", color: "#1b4332", temas: ["Evolución y selección natural", "Genética molecular", "Sistema nervioso", "Reproducción"] },
  { id: "fisica2", nivel: "2M", nombre: "Física", icono: "🌊", color: "#0077b6", temas: ["Electricidad y magnetismo", "Óptica", "Termodinámica", "Física moderna"] },
];

function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildSystemPrompt(materiaCtx: string | null): string {
  const extra = materiaCtx
    ? `\nSofía está consultando específicamente sobre: ${materiaCtx}. Centra la respuesta en ese tema.`
    : "";
  return `Eres el Profe IA, tutor personal de Sofía, de 18 años, que estudia en modalidad 2x1 (1° y 2° Medio simultáneos) en Chile.
Sofía trabaja toda la semana y estudia los sábados. Sus condiciones son más exigentes que las de un estudiante regular, así que:
- Valora su esfuerzo y constancia cuando sea oportuno
- Prioriza explicaciones claras y directas — ella tiene poco tiempo
- Usa ejemplos del mundo real y adulto cuando puedas
- Organiza respuestas con pasos o listas cuando aplique
- Máximo 3-4 párrafos o una lista corta
- Responde siempre en español (salvo cuando enseñes inglés)
- Usa su nombre "Sofía" ocasionalmente para personalizar
- Si se equivoca, corrígela con respeto — es adulta
- Cuando enseñes matemática o ciencias, muestra los pasos
- Cubre materias de AMBOS niveles: 1° y 2° Medio del currículo chileno
- Prepara para rendir exámenes libres MINEDUC cuando sea relevante
${extra}
Nunca respondas sobre temas ajenos a la educación.`;
}

export default function App() {
  const [vista, setVista] = useState<Vista>("inicio");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null);
  const [materiaCtx, setMateriaCtx] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: "welcome",
      rol: "ia",
      contenido: "¡Hola, **Sofía**! 🌟 Soy tu Profe IA.\n\nEstás haciendo algo increíble — estudiar 1° y 2° Medio mientras trabajas toda la semana. Los sábados son tuyos para aprender.\n\nPuedo ayudarte con todas tus materias de **ambos niveles**. ¿Por dónde empezamos hoy? 💪",
      ts: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [queryCount, setQueryCount] = useState(0);

  const irA = (v: Vista) => {
    setVista(v);
    if (v !== "materia") setMateriaSeleccionada(null);
  };

  const abrirMateria = (m: Materia) => {
    setMateriaSeleccionada(m);
    setVista("materia");
  };

  const abrirChatConMateria = (nombre: string) => {
    setMateriaCtx(nombre);
    setVista("chat");
  };

  const navActivo: Vista = vista === "materia" ? "inicio" : vista;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Nunito', 'Segoe UI', sans-serif", color: COLORS.text, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f1e; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,107,53,0.3); border-radius: 2px; }
        .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,165,80,0.15); }
        .card-hover { transition: transform 0.18s ease; }
        .card-hover:active { transform: scale(0.97); }
        @media (hover: hover) { .card-hover:hover { transform: scale(1.02); } }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .typing-dot { animation: tb 1.2s infinite; display:inline-block; }
        .typing-dot:nth-child(2){animation-delay:.2s}
        .typing-dot:nth-child(3){animation-delay:.4s}
        @keyframes tb{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        .nav-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 4px; background:transparent; border:none; cursor:pointer; position:relative; }
        textarea { font-family: inherit; }
        strong { color: ${COLORS.accent2}; }
      `}</style>

      {/* Header */}
      <header className="glass" style={{ flexShrink: 0, zIndex: 40, position: "sticky", top: 0 }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => irA("inicio")} style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", color: COLORS.text }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>Profe IA · Sofía</div>
              <div style={{ fontSize: 11, color: COLORS.accent2, fontWeight: 600 }}>2×1 · 1° y 2° Medio</div>
            </div>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, background: "rgba(46,196,182,0.12)", border: "1px solid rgba(46,196,182,0.25)", fontSize: 11, color: COLORS.accent3, fontWeight: 700 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent3, display: "inline-block" }} />
            IA activa
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        {vista === "inicio" && <Inicio onMateria={abrirMateria} onChat={() => { setMateriaCtx(null); irA("chat"); }} queryCount={queryCount} />}
        {vista === "chat" && <ChatIA mensajes={mensajes} setMensajes={setMensajes} isTyping={isTyping} setIsTyping={setIsTyping} setQueryCount={setQueryCount} materiaCtx={materiaCtx} onVolver={() => irA("inicio")} />}
        {vista === "materia" && materiaSeleccionada && <MateriaDetalle materia={materiaSeleccionada} onVolver={() => irA("inicio")} onChat={abrirChatConMateria} />}
        {vista === "perfil" && <Perfil queryCount={queryCount} onVolver={() => irA("inicio")} />}
        {vista === "horario" && <Horario onVolver={() => irA("inicio")} />}
      </main>

      {/* Bottom Nav */}
      <nav className="glass" style={{ flexShrink: 0, zIndex: 40, position: "sticky", bottom: 0 }}>
        <div style={{ display: "flex" }}>
          {([
            { id: "inicio", icon: "🏠", label: "Inicio" },
            { id: "chat", icon: "🤖", label: "Profe IA" },
            { id: "horario", icon: "📅", label: "Horario" },
            { id: "perfil", icon: "👤", label: "Mi Perfil" },
          ] as { id: Vista; icon: string; label: string }[]).map((item) => {
            const active = navActivo === item.id;
            return (
              <button key={item.id} className="nav-btn" onClick={() => irA(item.id)}>
                {active && <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 32, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${COLORS.accent1}, ${COLORS.accent2})` }} />}
                <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: active ? COLORS.accent2 : COLORS.muted }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Inicio({ onMateria, onChat, queryCount }: { onMateria: (m: Materia) => void; onChat: () => void; queryCount: number }) {
  const nivel1 = materias.filter(m => m.nivel === "1M");
  const nivel2 = materias.filter(m => m.nivel === "2M");
  return (
    <div style={{ paddingBottom: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="glass" style={{ borderRadius: 20, padding: "24px 20px", background: `linear-gradient(135deg, rgba(255,107,53,0.18) 0%, rgba(255,159,28,0.12) 50%, rgba(46,196,182,0.10) 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.accent1}40 0%, transparent 70%)` }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>¡Hola, Sofía! 👋</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>Sábado de estudios</h1>
          <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>Trabajas toda la semana y igual sacas tiempo. Eso es constancia real. ¿Empezamos?</p>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[{ n: "2×1", l: "Modalidad" }, { n: "12", l: "Materias" }, { n: "24/7", l: "Profe IA" }, { n: queryCount.toString(), l: "Consultas" }].map(s => (
              <div key={s.l} className="glass" style={{ borderRadius: 10, padding: "6px 12px", textAlign: "center", flex: "1 1 60px" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14, color: COLORS.accent2 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: COLORS.muted }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="card-hover" onClick={onChat} style={{ width: "100%", borderRadius: 18, padding: "18px 20px", background: `linear-gradient(135deg, ${COLORS.accent1} 0%, ${COLORS.accent2} 100%)`, border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 8px 28px ${COLORS.accent1}50` }}>
        <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🤖</div>
        <div style={{ textAlign: "left", flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Pregúntale al Profe IA</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Respuestas reales • 1° y 2° Medio</div>
        </div>
        <span style={{ fontSize: 20 }}>→</span>
      </button>
      <MateriaGrid nivel="1° Medio" items={nivel1} onSeleccionar={onMateria} />
      <MateriaGrid nivel="2° Medio" items={nivel2} onSeleccionar={onMateria} />
      <div className="glass" style={{ borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6, display: "flex", gap: 6 }}>⚡ Tip para trabajadoras que estudian</div>
        <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}><strong>Estudia en bloques de 25 min</strong> con 5 de descanso (Pomodoro). Los sábados rinden más cuando divides el día en bloques de materia, no en horas seguidas.</p>
      </div>
    </div>
  );
}

function MateriaGrid({ nivel, items, onSeleccionar }: { nivel: string; items: Materia[]; onSeleccionar: (m: Materia) => void }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: COLORS.accent1, background: "rgba(255,107,53,0.12)", padding: "3px 8px", borderRadius: 6, border: `1px solid ${COLORS.accent1}30` }}>{nivel}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {items.map(m => (
          <button key={m.id} className="card-hover" onClick={() => onSeleccionar(m)} style={{ background: `linear-gradient(145deg, ${m.color}cc, ${m.color}88)`, border: `1px solid ${m.color}50`, borderRadius: 16, padding: "14px 10px", cursor: "pointer", color: "#fff", textAlign: "left" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{m.icono}</div>
            <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.3 }}>{m.nombre}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MateriaDetalle({ materia, onVolver, onChat }: { materia: Materia; onVolver: () => void; onChat: (nombre: string) => void }) {
  return (
    <div style={{ paddingBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <button onClick={onVolver} style={{ background: "transparent", border: "none", color: COLORS.accent2, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>← Volver</button>
      <div style={{ borderRadius: 20, padding: "22px 18px", background: `linear-gradient(135deg, ${materia.color}cc, ${materia.color}55)`, border: `1px solid ${materia.color}50` }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{materia.icono}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>{materia.nivel === "1M" ? "1° Medio" : "2° Medio"}</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{materia.nombre}</h2>
      </div>
      <div className="glass" style={{ borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, display: "flex", gap: 6 }}>📋 Temas del programa</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {materia.temas.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", fontSize: 13 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.accent1, fontWeight: 700, width: 20, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
              {t}
            </div>
          ))}
        </div>
      </div>
      <button className="card-hover" onClick={() => onChat(materia.nombre)} style={{ width: "100%", borderRadius: 16, padding: "16px", background: `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent2})`, border: "none", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span>🤖</span> Preguntarle al Profe IA sobre {materia.nombre}
      </button>
    </div>
  );
}

function ChatIA({ mensajes, setMensajes, isTyping, setIsTyping, setQueryCount, materiaCtx, onVolver }: {
  mensajes: Mensaje[]; setMensajes: React.Dispatch<React.SetStateAction<Mensaje[]>>;
  isTyping: boolean; setIsTyping: (v: boolean) => void;
  setQueryCount: React.Dispatch<React.SetStateAction<number>>;
  materiaCtx: string | null; onVolver: () => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes, isTyping]);

  const enviar = async (texto?: string) => {
    const msg = (texto ?? input).trim();
    if (!msg || isTyping) return;
    setInput("");
    const userMsg: Mensaje = { id: genId(), rol: "usuario", contenido: msg, ts: Date.now() };
    setMensajes(prev => [...prev, userMsg]);
    setQueryCount(c => c + 1);
    setIsTyping(true);
    try {
      const historial = mensajes.filter(m => m.id !== "welcome").slice(-10).map(m => ({ role: m.rol === "usuario" ? "user" : "assistant", content: m.contenido }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystemPrompt(materiaCtx), messages: [...historial, { role: "user", content: msg }] })
      });
      const data = await response.json();
      const reply = data?.content?.[0]?.text || "No pude obtener respuesta. Intenta de nuevo.";
      setMensajes(prev => [...prev, { id: genId(), rol: "ia", contenido: reply, ts: Date.now() }]);
    } catch {
      setMensajes(prev => [...prev, { id: genId(), rol: "ia", contenido: "Hubo un error de conexión. Revisa tu red e intenta de nuevo.", ts: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sugerencias = ["Explícame la célula eucariota", "¿Cómo resuelvo ecuaciones cuadráticas?", "Cuéntame sobre la Independencia de Chile", "Practica inglés conmigo"];

  return (
    <div style={{ height: "calc(100vh - 130px)", display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, flexShrink: 0 }}>
        <button onClick={onVolver} style={{ background: "transparent", border: "none", color: COLORS.accent2, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Profe IA</div>
          {materiaCtx && <div style={{ fontSize: 11, color: COLORS.accent2 }}>Contexto: {materiaCtx}</div>}
        </div>
        <button onClick={() => setMensajes([{ id: "welcome", rol: "ia", contenido: "¡Hola de nuevo, **Sofía**! 🌟 Chat reiniciado. ¿Qué materia vemos ahora?", ts: Date.now() }])} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.muted, cursor: "pointer", padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>Limpiar</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
        {mensajes.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.rol === "usuario" ? "flex-end" : "flex-start" }}>
            {m.rol === "ia" && <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 4 }}>🤖</div>}
            <div style={{ maxWidth: "78%", padding: "11px 14px", borderRadius: m.rol === "usuario" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.rol === "usuario" ? `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent2})` : "rgba(255,255,255,0.07)", border: m.rol === "ia" ? `1px solid ${COLORS.border}` : "none", fontSize: 13.5, lineHeight: 1.55, color: m.rol === "usuario" ? "#fff" : COLORS.text }} dangerouslySetInnerHTML={{ __html: renderMd(m.contenido) }} />
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
            <div style={{ padding: "11px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.07)", border: `1px solid ${COLORS.border}`, display: "flex", gap: 4, alignItems: "center" }}>
              <span className="typing-dot" style={{ fontSize: 18, color: COLORS.accent2 }}>·</span>
              <span className="typing-dot" style={{ fontSize: 18, color: COLORS.accent2 }}>·</span>
              <span className="typing-dot" style={{ fontSize: 18, color: COLORS.accent2 }}>·</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {mensajes.length <= 1 && !isTyping && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, flexShrink: 0 }}>
          {sugerencias.map(s => (
            <button key={s} onClick={() => enviar(s)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "7px 12px", fontSize: 12, color: COLORS.text, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, flexShrink: 0 }}>{s}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", paddingTop: 10, flexShrink: 0 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }} placeholder="Pregunta lo que necesites..." rows={1} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "10px 14px", color: COLORS.text, fontSize: 13, resize: "none", outline: "none", lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }} />
        <button onClick={() => enviar()} disabled={!input.trim() || isTyping} style={{ width: 44, height: 44, borderRadius: 12, background: !input.trim() || isTyping ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent2})`, border: "none", cursor: !input.trim() || isTyping ? "not-allowed" : "pointer", fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", color: "#fff" }}>
          {isTyping ? "⏳" : "↑"}
        </button>
      </div>
    </div>
  );
}

function Horario({ onVolver }: { onVolver: () => void }) {
  const bloques = [
    { hora: "09:00", dur: "9:00 – 10:30", materia: "1° Medio — Lenguaje / Historia", color: "#e63946" },
    { hora: "10:30", dur: "10:30 – 10:45", materia: "☕ Descanso", color: "#555" },
    { hora: "10:45", dur: "10:45 – 12:15", materia: "1° Medio — Matemática / Física", color: "#7b2d8b" },
    { hora: "12:15", dur: "12:15 – 13:00", materia: "🍽 Almuerzo", color: "#555" },
    { hora: "13:00", dur: "13:00 – 14:30", materia: "2° Medio — Lenguaje / Historia", color: "#c1121f" },
    { hora: "14:30", dur: "14:30 – 14:45", materia: "☕ Descanso", color: "#555" },
    { hora: "14:45", dur: "14:45 – 16:15", materia: "2° Medio — Matemática / Biología", color: "#560bad" },
    { hora: "16:15", dur: "16:15 – 17:00", materia: "🔁 Repaso libre · Profe IA", color: "#2ec4b6" },
  ];
  return (
    <div style={{ paddingBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <button onClick={onVolver} style={{ background: "transparent", border: "none", color: COLORS.accent2, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>← Volver</button>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>📅 Horario sugerido de sábado</h2>
        <p style={{ fontSize: 13, color: COLORS.muted }}>Adaptado a modalidad 2×1 para exámenes libres MINEDUC</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bloques.map((b, i) => (
          <div key={i} className="glass" style={{ borderRadius: 14, padding: "12px 16px", display: "flex", gap: 14, alignItems: "center", borderLeft: `4px solid ${b.color}` }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: b.color, width: 36, flexShrink: 0, textAlign: "center" }}>{b.hora}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{b.materia}</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>{b.dur}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="glass" style={{ borderRadius: 14, padding: "14px 16px", borderColor: "rgba(46,196,182,0.3)" }}>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6, color: COLORS.accent3 }}>💡 Tip exámenes libres MINEDUC</div>
        <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>Rinde primero 1° Medio, luego 2°. Puedes inscribirte desde marzo en cualquier sostenedor municipal. Consulta en el DAEM de tu comuna.</p>
      </div>
    </div>
  );
}

function Perfil({ queryCount, onVolver }: { queryCount: number; onVolver: () => void }) {
  const logros = [
    { icono: "🌟", nombre: "Primera pregunta", desc: "Le preguntaste al Profe IA por primera vez", done: queryCount >= 1 },
    { icono: "💪", nombre: "Constante", desc: "5 consultas al Profe IA", done: queryCount >= 5 },
    { icono: "🔥", nombre: "En racha", desc: "20 preguntas al Profe IA", done: queryCount >= 20 },
    { icono: "🏆", nombre: "Maestra 2×1", desc: "50 consultas al Profe IA", done: queryCount >= 50 },
  ];
  return (
    <div style={{ paddingBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <button onClick={onVolver} style={{ background: "transparent", border: "none", color: COLORS.accent2, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", gap: 4, alignItems: "center", padding: 0 }}>← Volver</button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8 }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 12 }}>👩‍💼</div>
        <h2 style={{ fontWeight: 900, fontSize: 22 }}>Sofía</h2>
        <span style={{ fontSize: 12, color: COLORS.accent2, background: "rgba(255,107,53,0.12)", border: `1px solid ${COLORS.accent1}30`, padding: "4px 12px", borderRadius: 20, marginTop: 6, fontWeight: 700 }}>2×1 · Sábados · Chile 🇨🇱</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[{ icono: "🤖", num: queryCount, label: "Consultas" }, { icono: "📚", num: 12, label: "Materias" }, { icono: "🏅", num: logros.filter(l => l.done).length, label: "Logros" }].map((s, i) => (
          <div key={i} className="glass" style={{ borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icono}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 18, color: COLORS.accent2 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="glass" style={{ borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, display: "flex", gap: 6 }}>🏆 Mis Logros</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logros.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: l.done ? "rgba(255,159,28,0.1)" : "rgba(255,255,255,0.03)", opacity: l.done ? 1 : 0.5, border: l.done ? `1px solid ${COLORS.accent2}30` : "1px solid transparent" }}>
              <span style={{ fontSize: 22 }}>{l.icono}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: l.done ? COLORS.text : COLORS.muted }}>{l.nombre}</div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>{l.desc}</div>
              </div>
              {l.done ? <span style={{ color: COLORS.accent3, fontWeight: 700 }}>✓</span> : <span style={{ fontSize: 14 }}>🔒</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="glass" style={{ borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, display: "flex", gap: 6 }}>🤖 Sobre Profe IA</div>
        <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>Tutor personal impulsado por <strong style={{ color: COLORS.accent2 }}>Claude (Anthropic)</strong>, diseñado para estudiantes 2×1 que trabajan. Disponible 24/7, cubre 1° y 2° Medio del currículo chileno. <strong style={{ color: COLORS.accent2 }}>Hecho para Sofía 🧡</strong></p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: COLORS.muted }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent3, display: "inline-block" }} />
          Profe IA v1.0 · Sofía Edition
        </div>
      </div>
    </div>
  );
}
