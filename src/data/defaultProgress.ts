import { ExamProgressSummary, UnitProgress, SubjectType } from '../types';

export const INITIAL_UNITS: UnitProgress[] = [
  // --- Math Units ---
  {
    unitId: 'math-alg',
    name: 'Heart of Algebra',
    arabicName: 'معادلات الخط المستقيم والأنظمة الخطية',
    subject: 'math',
    subTrack: 'EST I',
    questionsSolved: 14,
    questionsCorrect: 12,
    accuracy: 86,
  },
  {
    unitId: 'math-adv',
    name: 'Passport to Advanced Math',
    arabicName: 'الدوال التربيعية وكثيرات الحدود والكسور الجبرية',
    subject: 'math',
    subTrack: 'EST I',
    questionsSolved: 18,
    questionsCorrect: 13,
    accuracy: 72,
  },
  {
    unitId: 'math-psda',
    name: 'Problem Solving & Data Analysis',
    arabicName: 'الإحصاء، الاحتمالات، والنسب المئوية',
    subject: 'math',
    subTrack: 'EST I',
    questionsSolved: 10,
    questionsCorrect: 8,
    accuracy: 80,
  },
  {
    unitId: 'math-trig',
    name: 'Pre-Calculus & Trigonometry',
    arabicName: 'حساب المثلثات والمتطابقات والمتجهات',
    subject: 'math',
    subTrack: 'EST II',
    questionsSolved: 8,
    questionsCorrect: 5,
    accuracy: 63,
  },
  {
    unitId: 'math-matrix',
    name: 'Matrices & Linear Algebra',
    arabicName: 'المصفوفات والمحددات في EST II',
    subject: 'math',
    subTrack: 'EST II',
    questionsSolved: 6,
    questionsCorrect: 4,
    accuracy: 67,
  },

  // --- Biology Units ---
  {
    unitId: 'bio-cell',
    name: 'Cell Biology & Energetics',
    arabicName: 'التنفس الخلوي، البناء الضوئي، والطاقة',
    subject: 'biology',
    subTrack: 'EST II',
    questionsSolved: 15,
    questionsCorrect: 13,
    accuracy: 87,
  },
  {
    unitId: 'bio-genetics',
    name: 'Molecular Genetics & Inheritance',
    arabicName: 'الوراثة المندلية وتضاعف الـ DNA ومربعات بانيت',
    subject: 'biology',
    subTrack: 'EST II',
    questionsSolved: 12,
    questionsCorrect: 9,
    accuracy: 75,
  },
  {
    unitId: 'bio-physio',
    name: 'Human Physiology & Organ Systems',
    arabicName: 'فسيولوجيا الإنسان، النيفرون، والهرمونات',
    subject: 'biology',
    subTrack: 'EST II',
    questionsSolved: 14,
    questionsCorrect: 10,
    accuracy: 71,
  },
  {
    unitId: 'bio-eco-evo',
    name: 'Ecology, Evolution & Diversity',
    arabicName: 'اتزان هاردي-واينبرج، التطور، والبيئة',
    subject: 'biology',
    subTrack: 'EST II',
    questionsSolved: 8,
    questionsCorrect: 5,
    accuracy: 63,
  },
];

