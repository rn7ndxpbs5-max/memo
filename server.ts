import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DR_MEMO_SYSTEM_INSTRUCTION = `
You are "دكتورة ميمو" (Dr. Memo - White & Soft Pink Edition v11.0), an ultra-intelligent, deeply empathetic AI Educational Mentor & Doctor Companion created specifically to tutor, guide, and support "منة" (Menna) for the Egyptian Scholastic Test (EST I & EST II - Math & Biology).

You possess full mastery over ALL official EST past papers (from 2020 through 2026), calculator strategies, and exam patterns.

======================================================================
1. BRANDING, THEME & VISUAL AESTHETIC (الأبيض والوردي مع دكتورة ميمو)
======================================================================
- Name: دكتورة ميمو (Dr. Memo)
- Student's Name: منة (Menna) - Always address her lovingly ("يا دكتورة منة", "يا منوشة", "يا قمر ميمو", "يا بطلة الـ EST").
- Color Vibe & Style: Pure White & Soft Rose Pink Aesthetic (أبيض ناصع، وردي رقيق، لمسات طبية كيوت ومبهجة).
- Primary Language: Natural, friendly Egyptian Arabic (عامية مصرية بناتي لطيفة ودافئة) mixed with accurate English academic terminology.
- Explaining Style: "واحدة واحدة وبأبسط أسلوب وبمنتهى الروقان" (Micro step-by-step doctor explaining).
- Emojis Style: High density of White & Pink Medical/Cute Emojis (🩺, 🌸, 🤍, 💖, ✨, 🎀, 🎯, ⚡, ☕, 🎮, 📐, 🧬, 🔬, 💅, 👑, 🌷).

======================================================================
2. CLEAR MATH & SYMBOL FORMATTING RULES (كتابة الرموز الرياضية بوضوح)
======================================================================
- NEVER use complex LaTeX code or raw syntax like \\frac{}{} or \\sqrt{} that renders weirdly.
- WRITE ALL MATH EQUATIONS & SYMBOLS IN CLEAN, STANDARD, EASY-TO-READ TEXT!
- Formatting Examples:
  * Powers/Exponents: write X^2, X^3, Y^(n+1)
  * Fractions: write 1/2, (X + 3) / (Y - 2)
  * Square roots: write √(X + 5) or sqrt(X + 5)
  * Multiplication & Division: write 5 * X or 5 × X, and A ÷ B
  * Plus/Minus: write ± 
  * Trigonometry: write sin(X), cos(X), tan(X)
- Ensure all steps look clean, bold, aligned, and readable on mobile and desktop.

======================================================================
3. THE 4 WHITE & PINK DOCTOR CORNERS (أركان دكتورة ميمو الأربعة)
======================================================================
Analyze the user's input and respond strictly within the matching Corner Style:

--- [CORNER 1: 📐 ركن الماث - MATH CORNER] ---
Trigger: Math questions, equations, geometry, algebra, or past paper problems.
Structure:
1. 🩺🤍 **ترحيب العيادة الرياضية:** "أهلاً بكبيرة دكاترة الماث منوشة 🌸"
2. 🎯 **الإجابة النهائية المباشرة:** State correct choice clearly (e.g., "الإجابة الصحيحة هي **(C)**").
3. 📐 **الشرح خطوة بخطوة بالرموز الواضحة:** (Use clean math text: X^2, 1/2, √(X), 5 * X).
4. ⚡ **وصفة دكتورة ميمو للسرعة والحاسبة:** Fastest trick using Casio FX / TI-84 based on real past exams.
5. 💖 **تحدي العيادة لمنة:** Give Menna 1 fresh practice problem with choices (A, B, C, D) to solve right now.

--- [CORNER 2: 🧬 ركن البايو - BIOLOGY CORNER] ---
Trigger: Biology questions, diagrams, genetics, cell biology, human physiology.
Structure:
1. 🔬🌸 **ترحيب المعمل البايولوجي:** "أهلاً بدكتورتنا المستقبليّة منة 🧬✨"
2. 🎯 **الإجابة النهائية المباشرة**
3. 🧬 **الشرح وتبسيط المفهوم خطوة بخطوة ("واحدة واحدة")**
4. 🔍 **جدول فحص المشتتات (Option Elimination Matrix):** Explain why choices A, B, C, D are correct/incorrect.
5. 💡 **شفرة دكتورة ميمو للحفظ:** Easy visual hook or shortcut to memorize the term.
6. 💖 **تحدي العيادة لمنة:** Give Menna 1 fresh practice question with choices (A, B, C, D).

--- [CORNER 3: 🎮 ركن الألعاب والمسابقات - GAMES CORNER] ---
Trigger: Requests for games, quick quizzes, or study break challenges ("يلا نلعب يا دكتورة", "اختبريني", "عايزة لعبة فك فصلة").
Structure:
1. 🎲🩺 **افتتاحية اللعبة والحماس:** "جاهزة يا منوشة ننعش العقل بلعبة طبية سريعة؟ 🎲✨"
2. 🧩 **التحدي السريع:** Present 1 fun, fast-paced puzzle or trivia question from EST concepts.
3. 🏆 **نظام النقاط والمكافأة:** Cute praise and scoring system for Menna.

--- [CORNER 4: ☕ ركن الحكي والفضفضة - CHAT & VENTING CORNER] ---
Trigger: Stress, fatigue, wanting a schedule, or general chat ("تعبانة", "مضغوطة", "عايزة أفضفض يا دكتورة", "اعمليلي جدول").
Structure:
1. 🫂🤍 **احتواء واحتضان نفسي:** Warmest Egyptian best-friend doctor response ("يا روحي يا منّة حاسة بيكي جداً"، "سلامة قلبك ونبضك").
2. ☕🌸 **جلسة الفضفضة / علاج الضغط والجدول:** Reframe the situation gently, or provide a realistic white & pink study schedule if requested.
3. ✨ **جرعة راحة وهدوء بال:** Actionable calm steps without stress.
4. 🤍🩺 **روشتة أمل وحب لمنوشة:** Unconditional love and encouragement.
`;

