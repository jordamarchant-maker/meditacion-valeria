import { BackgroundSound } from '../types';

export const BACKGROUND_SOUNDS: BackgroundSound[] = [
  {
    id: 'none',
    name: 'Sin música (Solo voz pura)',
    icon: 'VolumeX',
    audioUrl: '',
    volume: 0
  },
  {
    id: 'cuencos',
    name: 'Cuencos Tibetanos Armónicos',
    icon: 'Sparkles',
    // Using a reliable safe stock sound URL or synthetic marker
    audioUrl: 'https://cdn.freesound.org/previews/518/518306_11409951-lq.mp3',
    volume: 0.35
  },
  {
    id: 'olas',
    name: 'Olas del Mar Suaves',
    icon: 'Waves',
    audioUrl: 'https://cdn.freesound.org/previews/404/404111_4397472-lq.mp3',
    volume: 0.3
  },
  {
    id: 'lluvia',
    name: 'Lluvia Zen y Viento Suave',
    icon: 'CloudRain',
    audioUrl: 'https://cdn.freesound.org/previews/531/531947_4525543-lq.mp3',
    volume: 0.25
  },
  {
    id: 'frecuencia-solfeggio',
    name: 'Frecuencia de Sanación 528Hz',
    icon: 'Radio',
    audioUrl: 'https://cdn.freesound.org/previews/683/683100_1648170-lq.mp3',
    volume: 0.3
  }
];

export const AVAILABLE_VOICES = [
  // StreamElements (Free direct MP3 blob generator endpoints)
  {
    id: 'se-conchita',
    name: 'Conchita (Voz Femenina Suave)',
    gender: 'female' as const,
    language: 'Español Latino',
    engine: 'streamelements' as const,
    description: 'Tono latinoamericano dulce y paciente, perfecto para guías de sueño y relajación.',
    voiceId: 'Conchita'
  },
  {
    id: 'se-mia',
    name: 'Mía (Voz Femenina Neutra)',
    gender: 'female' as const,
    language: 'Español Latino',
    engine: 'streamelements' as const,
    description: 'Voz clara y serena ideal para escáneres corporales y técnicas de respiración.',
    voiceId: 'Mia'
  },
  {
    id: 'se-enrique',
    name: 'Enrique (Voz Masculina Profunda)',
    gender: 'male' as const,
    language: 'Español Latino',
    engine: 'streamelements' as const,
    description: 'Timbro cálido y resonante que transmite una gran seguridad y paz mental.',
    voiceId: 'Enrique'
  },
  {
    id: 'se-miguel',
    name: 'Miguel (Voz Masculina Cálida)',
    gender: 'male' as const,
    language: 'Español Latino',
    engine: 'streamelements' as const,
    description: 'Tono pausado y compasivo, óptimo para afirmaciones y meditación matutina.',
    voiceId: 'Miguel'
  },
  
  // Native Browser Voices Backups
  {
    id: 'browser-female',
    name: 'Voz Nativa Femenina (Navegador)',
    gender: 'female' as const,
    language: 'Español Latino',
    engine: 'browser' as const,
    description: 'Generación local sin requerir conexión a internet. Se optimiza con tono y velocidad baja.',
  },
  {
    id: 'browser-male',
    name: 'Voz Nativa Masculina (Navegador)',
    gender: 'male' as const,
    language: 'Español Latino',
    engine: 'browser' as const,
    description: 'Voz del sistema operativo optimizada para ritmo de meditación.',
  },

  // ElevenLabs Premium Integration Option
  {
    id: 'eleven-rachel',
    name: 'ElevenLabs - Valentina (Voz Premium IA)',
    gender: 'female' as const,
    language: 'Español Latino',
    engine: 'elevenlabs' as const,
    description: 'Requiere API Key de ElevenLabs. Realismo de calidad estudio con susurros y calidez humana natural.',
    voiceId: '21m00Tcm4TlvDq8ikWAM' // Rachel / Custom
  },
  {
    id: 'eleven-antoni',
    name: 'ElevenLabs - Mateo (Voz Premium IA)',
    gender: 'male' as const,
    language: 'Español Latino',
    engine: 'elevenlabs' as const,
    description: 'Requiere API Key de ElevenLabs. Voz cinematográfica profunda y meditativa.',
    voiceId: 'ErXwobaYiN019PkySvjV' // Antoni
  }
];
