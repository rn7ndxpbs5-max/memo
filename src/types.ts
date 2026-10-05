export type SubjectType = 'math_est1' | 'math_est2' | 'biology_est2';

export interface QuestionOption {
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface ESTQuestion {
  id: string;
  domain: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calculatorAllowed?: boolean;
  questionText: string;
  options: QuestionOption[];
  correctOption: string;
  detailedSolutionArabic: string;
  speedHack: string;
  commonTrap: string;
}

export interface ExamSession {
  id: string;
  title: string;
  subject: SubjectType;
  questions: ESTQuestion[];
  userAnswers: Record<string, string>;
  timeSpentSeconds: number;
  completed: boolean;
  score?: number;
  remediationPlan?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'menna';
  text: string;
  image?: string;
  timestamp: number;
  subject?: SubjectType;
  challengeAnswered?: boolean;
  challengeSelected?: string;
  challengeFeedback?: string;
  challengeEvaluating?: boolean;
}

export interface FormulaCard {
  id: string;
  title: string;
  arabicTitle: string;
  category: 'algebra' | 'advanced_math' | 'trig_precalc' | 'cell_bio' | 'genetics' | 'physiology' | 'calculator_hacks';
  subject: 'math' | 'biology';
  formulaLaTeX?: string;
  explanation: string;
  mennaHack: string;
  trapWarning: string;
  example: string;
}

export interface UnitProgress {
  unitId: string;
  name: string;
  arabicName: string;
  subject: 'math' | 'biology';
  subTrack: 'EST I' | 'EST II' | 'Both';
  questionsSolved: number;
  questionsCorrect: number;
  accuracy: number; // percentage 0-100
  lastPracticed?: string;
}

export interface ExamProgressSummary {
  totalSolved: number;
  totalCorrect: number;
  overallAccuracy: number;
  mathSolved: number;
  mathAccuracy: number;
  biologySolved: number;
  biologyAccuracy: number;
  estimatedScaledScore: number;
  units: UnitProgress[];
}