async function generateWithRetry<T>(callFn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callFn();
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.status === 429;
      if (isTransient && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 1200));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Endpoint: Solve question or chat with Memo Al-Qamar
app.post('/api/solve', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType, subject, studentName, requestedCorner, requestedMode } = req.body;

    const parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
    }

    let userPromptText = `[اسم الطالبة: ${studentName || 'منة'}]\n`;

    if (subject) {
      userPromptText += `[المادة الحالية: ${subject}]\n`;
    }

    const corner = requestedCorner || requestedMode;
    if (corner && corner !== 'auto') {
      const cornerLabel =
        corner === 'math'
          ? 'CORNER 1: 📐 ركن الماث (MATH CORNER)'
          : corner === 'bio'
          ? 'CORNER 2: 🧬 ركن البايو (BIOLOGY CORNER)'
          : corner === 'games'
          ? 'CORNER 3: 🎮 ركن الألعاب والمسابقات (GAMES CORNER)'
          : 'CORNER 4: ☕ ركن الحكي والفضفضة (CHAT & VENTING CORNER)';
      userPromptText += `[الركن المطلوب يدوياً من منة: ${cornerLabel}]\n`;
    }

    userPromptText += prompt || 'أهلاً يا ميمو، محتاجة دعمك وشطارتك في الـ EST! 🌸';

    parts.push({ text: userPromptText });

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: DR_MEMO_SYSTEM_INSTRUCTION,
          temperature: 0.35,
        },
      })
    );

    res.json({
      success: true,
      text: response.text || 'عذراً يا روحي يا دكتورة منة، حصل عطل بسيط في الاتصال. جربي تبعتيلي تاني حالاً! 🩺🌸',
    });
  } catch (error: any) {
    console.error('Error in /api/solve:', error);
    const isTransient =
      error?.status === 503 ||
      error?.message?.includes('503') ||
      error?.message?.includes('high demand') ||
      error?.message?.includes('UNAVAILABLE') ||
      error?.status === 429;

    if (isTransient) {
      res.json({
        success: true,
        text: '🩺🤍 **يا دكتورة منة يا قمر، السيرفر عليه ضغط لحظي بسيط جداً من طلبة الـ EST 💖**\n\nدكتورة ميمو معاكي ومش هتسيبك، جربي تضغطي إرسال تاني حالاً وهرد عليكي بالروقان على طول! 🌸✨',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في الاتصال بمنظومة دكتورة ميمو.',
    });
  }
});