export function calculateProgressSummary(units: UnitProgress[]): ExamProgressSummary {
  const totalSolved = units.reduce((acc, u) => acc + u.questionsSolved, 0);
  const totalCorrect = units.reduce((acc, u) => acc + u.questionsCorrect, 0);
  const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

  const mathUnits = units.filter((u) => u.subject === 'math');
  const mathSolved = mathUnits.reduce((acc, u) => acc + u.questionsSolved, 0);
  const mathCorrect = mathUnits.reduce((acc, u) => acc + u.questionsCorrect, 0);
  const mathAccuracy = mathSolved > 0 ? Math.round((mathCorrect / mathSolved) * 100) : 0;

  const bioUnits = units.filter((u) => u.subject === 'biology');
  const biologySolved = bioUnits.reduce((acc, u) => acc + u.questionsSolved, 0);
  const biologyCorrect = bioUnits.reduce((acc, u) => acc + u.questionsCorrect, 0);
  const biologyAccuracy = biologySolved > 0 ? Math.round((biologyCorrect / biologySolved) * 100) : 0;

  // EST Scaled Score estimator (typically 200-800 scale, with baseline 400 for ~50%, scaling up to 800 for 95%+)
  let estimatedScaledScore = 500;
  if (overallAccuracy >= 95) estimatedScaledScore = 800;
  else if (overallAccuracy >= 90) estimatedScaledScore = 770;
  else if (overallAccuracy >= 80) estimatedScaledScore = 730;
  else if (overallAccuracy >= 70) estimatedScaledScore = 670;
  else if (overallAccuracy >= 60) estimatedScaledScore = 610;
  else if (overallAccuracy >= 50) estimatedScaledScore = 550;
  else estimatedScaledScore = Math.max(400, Math.round(overallAccuracy * 6 + 200));

  return {
    totalSolved,
    totalCorrect,
    overallAccuracy,
    mathSolved,
    mathAccuracy,
    biologySolved,
    biologyAccuracy,
    estimatedScaledScore,
    units,
  };
}

export function updateProgressWithExamResults(
  currentUnits: UnitProgress[],
  questions: Array<{ domain: string; isCorrect: boolean }>,
  subject: SubjectType
): UnitProgress[] {
  const updated = [...currentUnits];

  questions.forEach((q) => {
    // Map question domain to corresponding unit
    const domainLower = (q.domain || '').toLowerCase();
    let targetIndex = -1;

    if (subject === 'biology_est2' || domainLower.includes('bio') || domainLower.includes('cell') || domainLower.includes('gene') || domainLower.includes('physio') || domainLower.includes('eco')) {
      if (domainLower.includes('gene') || domainLower.includes('dna') || domainLower.includes('punnett')) {
        targetIndex = updated.findIndex((u) => u.unitId === 'bio-genetics');
      } else if (domainLower.includes('physio') || domainLower.includes('organ') || domainLower.includes('kidney') || domainLower.includes('hormone')) {
        targetIndex = updated.findIndex((u) => u.unitId === 'bio-physio');
      } else if (domainLower.includes('eco') || domainLower.includes('evo') || domainLower.includes('hardy')) {
        targetIndex = updated.findIndex((u) => u.unitId === 'bio-eco-evo');
      } else {
        targetIndex = updated.findIndex((u) => u.unitId === 'bio-cell');
      }
    } else {
      // Math
      if (domainLower.includes('algebra') || domainLower.includes('linear')) {
        targetIndex = updated.findIndex((u) => u.unitId === 'math-alg');
      } else if (domainLower.includes('advanced') || domainLower.includes('quadratic') || domainLower.includes('polynomial')) {
        targetIndex = updated.findIndex((u) => u.unitId === 'math-adv');
      } else if (domainLower.includes('matrix') || domainLower.includes('matrices') || domainLower.includes('vector')) {
        targetIndex = updated.findIndex((u) => u.unitId === 'math-matrix');
      } else if (domainLower.includes('trig') || domainLower.includes('calculus') || domainLower.includes('pre-calc')) {
        targetIndex = updated.findIndex((u) => u.unitId === 'math-trig');
      } else {
        targetIndex = updated.findIndex((u) => u.unitId === 'math-psda');
      }
    }

    if (targetIndex !== -1) {
      const u = updated[targetIndex];
      const newSolved = u.questionsSolved + 1;
      const newCorrect = u.questionsCorrect + (q.isCorrect ? 1 : 0);
      updated[targetIndex] = {
        ...u,
        questionsSolved: newSolved,
        questionsCorrect: newCorrect,
        accuracy: Math.round((newCorrect / newSolved) * 100),
        lastPracticed: new Date().toISOString(),
      };
    }
  });

  return updated;
}
