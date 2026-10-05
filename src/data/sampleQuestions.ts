export interface SampleQuestion {
  id: string;
  title: string;
  subject: 'math_est1' | 'math_est2' | 'biology_est2';
  domain: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calculator: boolean;
  questionText: string;
  hint: string;
}

export const SAMPLE_EST_QUESTIONS: SampleQuestion[] = [
  {
    id: 'sq-1',
    title: 'EST I Math: Quadratic Discriminant & Tangency',
    subject: 'math_est1',
    domain: 'Passport to Advanced Math',
    difficulty: 'Medium',
    calculator: false,
    questionText: `In the $xy$-plane, the graph of $y = 2x^2 - 4x + c$ is tangent to the line $y = 3$. What is the value of the constant $c$?

A) 1
B) 3
C) 5
D) 7`,
    hint: 'فكر في نقطة التماس: إما بـ Discriminant $= 0$ أو بإيجاد إحداثيات رأس القطع المكافئ $y_v = 3$!',
  },
  {
    id: 'sq-2',
    title: 'EST I Math: Rational Expression Asymptote',
    subject: 'math_est1',
    domain: 'Passport to Advanced Math',
    difficulty: 'Hard',
    calculator: false,
    questionText: `Which of the following functions has a vertical asymptote at $x = 3$ and a horizontal asymptote at $y = -2$?

A) $f(x) = \\frac{2x - 1}{x - 3}$
B) $f(x) = \\frac{-2x + 7}{x - 3}$
C) $f(x) = \\frac{x - 3}{-2x + 6}$
D) $f(x) = \\frac{-2x^2 + 1}{(x - 3)^2}$`,
    hint: 'المحاذي الرأسي يصفّر المقام، والمحاذي الأفقي هو نسبة المعاملات لأعلى أس!',
  },
  {
    id: 'sq-3',
    title: 'EST II Math: Matrix Determinant & Singularity',
    subject: 'math_est2',
    domain: 'Matrices & Linear Algebra',
    difficulty: 'Hard',
    calculator: true,
    questionText: `Given the matrix $M = \\begin{pmatrix} k - 2 & 4 \\\\ 3 & k + 2 \\end{pmatrix}$. For which positive value of $k$ does the matrix $M$ fail to have an inverse?

A) $k = 2$
B) $k = 4$
C) $k = 16$
D) $k = \\sqrt{10}$`,
    hint: 'المصفوفة ملهاش معكوس يعني محددها $\\det(M) = 0$!',
  },
  {
    id: 'sq-4',
    title: 'EST II Biology: Cellular Respiration ATP Yield',
    subject: 'biology_est2',
    domain: 'Cellular Energetics',
    difficulty: 'Medium',
    calculator: false,
    questionText: `During eukaryotic aerobic cellular respiration, which specific stage produces the greatest amount of ATP per oxidized glucose molecule, and through what mechanism is this synthesis driven?

A) Glycolysis via substrate-level phosphorylation
B) The Citric Acid Cycle via substrate-level phosphorylation
C) Oxidative Phosphorylation via a chemiosmotic proton gradient across the inner mitochondrial membrane
D) Fermentation via NADH oxidation in the cytosol`,
    hint: 'سلسلة نقل الإلكترون والـ ATP Synthase وقوة الـ Proton Motive Force!',
  },
  {
    id: 'sq-5',
    title: 'EST II Biology: Genetics & Punnett Dihybrid',
    subject: 'biology_est2',
    domain: 'Molecular Genetics & Inheritance',
    difficulty: 'Hard',
    calculator: false,
    questionText: `In pea plants, tall stem ($T$) is dominant over short stem ($t$), and yellow seeds ($Y$) are dominant over green seeds ($y$). Two plants with genotypes $TtYy$ and $ttYy$ are crossed. What fraction of the offspring is expected to be short plants with yellow seeds?

A) $1/16$
B) $3/16$
C) $3/8$
D) $9/16$`,
    hint: 'افصل كل صفة لوحدها: احتمال short (tt) مضروب في احتمال yellow (Y-)!',
  },
];
