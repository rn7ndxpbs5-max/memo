import React, { useState } from 'react';
import { X, Target, User, Sparkles, Check } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onSaveName: (name: string) => void;
  targetScore: number;
  onSaveTargetScore: (score: number) => void;
  targetExam: string;
  onSaveTargetExam: (exam: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onSaveName,
  targetScore,
  onSaveTargetScore,
  targetExam,
  onSaveTargetExam,
}) => {
  const [tempName, setTempName] = useState(studentName);
  const [tempScore, setTempScore] = useState(targetScore);
  const [tempExam, setTempExam] = useState(targetExam);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveName(tempName.trim() || 'يا بطل');
    onSaveTargetScore(tempScore);
    onSaveTargetExam(tempExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/30 backdrop-blur-xs">
      <div className="white-card border border-pink-200 rounded-3xl w-full max-w-md p-6 sm:p-7 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2 text-pink-800 font-bold text-base">
            <User className="w-5 h-5 text-pink-600" />
            <span>ملف دكتورة منة وهدف الدرجة مع دكتورة ميمو 🩺🌸👑</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-pink-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-pink-800 font-bold">اسمك (عشان دكتورة ميمو تناديكي بيه بدفء):</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="مثال: منة، منوشة، دكتورة منة..."
              className="w-full bg-pink-50/70 border border-pink-200 rounded-xl px-4 py-2.5 text-pink-900 placeholder-pink-300 focus:outline-none focus:border-pink-500 shadow-2xs"
            />
          </div>

          {/* Target Score */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-pink-800 font-bold">
              <span>الدرجة المستهدفة في الـ EST:</span>
              <span className="text-pink-700 font-mono font-bold text-base">{tempScore} / 800 🎯</span>
            </div>
            <input
              type="range"
              min="500"
              max="800"
              step="10"
              value={tempScore}
              onChange={(e) => setTempScore(Number(e.target.value))}
              className="w-full accent-[var(--primary-rose)] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-pink-600/70 font-mono">
              <span>500</span>
              <span>650</span>
              <span>720 (طب وهندسة)</span>
              <span>800 (Full Mark 💖)</span>
            </div>
          </div>

          {/* Target Exam Focus */}
          <div className="space-y-1.5">
            <label className="text-pink-800 font-bold">المسار الأكاديمي الحالي:</label>
            <select
              value={tempExam}
              onChange={(e) => setTempExam(e.target.value)}
              className="w-full bg-pink-50/70 border border-pink-200 rounded-xl px-4 py-2.5 text-pink-900 focus:outline-none focus:border-pink-500 shadow-2xs"
            >
              <option value="EST I & EST II (Math & Bio)">EST I & EST II (علمي علوم / رياضة)</option>
              <option value="EST I Math Only">EST I Math فقط</option>
              <option value="EST II Math (Pre-Calc & Matrices)">EST II Math فقط</option>
              <option value="EST II Biology">EST II Biology فقط</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="btn-pink-primary w-full py-3 font-black rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>حفظ البيانات ومتابعة التدريب يا دكتورة منة 🌸</span>
        </button>
      </div>
    </div>
  );
};
