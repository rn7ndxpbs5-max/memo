import React, { useState, useEffect } from 'react';
import { SolverChatView } from './components/SolverChatView';
import { ExamSimulatorView } from './components/ExamSimulatorView';
import { FormulaVaultView } from './components/FormulaVaultView';
import { ScratchpadModal } from './components/ScratchpadModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  PenTool,
  Award,
  User,
  GraduationCap,
  Calculator,
  Dna,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'solver' | 'exam' | 'vault'>('solver');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Student profile state (defaulting lovingly to Menna)
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('menna_student_name') || 'منة';
  });

  const [targetScore, setTargetScore] = useState<number>(() => {
    return Number(localStorage.getItem('menna_target_score')) || 760;
  });

  const [targetExam, setTargetExam] = useState<string>(() => {
    return localStorage.getItem('menna_target_exam') || 'EST I & EST II (Math & Bio)';
  });

  useEffect(() => {
    localStorage.setItem('menna_student_name', studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('menna_target_score', String(targetScore));
  }, [targetScore]);

  useEffect(() => {
    localStorage.setItem('menna_target_exam', targetExam);
  }, [targetExam]);

  return (
    <div className="min-h-screen bg-[var(--bg-soft-pink)] text-[var(--text-dark)] flex flex-col font-['Cairo','Segoe_UI',sans-serif] selection:bg-pink-200 selection:text-pink-900">
      {/* الهيدر العلوي: أبيض مع لمسات وردية */}
      <header className="white-card px-4 sm:px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Persona Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xl border border-pink-200 shadow-sm shrink-0">
              🩺
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-pink-700">دكتورة ميمو</h1>
                <span className="text-[11px] bg-pink-100 text-pink-600 px-2.5 py-0.5 rounded-full border border-pink-200 font-bold">
                  خاص بـ منة فقط 🌸
                </span>
              </div>
              <p className="text-[11px] text-pink-900/60 hidden sm:block">
                مساعدتك الشخصية لاختبارات EST (Math & Biology)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 p-1 bg-white border border-pink-200/80 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab('solver')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'solver'
                  ? 'bg-[var(--primary-rose)] text-white shadow-sm'
                  : 'text-pink-800/80 hover:bg-pink-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>أركان دكتورة ميمو 🩺🌸</span>
            </button>

            <button
              onClick={() => setActiveTab('exam')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'exam'
                  ? 'bg-[var(--primary-rose)] text-white shadow-sm'
                  : 'text-pink-800/80 hover:bg-pink-50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">محاكي الـ EST</span>
              <span className="sm:hidden">الامتحانات</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'vault'
                  ? 'bg-[var(--primary-rose)] text-white shadow-sm'
                  : 'text-pink-800/80 hover:bg-pink-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خزينة القوانين</span>
              <span className="sm:hidden">القوانين</span>
            </button>
          </nav>

          {/* Student Profile, Status & Scratchpad */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pink-200 rounded-full text-xs text-pink-700 font-medium">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
              <span>جاهزة لمنوشة 🤍</span>
            </div>

            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="btn-pink-secondary p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="مسودة الحل السريع"
            >
              <PenTool className="w-3.5 h-3.5 text-pink-600" />
              <span className="hidden md:inline">مسودة الحسابات</span>
            </button>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="btn-pink-secondary p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
              <span className="font-bold text-pink-700">{studentName}</span>
              <span className="text-[11px] text-pink-500 font-mono hidden sm:inline">🎯 {targetScore}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-3 sm:p-5 lg:p-6">
        {activeTab === 'solver' && <SolverChatView studentName={studentName} />}
        {activeTab === 'exam' && <ExamSimulatorView studentName={studentName} />}
        {activeTab === 'vault' && <FormulaVaultView />}
      </main>

      {/* Modals */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        studentName={studentName}
        onSaveName={setStudentName}
        targetScore={targetScore}
        onSaveTargetScore={setTargetScore}
        targetExam={targetExam}
        onSaveTargetExam={setTargetExam}
      />
    </div>
  );
}
