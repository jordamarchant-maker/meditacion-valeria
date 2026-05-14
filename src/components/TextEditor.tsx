import React from 'react';
import { MeditationTemplate } from '../types';
import { MEDITATION_TEMPLATES } from '../data/templates';
import { FileText, Sparkles, Wind, HelpCircle } from 'lucide-react';

interface TextEditorProps {
  text: string;
  onChange: (text: string) => void;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.ceil(wordCount / 2.2);
  const estimatedMinutes = Math.floor(estimatedSeconds / 60);
  const remainingSeconds = estimatedSeconds % 60;

  const handleApplyTemplate = (template: MeditationTemplate) => {
    onSelectTemplate(template.id);
    onChange(template.text);
  };

  const insertTag = (tag: string) => {
    const textarea = document.getElementById('meditation-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.substring(0, start) + tag + text.substring(end);
      onChange(newText);
      
      // Reset focus after rendering
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      onChange(text + ' ' + tag);
    }
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow-xl flex flex-col h-full">
      
      {/* Header section */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-semibold text-slate-200">Texto de la Meditación</h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{wordCount} palabras</span>
          <span>•</span>
          <span className="text-teal-300 font-medium">
            ~{estimatedMinutes > 0 ? `${estimatedMinutes}m ` : ''}{remainingSeconds}s estimados
          </span>
        </div>
      </div>

      {/* Routine Quick Templates */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Cargar Rutina Preestablecida (Español Latino)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MEDITATION_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className={`text-left p-2.5 rounded-xl text-xs transition-all border ${
                  isSelected
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-200 font-medium'
                    : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold truncate flex items-center justify-between">
                  <span>{tmpl.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 ml-1">
                    {tmpl.durationEstimate}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 leading-snug">
                  {tmpl.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Helper Quick Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 bg-slate-900/40 p-2 rounded-xl border border-slate-700/40">
        <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1 font-medium">
          <Wind className="w-3 h-3 text-teal-400" /> Atajos:
        </span>
        <button
          type="button"
          onClick={() => insertTag(' [Inhala] ')}
          className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/80"
          title="Agrega un momento de inhalación suave"
        >
          + Inhala
        </button>
        <button
          type="button"
          onClick={() => insertTag(' [Exhala] ')}
          className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/80"
          title="Agrega un momento de exhalación lenta"
        >
          + Exhala
        </button>
        <button
          type="button"
          onClick={() => insertTag(' [Pausa 3s] ')}
          className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/80"
          title="Fuerza una pausa silenciosa para respirar"
        >
          + Pausa
        </button>

        <div className="ml-auto text-[10px] text-slate-500 hidden sm:flex items-center gap-1" title="El sistema agrega espacios en comas y puntos para que la voz no suene apresurada.">
          <HelpCircle className="w-3 h-3" />
          <span>Cadencia lenta automática</span>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="flex-1 flex flex-col min-h-[220px]">
        <textarea
          id="meditation-textarea"
          value={text}
          onChange={(e) => {
            onChange(e.target.value);
            if (selectedTemplateId) {
              // Automatically unselect predefined tag if custom edited
              onSelectTemplate('');
            }
          }}
          placeholder="Escribe aquí tu propia meditación guiada o selecciona una plantilla superior. Las voces tienen un acento latinoamericano suave y relajado..."
          className="w-full flex-1 bg-slate-900/80 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none font-sans leading-relaxed"
        />
      </div>

      <div className="mt-2 text-[11px] text-slate-500 text-right">
        Tip: Redacta párrafos cortos para permitir que la voz tome respiros y suene completamente humana.
      </div>

    </div>
  );
};
