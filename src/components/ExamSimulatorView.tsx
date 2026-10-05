import React, { useState, useEffect, useRef } from 'react';
import { SubjectType, ESTQuestion, ExamSession, UnitProgress } from '../types';
import { MathMarkdown } from './MathMarkdown';
import { ScratchpadModal } from './ScratchpadModal';
import { StudentProgressDashboard } from './StudentProgressDashboard';
import {
  INITIAL_UNITS,
  calculateProgressSummary,
  updateProgressWithExamResults,
} from '../data/defaultProgress';
import confetti from 'canvas-confetti';
import {
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PenTool,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  BarChart3,
  Sliders,
} from 'lucide-react';

interface ExamSimulatorViewProps {
  studentName: string;
}

export const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({ studentName }) => {
  const [subject, setSubject] = useState<SubjectType>('math_est1');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'mixed' | 'medium' | 'hard'>('mixed');
  const [topicFocus, setTopicFocus] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // View mode when not in exam: 'dashboard' or 'config' or combined
  const [activeViewMode, setActiveViewMode] = useState<'dashboard' | 'config'>('dashboard');
  const configSectionRef = useRef<HTMLDivElement | null>(null);

  // Student progress state with localStorage
  const [unitsProgress, setUnitsProgress] = useState<UnitProgress[]>(() => {
    try {
      const saved = localStorage.getItem('menna_student_progress_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading progress from localStorage', e);
    }
    return INITIAL_UNITS;
  });

  const progressSummary = calculateProgressSummary(unitsProgress);

  const handleResetProgress = () => {
    // Reset to fresh baseline
    const freshUnits = INITIAL_UNITS.map((u) => ({
      ...u,
      questionsSolved: 0,
      questionsCorrect: 0,
      accuracy: 0,
    }));
    setUnitsProgress(freshUnits);
    localStorage.setItem('menna_student_progress_v1', JSON.stringify(freshUnits));
  };

  const handleDrillUnit = (unitName: string, drillSubject: SubjectType) => {
    setSubject(drillSubject);
    setTopicFocus(unitName);
    setActiveViewMode('config');
    setTimeout(() => {
      configSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Timer countdown
  useEffect(() => {
    if (!activeSession || activeSession.completed || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.completed, timeRemaining]);

  // Start new exam session
  const handleStartExam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          count: questionCount,
          difficulty,
          topic: topicFocus.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data?.questions) {
        throw new Error(json.error || 'فشل تحميل أسئلة الاختبار');
      }

      const questions: ESTQuestion[] = json.data.questions;
      // Allocated time: 1.5 minutes per question
      const totalSeconds = questions.length * 90;

      setActiveSession({
        id: `est-exam-${Date.now()}`,
        title: json.data.testTitle || 'اختبار EST تجريبي تدريبي',
        subject,
        questions,
        userAnswers: {},
        timeSpentSeconds: 0,
        completed: false,
      });

      setCurrentQuestionIndex(0);
      setTimeRemaining(totalSeconds);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إعداد الاختبار');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionLabel: string) => {
    if (!activeSession || activeSession.completed) return;
    setActiveSession({
      ...activeSession,
      userAnswers: {
        ...activeSession.userAnswers,
        [questionId]: optionLabel,
      },
    });
  };

  const handleSubmitExam = async () => {
    if (!activeSession || activeSession.completed) return;

    // Calculate score
    let correctCount = 0;
    const resultsSummary: any[] = [];

    activeSession.questions.forEach((q) => {
      const userChoice = activeSession.userAnswers[q.id];
      const isCorrect = userChoice === q.correctOption;
      if (isCorrect) correctCount++;

      resultsSummary.push({
        domain: q.domain,
        difficulty: q.difficulty,
        question: q.questionText.slice(0, 100),
        userChoice: userChoice || 'Unanswered',
        correctChoice: q.correctOption,
        isCorrect,
      });
    });

    const percent = Math.round((correctCount / activeSession.questions.length) * 100);

    if (percent >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Update student progress statistics across Math & Biology units
    const questionsForProgress = activeSession.questions.map((q) => ({
      domain: q.domain,
      isCorrect: activeSession.userAnswers[q.id] === q.correctOption,
    }));
    const newUnitsProgress = updateProgressWithExamResults(
      unitsProgress,
      questionsForProgress,
      activeSession.subject
    );
    setUnitsProgress(newUnitsProgress);
    try {
      localStorage.setItem('menna_student_progress_v1', JSON.stringify(newUnitsProgress));
    } catch (e) {
      console.error('Error saving updated progress', e);
    }

    const updatedSession: ExamSession = {
      ...activeSession,
      completed: true,
      score: percent,
    };
    setActiveSession(updatedSession);

    // Generate Menna's Remediation Plan
    setGeneratingPlan(true);
    try {
      const planRes = await fetch('/api/remediation-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          subject: activeSession.subject,
          results: resultsSummary,
        }),
      });
      const planJson = await planRes.json();
      if (planJson.success) {
        setActiveSession((prev) => (prev ? { ...prev, remediationPlan: planJson.plan } : null));
      }
    } catch (e) {
      console.error('Failed to generate remediation plan', e);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If no active session, show dashboard and setup configuration
  if (!activeSession) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-pink-50 via-rose-50/60 to-white border border-pink-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>محاكي اختبارات الـ EST الذكي ولوحة التقدم لدكتورة منة 🌸✨</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-pink-800">
                منظومة التدريب والتشخيص لـ EST I & EST II
              </h2>
              <p className="text-pink-900/70 text-sm mt-1 leading-relaxed font-medium">
                راقبي تقدمك ودقتك في كل وحدة من وحدات الرياضيات والأحياء، واستخرجي اختبارات تشخيصية مخصصة فوراً لمعالجة نقاط الضعف مع دكتورة ميمو.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-pink-200 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveViewMode('dashboard')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'dashboard'
                    ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                    : 'text-pink-700 hover:bg-pink-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>لوحة التقدم والوحدات 🌸</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewMode('config')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewMode === 'config'
                    ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                    : 'text-pink-700 hover:bg-pink-50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>إنشاء اختبار جديد ✨</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Visual Student Progress Dashboard */}
        {activeViewMode === 'dashboard' && (
          <div className="space-y-6">
            <StudentProgressDashboard
              progress={progressSummary}
              onSelectUnitToDrill={handleDrillUnit}
              onResetProgress={handleResetProgress}
              studentName={studentName}
            />

            {/* Quick banner to jump to test builder */}
            <div className="pink-card rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-pink-200">
              <div>
                <h4 className="text-base font-bold text-pink-800 flex items-center gap-2">
                  <span>مستعدة لاختبار تدريبي جديد يا دكتورة منة؟ 🩺🌸</span>
                </h4>
                <p className="text-xs text-pink-700/80 mt-0.5 font-medium">
                  اختاري عدد الأسئلة والصعوبة وستقوم دكتورة ميمو ببناء اختبار EST أصلي مطابق تماماً للامتحانات الرسمية 2020-2026.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewMode('config')}
                className="btn-pink-primary px-5 py-2.5 font-black text-xs rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>تخصيص وبدء اختبار الآن ✨</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode 2: Test Configuration Card */}
        {activeViewMode === 'config' && (
          <div
            ref={configSectionRef}
            className="white-card rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-sm border border-pink-200"
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-lg font-bold text-pink-800 flex items-center gap-2">
                <span>🩺</span>
                <span>تخصيص الاختبار التدريبي للـ EST مع دكتورة ميمو</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveViewMode('dashboard')}
                className="text-xs text-pink-600 hover:text-pink-800 flex items-center gap-1 cursor-pointer font-bold"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>العودة للوحة الإحصائيات</span>
              </button>
            </div>

            {/* Subject selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-pink-700">اختاري المادة والاختبار:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'math_est1', title: 'EST I Mathematics', desc: 'Heart of Algebra & Advanced Math' },
                  { id: 'math_est2', title: 'EST II Mathematics', desc: 'Pre-Calc, Trig & Matrices' },
                  { id: 'biology_est2', title: 'EST II Biology', desc: 'Genetics, Physiology & Respiration' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubject(s.id as SubjectType)}
                    className={`p-4 rounded-2xl text-right transition-all cursor-pointer border ${
                      subject === s.id
                        ? 'bg-pink-100/90 border-[var(--primary-rose)] text-pink-900 shadow-xs ring-1 ring-[var(--primary-rose)] font-bold'
                        : 'bg-white border-pink-200 text-pink-700 hover:bg-pink-50'
                    }`}
                  >
                    <div className="font-bold text-sm text-pink-800">
                      {s.title}
                    </div>
                    <div className="text-xs text-pink-600/70 mt-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question count & difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-pink-700">عدد الأسئلة:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { count: 5, label: '5 أسئلة (تدريب سريع - 7.5 د)' },
                    { count: 10, label: '10 أسئلة (محاكي كامل - 15 د)' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setQuestionCount(item.count)}
                      className={`py-3 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                        questionCount === item.count
                          ? 'bg-[var(--primary-rose)] border-[var(--primary-rose)] text-white shadow-xs'
                          : 'bg-white border-pink-200 text-pink-700 hover:bg-pink-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-pink-700">مستوى الصعوبة:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'medium', label: 'متوسط' },
                    { id: 'hard', label: 'متقدم / صعب' },
                    { id: 'mixed', label: 'مختلط (رسمي)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficulty(item.id as any)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold cursor-pointer transition-all border text-center ${
                        difficulty === item.id
                          ? 'bg-[var(--primary-rose)] border-[var(--primary-rose)] text-white shadow-xs'
                          : 'bg-white border-pink-200 text-pink-700 hover:bg-pink-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Focus topic input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-pink-700">
                تركيز على موضوع محدد (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثال: Quadratic Equations, Punnett Squares, Matrix Determinants..."
                value={topicFocus}
                onChange={(e) => setTopicFocus(e.target.value)}
                className="w-full bg-white border border-pink-200 rounded-xl px-4 py-2.5 text-xs text-pink-900 placeholder-pink-300 focus:outline-none focus:border-pink-500 shadow-2xs"
              />
            </div>

            {/* Start button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleStartExam}
              className="btn-pink-primary w-full py-4 rounded-2xl font-black text-base shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>دكتورة ميمو تعد الآن أسئلة الاختبار الأصلية لمنوشة... 🩺🌸✨</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>ابدأي الاختبار الآن يا دكتورة {studentName || 'منة'} 💖🩺</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Active or Completed Exam View
  const currentQ = activeSession.questions[currentQuestionIndex];
  const userSelected = activeSession.userAnswers[currentQ?.id];

  return (
    <div className="space-y-6">
      {/* Top Bar: Progress, Timer, Scratchpad */}
      <div className="white-card border border-pink-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-bold text-pink-800 text-base">{activeSession.title}</span>
          <span className="text-xs text-pink-700 bg-pink-100 px-2.5 py-1 rounded-full border border-pink-200 font-bold">
            {activeSession.subject === 'math_est1'
              ? 'EST I Math'
              : activeSession.subject === 'math_est2'
              ? 'EST II Math'
              : 'EST II Biology'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Scratchpad Button */}
          <button
            onClick={() => setIsScratchpadOpen(true)}
            className="btn-pink-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <PenTool className="w-3.5 h-3.5 text-pink-600" />
            <span>مسودة الحسابات</span>
          </button>

          {/* Timer */}
          {!activeSession.completed && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs ${
                timeRemaining < 120
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-pink-100 text-pink-700 border border-pink-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-pink-600" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          )}

          {/* Exit / Reset */}
          <button
            onClick={() => {
              if (confirm('هل أنتِ متأكدة من الخروج من هذا الاختبار يا دكتورة منة؟')) {
                setActiveSession(null);
              }
            }}
            className="p-1.5 text-pink-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-xs"
            title="إنهاء والعودة للبداية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* If Completed: Display Results & Remediation Plan */}
      {activeSession.completed ? (
        <div className="space-y-6">
          {/* Score Header */}
          <div className="white-card border border-pink-200 rounded-3xl p-6 sm:p-8 text-center space-y-3 bg-gradient-to-r from-pink-50 via-rose-50/70 to-white shadow-sm">
            <Award className="w-12 h-12 text-pink-500 mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-black text-pink-800">
              نتيجة تقييم الـ EST: {activeSession.score}%
            </h2>
            <p className="text-pink-900/80 text-sm max-w-xl mx-auto font-medium">
              أحسنتِ يا دكتورة {studentName || 'منة'} على إتمام الاختبار! راجعي تحليل كل سؤال بالأسفل مع زتونة الحل وسرعة الآلة الحاسبة، بالإضافة إلى خطة سد الثغرات التي أعدتها دكتورة ميمو خصيصاً لكِ. 🩺🌸
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveSession(null);
                  setActiveViewMode('dashboard');
                }}
                className="btn-pink-secondary px-5 py-2.5 font-bold text-xs rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
              >
                <BarChart3 className="w-4 h-4 text-pink-600" />
                <span>عرض لوحة التقدم والوحدات المحدثة</span>
              </button>
              <button
                onClick={() => {
                  setActiveSession(null);
                  setActiveViewMode('config');
                }}
                className="btn-pink-primary px-5 py-2.5 font-bold text-xs rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>بدء اختبار جديد 🌸</span>
              </button>
            </div>
          </div>

          {/* Remediation Plan Card */}
          <div className="white-card border border-pink-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-pink-700 font-extrabold text-base">
              <BookOpen className="w-5 h-5 text-pink-600" />
              <span>خطة سد الثغرات المخصصة من دكتورة ميمو (Weak Point Remediation Plan) 🩺🌸</span>
            </div>

            {generatingPlan ? (
              <div className="py-6 text-center space-y-2 text-pink-600">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold">دكتورة ميمو تحلل أخطاءك وتبني خطتك بالروقان الآن...</p>
              </div>
            ) : activeSession.remediationPlan ? (
              <div className="text-pink-950 text-xs sm:text-sm">
                <MathMarkdown content={activeSession.remediationPlan} />
              </div>
            ) : (
              <p className="text-xs text-pink-600">جاري إعداد خطة المراجعة...</p>
            )}
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="font-bold text-pink-800 text-base">مراجعة الأسئلة تفصيلياً مع دكتورة ميمو:</h3>
            {activeSession.questions.map((q, idx) => {
              const userAns = activeSession.userAnswers[q.id];
              const isCorrect = userAns === q.correctOption;

              return (
                <div
                  key={q.id}
                  className={`white-card rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm border ${
                    isCorrect ? 'border-emerald-300' : 'border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-pink-100 text-pink-700 border border-pink-200">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-pink-600 font-bold">{q.domain}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {isCorrect ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>إجابة صحيحة 🌸</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          <span>إجابة خاطئة (إجابتك: {userAns || 'لم تُجب'})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-pink-950 text-sm font-medium">
                    <MathMarkdown content={q.questionText} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => {
                      const isOptionCorrect = opt.label === q.correctOption;
                      const isUserOption = opt.label === userAns;

                      return (
                        <div
                          key={opt.label}
                          className={`p-3 rounded-xl border flex items-start gap-2 ${
                            isOptionCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : isUserOption
                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                              : 'bg-white border-pink-100 text-pink-900'
                          }`}
                        >
                          <span className="font-mono font-bold">{opt.label})</span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution & Hack Breakdown */}
                  <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-4 text-xs space-y-2">
                    <div className="text-pink-700 font-bold">شرح دكتورة ميمو الأكاديمي 🩺:</div>
                    <MathMarkdown content={q.detailedSolutionArabic} />

                    <div className="pt-2 border-t border-pink-200/60 text-pink-800 font-bold">
                      ⚡ وصفة دكتورة ميمو للسرعة والحاسبة: <span className="font-medium text-pink-900">{q.speedHack}</span>
                    </div>

                    <div className="text-rose-700 font-bold">
                      ❌ مصيدة واضع الاختبار: <span className="font-medium text-rose-900">{q.commonTrap}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Test in progress */
        <div className="space-y-6">
          {/* Question Navigation Bubbles */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {activeSession.questions.map((q, idx) => {
              const isAnswered = !!activeSession.userAnswers[q.id];
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[var(--primary-rose)] text-white ring-2 ring-pink-300 shadow-xs'
                      : isAnswered
                      ? 'bg-pink-100 text-pink-700 border border-pink-300'
                      : 'bg-white text-pink-500 border border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Card */}
          <div className="white-card border border-pink-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full border border-pink-200">
                  سؤال {currentQuestionIndex + 1} من {activeSession.questions.length}
                </span>
                <span className="text-xs text-pink-600 font-medium">{currentQ.domain}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-pink-600">الصعوبة:</span>
                <span
                  className={`font-bold ${
                    currentQ.difficulty === 'Hard'
                      ? 'text-rose-600'
                      : currentQ.difficulty === 'Medium'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {currentQ.difficulty}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-pink-950 text-base sm:text-lg font-medium leading-relaxed" dir="ltr">
              <MathMarkdown content={currentQ.questionText} />
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = userSelected === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelectOption(currentQ.id, opt.label)}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-pink-100/90 border-[var(--primary-rose)] text-pink-900 shadow-xs ring-1 ring-[var(--primary-rose)] font-bold'
                        : 'bg-white border-pink-200 text-pink-800 hover:bg-pink-50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[var(--primary-rose)] text-white' : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-pink-100">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="btn-pink-secondary px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                السابق
              </button>

              {currentQuestionIndex < activeSession.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="btn-pink-primary px-6 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  التالي
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="btn-pink-primary px-6 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  تسليم الاختبار وإنهاء التقييم 🌸
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Digital Scratchpad Drawer */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        title="مسودة الـ EST للحسابات والرسومات"
      />
    </div>
  );
};
