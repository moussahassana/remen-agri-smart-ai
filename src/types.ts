
export type Language = 'FR' | 'FUL' | 'EN';

export interface Diagnosis {
  probableDiagnosis: string;
  causes: string;
  solutions: string;
  urgency: string;
  prevention: string;
  healthScore: number;
  healthScoreExplanation: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  culture: string;
  issue: string;
  diagnosis: Diagnosis;
}

export interface Translation {
  title: string;
  subtitle: string;
  describeIssue: string;
  analyze: string;
  quickActions: string;
  diagnosisLabel: string;
  causesLabel: string;
  solutionsLabel: string;
  urgencyLabel: string;
  preventionLabel: string;
  healthScoreLabel: string;
  offlineMode: string;
  dailyTip: string;
  library: string;
  immediateAction: string;
  voiceMode: string;
  takePhoto: string;
  history: string;
  settings: string;
  cultures: {
    maize: string;
    millet: string;
    okra: string;
    sorghum: string;
    cotton: string;
  };
}