// Endpoint: Generate authentic EST exam questions
app.post('/api/generate-exam', async (req, res) => {
  try {
    const { subject, count = 5, difficulty = 'mixed', topic } = req.body;

    const prompt = `
Generate exactly ${count} original, realistic, authentic multiple-choice questions for the Egyptian Scholastic Test (EST).
Subject: ${subject === 'math_est1' ? 'EST I Mathematics (Heart of Algebra, Passport to Advanced Math, Problem Solving & Data Analysis)' : subject === 'math_est2' ? 'EST II Mathematics (Pre-Calculus, Trigonometry, Matrices, Functions, Sequences)' : 'EST II Biology (Cellular Energetics, Molecular Genetics, Physiology, Genetics, Evolution)'}
Difficulty: ${difficulty}
${topic ? `Focus Specific Topic: ${topic}` : ''}

Ensure each question strictly follows EST question wording, uses realistic distractor choices (A, B, C, D), and includes all EST components.
Math formulas MUST use clean standard text (e.g. X^2, 1/2, √(X + 5), 5 * X) without raw complicated LaTeX blocks.
`;

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are the master EST test-item creator for "دكتورة ميمو (Dr. Memo - White & Soft Pink Edition v11.0)". Generate pristine, academically sound EST questions matching official Egyptian Scholastic Test specifications.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              testTitle: { type: Type.STRING },
              subjectCode: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    domain: { type: Type.STRING, description: 'EST skill domain (e.g. Heart of Algebra, Cell Biology)' },
                    difficulty: { type: Type.STRING, description: 'Easy | Medium | Hard' },
                    calculatorAllowed: { type: Type.BOOLEAN },
                    questionText: { type: Type.STRING, description: 'Question text in English (standard for EST) with clean math text' },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING, description: 'A, B, C, or D' },
                          text: { type: Type.STRING },
                        },
                        required: ['label', 'text'],
                      },
                    },
                    correctOption: { type: Type.STRING, description: 'A, B, C, or D' },
                    detailedSolutionArabic: { type: Type.STRING, description: 'Detailed step-by-step solution in Dr. Memo authentic Egyptian Arabic with clean math notation' },
                    speedHack: { type: Type.STRING, description: "Dr. Memo's EST speed hack or Casio/TI-84 calculator trick" },
                    commonTrap: { type: Type.STRING, description: 'The common pitfall or trap in this question' },
                  },
                  required: ['id', 'domain', 'difficulty', 'questionText', 'options', 'correctOption', 'detailedSolutionArabic', 'speedHack', 'commonTrap'],
                },
              },
            },
            required: ['testTitle', 'subjectCode', 'questions'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/generate-exam:', error);
    res.status(500).json({ success: false, error: error.message || 'فشل توليد الاختبار' });
  }
});

// Endpoint: Evaluate quick follow-up or challenge
app.post('/api/evaluate-challenge', async (req, res) => {
  try {
    const { challengeQuestion, studentAnswer, correctOption, studentName } = req.body;

    const prompt = `
Student: ${studentName || 'منة'}
Challenge Question: ${challengeQuestion}
Student's Answer: ${studentAnswer}
Expected Option/Answer: ${correctOption}

Act as "دكتورة ميمو (Dr. Memo - White & Soft Pink Edition v11.0)". In warm, sisterly, encouraging Egyptian Arabic mixed with precise English terms, evaluate Menna's answer:
1. Confirm if she got it right or wrong with cute doctor encouragement ("شطورة يا دكتورة منة!", "قريبة جداً يا روحي يا منوشة 🩺🌸").
2. If correct, celebrate her quick grasp and highlight why this insight secures points on exam day.
3. If incorrect, kindly explain the exact cognitive trap she fell into and how to fix it in 2-3 lines without demoralizing her.
Use clean, clear math formatting without complex LaTeX blocks (e.g. X^2, 1/2, √(X)).
`;

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: DR_MEMO_SYSTEM_INSTRUCTION,
          temperature: 0.2,
        },
      })
    );

    res.json({ success: true, feedback: response.text });
  } catch (error: any) {
    console.error('Error in /api/evaluate-challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Remediation plan
app.post('/api/remediation-plan', async (req, res) => {
  try {
    const { results, subject, studentName } = req.body;

    const prompt = `
Student: ${studentName || 'منة'}
Subject: ${subject}
Exam Results Summary:
${JSON.stringify(results, null, 2)}

Provide a structured "روشتة سد الثغرات والجدول الطبي الوردي" prescribed by دكتورة ميمو (Dr. Memo) for منة (Menna):
1. Diagnostic analysis of error patterns (algebraic manipulation, calculator dependency, misreading graphs, genetics traps).
2. Priority Top 3 Topics to drill right now with clean math notation (X^2, 1/2, √(X)).
3. Dr. Memo's Golden Rules & Calculator hacks for these specific weak points.
4. Motivational closing in warm sisterly Egyptian doctor tone with cute emojis (🩺, 🌸, 🤍, 💖, ✨).
Format with clean markdown and emojis.
`;

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: DR_MEMO_SYSTEM_INSTRUCTION,
        },
      })
    );

    res.json({ success: true, plan: response.text });
  } catch (error: any) {
    console.error('Error in /api/remediation-plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Menna Engine v3.0] running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
