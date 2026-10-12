// --- THÈMES & PHONÈMES ---
export type ThemeMode = 'sepia' | 'dark' | 'green';
export type PhonemeTarget = 'none' | 'bd' | 'pq' | 'fv' | 'an_on_in';

// --- PRÉFÉRENCES UTILISATEUR & COMPENSATIONS ---
export interface UserPreferences {
  theme: ThemeMode;
  fontDys: boolean;
  modeExamen: boolean;
  letterSpacing: number; // em
  lineHeight: number;
  speechRate: number;
  selectedPhoneme: PhonemeTarget;
  sylActive: boolean;
  silentActive: boolean;
  rulerActive: boolean;
  gazeTrackingActive: boolean;
}

// --- ÉTAT DU MOTEUR VOCAL KOKORO-82M ---
export interface KokoroConfig {
  voice: 'af_bella' | 'af_sarah' | 'am_michael' | 'af_nicole';
  speed: number;
  dtype: 'q8' | 'q4' | 'fp32';
}

export interface TTSState {
  isLoaded: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  progress: number;
  currentWordIndex: number | null;
}

// --- MÉTRIQUES ORTHOPHONIQUES (MFM / BILAN) ---
export interface ReadingSessionMetrics {
  sessionId: string;
  timestamp: string;
  totalWords: number;
  durationSeconds: number;
  errorsCount: number;
  motsFortementMaitrises: number; // MFM = (Mots lus - Erreurs) / (Temps / 60)
  precisionRate: number; // %
}

// --- GAMIFICATION & SCAFFOLDING (PÉDAGOGIE ADAPTATIVE) ---
export interface GamificationState {
  xp: number;
  level: number;
  badges: string[];
  streakDays: number;
  scaffoldingLevel: number; // 1 = Minimal, 2 = Assisté, 3 = Guidé
}

// --- DYSCALCULIE & TDAH ---
export interface Base10State {
  units: number;
  tens: number;
  hundreds: number;
}

export interface MindmapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  parentId?: string;
}
