import React, { useState, useMemo } from 'react';
import { FORMULA_VAULT } from '../data/formulaVault';
import { FormulaCard } from '../types';
import katex from 'katex';
import { Search, Sparkles, AlertTriangle, Lightbulb, Copy, Check } from 'lucide-react';

export const FormulaVaultView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'math' | 'biology' | 'calculator'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCards = useMemo(() => {
    return FORMULA_VAULT.filter((card) => {
      // Tab filter
      if (activeTab === 'math' && card.subject !== 'math') return false;
      if (activeTab === 'biology' && card.subject !== 'biology') return false;
      if (activeTab === 'calculator' && card.category !== 'calculator_hacks') return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        card.title.toLowerCase().includes(q) ||
        card.arabicTitle.toLowerCase().includes(q) ||
        card.explanation.toLowerCase().includes(q) ||
        card.mennaHack.toLowerCase().includes(q)
      );
    });
  }, [activeTab, searchQuery]);

  const handleCopy = (card: FormulaCard) => {
    const text = card.formulaLaTeX
      ? `${card.title} (${card.arabicTitle})\nFormula: ${card.formulaLaTeX}\nزتونة منة: ${card.mennaHack}`
      : `${card.title} (${card.arabicTitle})\n${card.explanation}\nزتونة منة: ${card.mennaHack}`;
    navigator.clipboard.writeText(text);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormula = (latex?: string) => {
    if (!latex) return null;
    try {
      const html = katex.renderToString(latex, { displayMode: true, throwOnError: false });
      return <div className="text-center py-2 px-3 overflow-x-auto text-pink-300 font-serif" dangerouslySetInnerHTML={{ __html: html }} dir="ltr" />;
    } catch {
      return <div className="text-center font-mono text-pink-300">{latex}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="white-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-pink-50 via-rose-50/60 to-white shadow-sm border border-pink-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>خزينة أسرار وزتونة الـ EST لدكتورة منة 🌸✨</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-pink-700">قوانين ومصايد وحيل الآلة الحاسبة 🎀</h2>
            <p className="text-pink-900/80 text-sm mt-1 max-w-2xl">
              ملخصات مركزة وقوانين سرية مجربة لـ EST I & EST II أعدتها دكتورة ميمو لتسريع الحل وتفادي الفخاخ المتكررة في امتحانات 2020-2026.
            </p>
          </div>

          <div className="text-xs text-pink-700 bg-pink-100/80 px-4 py-2 rounded-2xl border border-pink-200 font-bold shrink-0 shadow-2xs">
            <span className="text-pink-600 font-black ml-1">{FORMULA_VAULT.length}</span> بطاقة ذهبية جاهزة 🌸
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-pink-200 shadow-2xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all' ? 'bg-[var(--primary-rose)] text-white shadow-xs' : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              الكل ({FORMULA_VAULT.length})
            </button>
            <button
              onClick={() => setActiveTab('math')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'math' ? 'bg-[var(--primary-rose)] text-white shadow-xs' : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              📐 رياضيات EST
            </button>
            <button
              onClick={() => setActiveTab('biology')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'biology' ? 'bg-[var(--primary-rose)] text-white shadow-xs' : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              🧬 أحياء EST II
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'calculator' ? 'bg-[var(--primary-rose)] text-white shadow-xs' : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              ⚡ حيل الآلة الحاسبة
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-pink-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحثي عن قانون، فخ، إنزيم... 🎀"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-pink-200 rounded-xl pr-9 pl-4 py-2 text-xs text-pink-900 placeholder-pink-300 focus:outline-none focus:border-pink-500 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="white-card hover:border-pink-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs text-pink-600 font-mono font-bold tracking-wide">{card.title}</div>
                  <h3 className="text-lg font-bold text-pink-800 mt-0.5">{card.arabicTitle}</h3>
                </div>

                <button
                  onClick={() => handleCopy(card)}
                  className="p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors cursor-pointer shrink-0 border border-pink-100 shadow-2xs"
                  title="نسخ القانون والزتونة"
                >
                  {copiedId === card.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* LaTeX Formula Display */}
              {card.formulaLaTeX && (
                <div className="bg-pink-50/70 border border-pink-200 rounded-2xl py-3 px-4 my-3 overflow-x-auto text-pink-700">
                  {renderFormula(card.formulaLaTeX)}
                </div>
              )}

              {/* Explanation */}
              <p className="text-pink-950/80 text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-4 font-medium">
                {card.explanation}
              </p>

              {/* Menna's Speed Hack */}
              <div className="bg-pink-50/80 border border-pink-200 rounded-2xl p-3.5 mb-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-pink-700 font-bold text-xs mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-pink-600" />
                  <span>زتونة دكتورة ميمو وسر السرعة (Speed Hack) 🌸:</span>
                </div>
                <p className="text-pink-900/90 text-xs leading-relaxed whitespace-pre-line font-medium">
                  {card.mennaHack}
                </p>
              </div>

              {/* Trap Warning */}
              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3.5 mb-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>تحذير فخ الـ EST (Common Trap):</span>
                </div>
                <p className="text-rose-900/90 text-xs leading-relaxed font-medium">
                  {card.trapWarning}
                </p>
              </div>
            </div>

            {/* Example / Real Test Application */}
            <div className="pt-3 border-t border-pink-100 text-xs text-pink-600 flex items-center justify-between">
              <div>
                <span className="text-pink-700 font-bold ml-1">تطبيق عملي:</span>
                <span className="font-mono text-pink-900 font-medium">{card.example}</span>
              </div>
              <span className="text-[10px] text-pink-400 font-bold">EST Pattern ✨</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
