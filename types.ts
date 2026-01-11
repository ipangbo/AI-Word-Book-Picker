
export interface SubtitleLine {
  id: string;
  startTime: string;
  endTime: string;
  englishText: string;
  chineseText: string;
}

export interface VocabItem {
  word: string;
  context: string; // The full sentence
  translation: string;
  timestamp: string;
  lineId: string;
  wordIndex: number; // Index of the word in the sentence (0-based)
}

export interface GeminiStudyGuide {
  word: string;
  definition: string;
  example: string;
}

export interface AppSettings {
  autoExpandContext: boolean;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  LEARNING = 'LEARNING',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT'
}
