export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  engine: 'streamelements' | 'browser' | 'elevenlabs';
  description: string;
  voiceId?: string; // For special API calls
}

export interface MeditationTemplate {
  id: string;
  title: string;
  category: 'sueño' | 'ansiedad' | 'respiración' | 'afirmaciones';
  text: string;
  durationEstimate: string; // e.g. "3 minutos"
  description: string;
}

export interface BackgroundSound {
  id: string;
  name: string;
  icon: string; // Reference to a lucide icon name or type
  audioUrl: string;
  volume: number;
}

export interface AudioTrackConfig {
  text: string;
  voiceId: string;
  speed: number; // 0.5 to 1.5
  pitch: number; // 0.5 to 1.5
  addPauses: boolean;
  backgroundSoundId: string;
  backgroundVolume: number; // 0 to 1
  apiKey?: string;
  engine: 'streamelements' | 'browser' | 'elevenlabs';
}

export interface GeneratedAudio {
  id: string;
  title: string;
  text: string;
  voiceName: string;
  gender: 'male' | 'female';
  blobUrl: string;
  timestamp: Date;
  durationSeconds: number;
  configUsed: AudioTrackConfig;
}
