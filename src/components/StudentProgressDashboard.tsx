import React, { useState } from 'react';
import { UnitProgress, ExamProgressSummary } from '../types';
import {
  TrendingUp,
  Target,
  Award,
  Zap,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface StudentProgressDashboardProps {
  progress: ExamProgressSummary;
  onSelectUnitToDrill?: (unitName: string, subject: 'math_est1' | 'math_est2' | 'biology_est2') => void;
  onResetProgress?: () => void;
  studentName: string;
}

export const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({
  progress,
  onSelectUnitToDrill,
  onResetProgress,
  studentName,
}) => {
  const [filter, setFilter] = useState<'all' | 'math' | 'biology'>('all');

  const filteredUnits = progress.units.filter((unit) => {
    if (filter === 'math') return unit.subject === 'math';
    if (filter === 'biology') return unit.subject === 'biology';
    return true;
  });

  // Find highest and lowest performing units with at least 1 question
  const attemptedUnits = progress.units.filter((u) => u.questionsSolved > 0);
  const topUnit = attemptedUnits.length > 0
    ? [...attemptedUnits].sort((a, b) => b.accuracy - a.accuracy)[0]
    : null;
  const weakUnit = attemptedUnits.length > 0
    ? [...attemptedUnits].sort((a, b) => a.accuracy - b.accuracy)[0]
    : null;

  return (
    <div className="white-card rounded-3xl p-5 sm:p-7 space-y-6 shadow-sm border border-pink-200">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-pink-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-pink-500" />
            <span>لوحة تقدم وتشخيص دكتورة منة في الـ EST 🌸✨</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-pink-800 flex items-center gap-2">
            <span>مستوى إتقانك ودقة الحل في امتحانات الـ EST</span>
            <span className="text-xs font-normal text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200 hidden sm:inline">خاص بـ {studentName} 🩺</span>
          </h3>
          <p className="text-xs sm:text-sm text-pink-900/70 mt-0.5 font-medium">
            تتبع دقيق لعدد الأسئلة المحلولة ونسب الدقة عبر جميع وحدات الرياضيات والأحياء طبقاً لامتحانات 2020-2026.
          </p>
        </div>

        {onResetProgress && (
          <button
            onClick={() => {
              if (confirm('هل تريدي إعادة ضبط إحصائيات التقدم والبدء من جديد؟')) {
                onResetProgress();
              }
            }}
            className="p-2 text-pink-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs flex items-center gap-1.5 cursor-pointer self-end sm:self-center border border-pink-200"
            title="إعادة ضبط الإحصائيات"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Questions Solved */}
        <div className="pink-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-pink-700 text-xs mb-2 font-bold">
            <span>إجمالي الأسئلة</span>
            <CheckCircle2 className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-pink-800 font-mono">
              {progress.totalSolved}
            </div>
            <div className="text-[11px] text-pink-700/80 mt-1 flex items-center gap-2">
              <span className="text-pink-600 font-bold">رياضيات: {progress.mathSolved}</span>
              <span>·</span>
              <span className="text-rose-600 font-bold">أحياء: {progress.biologySolved}</span>
            </div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="pink-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-pink-700 text-xs mb-2 font-bold">
            <span>متوسط الدقة العام</span>
            <TrendingUp className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-pink-700 font-mono">
              {progress.overallAccuracy}%
            </div>
            <div className="text-[11px] text-pink-700/80 mt-1">
              <span>{progress.totalCorrect} إجابة صحيحة من {progress.totalSolved}</span>
            </div>
          </div>
        </div>

        {/* Estimated EST Scaled Score */}
        <div className="bg-gradient-to-br from-pink-100 via-rose-100 to-white border border-pink-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-pink-800 text-xs mb-2 font-bold">
            <span>الدرجة المتوقعة (EST)</span>
            <Award className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-pink-700 font-mono">
              {progress.estimatedScaledScore} <span className="text-xs text-pink-500 font-normal">/ 800</span>
            </div>
            <div className="text-[11px] text-pink-700 mt-1 font-medium">
              <span>معدل متوقع طبقاً لدقة الحل الحالية 💖</span>
            </div>
          </div>
        </div>

        {/* Focus Unit Indicator */}
        <div className="pink-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-pink-700 text-xs mb-2 font-bold">
            <span>الوحدة الأولى بالتركيز</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            {weakUnit ? (
              <>
                <div className="text-sm font-bold text-pink-800 truncate" title={weakUnit.arabicName}>
                  {weakUnit.arabicName}
                </div>
                <div className="text-[11px] text-pink-700 mt-1 flex items-center justify-between">
                  <span>الدقة: {weakUnit.accuracy}%</span>
                  {onSelectUnitToDrill && (
                    <button
                      onClick={() =>
                        onSelectUnitToDrill(
                          weakUnit.name,
                          weakUnit.subject === 'math'
                            ? weakUnit.subTrack === 'EST II'
                              ? 'math_est2'
                              : 'math_est1'
                            : 'biology_est2'
                        )
                      }
                      className="text-pink-600 hover:text-pink-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>تدريب</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-pink-600">حل اختبار لتحديد أولوياتك</div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Segmented Control & Units List */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-pink-200 shadow-2xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                  : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              جميع الوحدات ({progress.units.length})
            </button>
            <button
              onClick={() => setFilter('math')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filter === 'math'
                  ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                  : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              📐 رياضيات الـ EST (متوسط الدقة: {progress.mathAccuracy}%)
            </button>
            <button
              onClick={() => setFilter('biology')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filter === 'biology'
                  ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                  : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              🧬 أحياء الـ EST II (متوسط الدقة: {progress.biologyAccuracy}%)
            </button>
          </div>

          <div className="text-xs text-pink-700 flex items-center gap-3 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              <span>متقنة (80%+) 🌸</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>متوسطة (60-79%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span>تحتاج تدريب (&lt;60%) 🎀</span>
            </span>
          </div>
        </div>

        {/* Unit Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredUnits.map((unit) => {
            const isMastered = unit.accuracy >= 80;
            const isMedium = unit.accuracy >= 60 && unit.accuracy < 80;
            const isWeak = unit.accuracy < 60 && unit.questionsSolved > 0;

            const barColor = isMastered
              ? 'bg-gradient-to-r from-pink-500 to-rose-500'
              : isMedium
              ? 'bg-amber-400'
              : isWeak
              ? 'bg-rose-500'
              : 'bg-pink-200';

            const textColor = isMastered
              ? 'text-pink-600'
              : isMedium
              ? 'text-amber-600'
              : isWeak
              ? 'text-rose-600'
              : 'text-pink-400';

            return (
              <div
                key={unit.unitId}
                className="white-card hover:border-pink-300 rounded-2xl p-4 transition-all duration-150 space-y-3 shadow-2xs"
              >
                {/* Unit Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-pink-600 font-bold">
                        {unit.subject === 'math' ? '📐 Math' : '🧬 Biology'} · {unit.subTrack}
                      </span>
                      {isMastered && (
                        <span className="text-[10px] text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200 font-semibold">
                          متقنة 🌸
                        </span>
                      )}
                      {isWeak && (
                        <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 font-semibold">
                          بحاجة لتركيز 🎀
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-pink-800 mt-0.5">{unit.arabicName}</h4>
                    <div className="text-[11px] text-pink-500 font-mono">{unit.name}</div>
                  </div>

                  {/* Accuracy Number */}
                  <div className="text-left shrink-0">
                    <div className={`text-xl font-black font-mono ${textColor}`}>
                      {unit.questionsSolved > 0 ? `${unit.accuracy}%` : '—'}
                    </div>
                    <div className="text-[10px] text-pink-500 font-medium">
                      {unit.questionsCorrect}/{unit.questionsSolved} صحيح
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(unit.accuracy, unit.questionsSolved > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="flex items-center justify-between pt-1 border-t border-pink-100 text-xs">
                  <span className="text-pink-600 text-[11px] font-medium">
                    {unit.questionsSolved > 0
                      ? `تم حل ${unit.questionsSolved} سؤالاً في هذا الباب`
                      : 'لم يتم حل أسئلة بعد'}
                  </span>

                  {onSelectUnitToDrill && (
                    <button
                      onClick={() =>
                        onSelectUnitToDrill(
                          unit.name,
                          unit.subject === 'math'
                            ? unit.subTrack === 'EST II'
                              ? 'math_est2'
                              : 'math_est1'
                            : 'biology_est2'
                        )
                      }
                      className="text-pink-600 hover:text-pink-800 font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                    >
                      <Zap className="w-3 h-3 text-pink-500" />
                      <span>تدريب فوري 🌸</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
