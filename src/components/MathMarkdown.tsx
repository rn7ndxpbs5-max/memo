import React, { useMemo } from 'react';
import katex from 'katex';

interface MathMarkdownProps {
  content: string;
  className?: string;
  onSelectChallengeOption?: (option: string) => void;
  selectedChallengeOption?: string;
  isEvaluatingChallenge?: boolean;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({
  content,
  className = '',
  onSelectChallengeOption,
  selectedChallengeOption,
  isEvaluatingChallenge,
}) => {
  // Parse text into tokens including inline and block math
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Helper to render KaTeX safely
    const renderMath = (latex: string, displayMode: boolean) => {
      try {
        return katex.renderToString(latex.trim(), {
          displayMode,
          throwOnError: false,
          output: 'html',
        });
      } catch (e) {
        return `<span class="text-rose-400 font-mono text-xs">${latex}</span>`;
      }
    };

    // First, process block math $$...$$
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    let processed = content.replace(blockMathRegex, (_match, math) => {
      return `\n\n<div class="katex-block my-3 py-2 px-3 bg-pink-50/70 rounded-xl overflow-x-auto text-center border border-pink-200 text-pink-900" dir="ltr">${renderMath(math, true)}</div>\n\n`;
    });

    // Next, process inline math $...$
    // Avoid matching currency or standalone dollar signs
    const inlineMathRegex = /(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g;
    processed = processed.replace(inlineMathRegex, (_match, math) => {
      return `<span class="katex-inline px-1 py-0.5 rounded text-pink-700 font-serif font-medium" dir="ltr">${renderMath(math, false)}</span>`;
    });

    return processed;
  }, [content]);

  // Section detector to present Menna's 6 mandatory architecture blocks
  // 1. 🌟 ترحيب ودعم منة
  // 2. 🎯 الإجابة النهائية
  // 3. 📐 أو 🧬 خطوات الحل الشاملة
  // 4. ❌ تحليل المشتتات
  // 5. ⚡ زتونة الـ EST وسر السرعة
  // 6. 📝 تحدي الفهم السريع

  // Group into logical blocks for Memo Al-Qamar's 4 Cute Corners:
  // 1. Math Corner
  // 2. Biology Corner
  // 3. Games Corner
  // 4. Chat & Venting Corner
  type BlockType =
    | 'math_greeting'
    | 'bio_greeting'
    | 'game_opening'
    | 'emotional_validation'
    | 'answer'
    | 'math_solution'
    | 'bio_solution'
    | 'elimination'
    | 'speedhack'
    | 'mnemonic'
    | 'game_challenge'
    | 'game_reward'
    | 'venting_session'
    | 'actionable_steps'
    | 'sisterly_love'
    | 'challenge'
    | 'general';

  const blocks: { type: BlockType; rawLines: string[] }[] = [];
  let currentType: BlockType = 'general';
  let currentLines: string[] = [];

  const lines = (renderedContent || '').split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.includes('ترحيب العيادة الرياضية') ||
      trimmed.includes('كبيرة دكاترة الماث') ||
      trimmed.includes('ترحيب ركن الماث') ||
      trimmed.includes('أميرة الماث')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'math_greeting';
      currentLines = [line];
    } else if (
      trimmed.includes('ترحيب المعمل البايولوجي') ||
      trimmed.includes('دكتورتنا المستقبليّة') ||
      trimmed.includes('ترحيب ركن البايو') ||
      trimmed.includes('دكتورتنا القمر')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'bio_greeting';
      currentLines = [line];
    } else if (
      trimmed.includes('افتتاحية اللعبة والحماس') ||
      trimmed.includes('بلعبة طبية سريعة') ||
      trimmed.includes('جاهزة يا منوشة ننعش العقل') ||
      trimmed.includes('جاهزة يا منوشة نلعب') ||
      trimmed.includes('ركن الألعاب') ||
      trimmed.includes('🎲')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'game_opening';
      currentLines = [line];
    } else if (
      trimmed.includes('احتواء واحتضان نفسي') ||
      trimmed.includes('احتواء نفسي') ||
      trimmed.includes('سلامة قلبك ونبضك') ||
      trimmed.includes('🫂 احتواء') ||
      trimmed.includes('🫂')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'emotional_validation';
      currentLines = [line];
    } else if (
      trimmed.includes('جلسة الفضفضة / علاج الضغط والجدول') ||
      trimmed.includes('جلسة الفضفضة') ||
      trimmed.includes('علاج الضغط والجدول') ||
      trimmed.includes('جلسة الحكي والفضفضة') ||
      trimmed.includes('جلسة الحكي') ||
      trimmed.includes('☕')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'venting_session';
      currentLines = [line];
    } else if (
      trimmed.includes('الإجابة النهائية المباشرة') ||
      trimmed.includes('الإجابة النهائية') ||
      trimmed.includes('🎯 الإجابة')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'answer';
      currentLines = [line];
    } else if (
      trimmed.includes('الشرح وتبسيط المفهوم خطوة بخطوة') ||
      trimmed.includes('الشرح وتبسيط المفهوم') ||
      trimmed.includes('🧬 الشرح')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'bio_solution';
      currentLines = [line];
    } else if (
      trimmed.includes('الشرح خطوة بخطوة بالرموز الواضحة') ||
      trimmed.includes('الشرح خطوة بخطوة') ||
      trimmed.includes('خطوات الحل') ||
      trimmed.includes('📐 الشرح')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'math_solution';
      currentLines = [line];
    } else if (
      trimmed.includes('جدول فحص المشتتات') ||
      trimmed.includes('تحليل المشتتات') ||
      trimmed.includes('فحص المشتتات') ||
      trimmed.includes('🔍')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'elimination';
      currentLines = [line];
    } else if (
      trimmed.includes('وصفة دكتورة ميمو للسرعة والحاسبة') ||
      trimmed.includes('وصفة دكتورة ميمو') ||
      trimmed.includes('زتونة السرعة والحاسبة') ||
      trimmed.includes('زتونة السرعة') ||
      trimmed.includes('زتونة') ||
      trimmed.includes('⚡ وصفة') ||
      trimmed.includes('⚡ زتونة')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'speedhack';
      currentLines = [line];
    } else if (
      trimmed.includes('شفرة دكتورة ميمو للحفظ') ||
      trimmed.includes('شفرة ميمو للحفظ') ||
      trimmed.includes('شفرة الحفظ') ||
      trimmed.includes('💡 شفرة')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'mnemonic';
      currentLines = [line];
    } else if (
      trimmed.includes('التحدي السريع') ||
      trimmed.includes('🧩 التحدي')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'game_challenge';
      currentLines = [line];
    } else if (
      trimmed.includes('نظام النقاط والمكافأة') ||
      trimmed.includes('🏆 نظام النقاط')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'game_reward';
      currentLines = [line];
    } else if (
      trimmed.includes('جرعة راحة وهدوء بال') ||
      trimmed.includes('خطوات بسيطة تهدي البال') ||
      trimmed.includes('خطوات بسيطة ومهدئة') ||
      trimmed.includes('تهدي البال')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'actionable_steps';
      currentLines = [line];
    } else if (
      trimmed.includes('روشتة أمل وحب لمنوشة') ||
      trimmed.includes('روشتة أمل وحب') ||
      trimmed.includes('رسالة حب وجرعة أمل لمنة') ||
      trimmed.includes('رسالة حب وجرعة أمل') ||
      trimmed.includes('جرعة حب وتشجيع')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'sisterly_love';
      currentLines = [line];
    } else if (
      trimmed.includes('تحدي العيادة لمنة') ||
      trimmed.includes('تحدي ميمو لمنة') ||
      trimmed.includes('تحدي ميمو للماث') ||
      trimmed.includes('تحدي ميمو للبايو') ||
      trimmed.includes('تحدي الفهم السريع') ||
      trimmed.includes('💖 تحدي')
    ) {
      if (currentLines.length > 0) blocks.push({ type: currentType, rawLines: [...currentLines] });
      currentType = 'challenge';
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0) {
    blocks.push({ type: currentType, rawLines: currentLines });
  }

  // Format inline markdown (bold, italic, list items)
  const formatTextLine = (line: string) => {
    // If it's already an HTML block or contains KaTeX block
    if (line.includes('katex-block')) {
      return <div key={Math.random()} dangerouslySetInnerHTML={{ __html: line }} />;
    }

    // Bold **text**
    let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-pink-700 tracking-wide">$1</strong>');
    // Italic *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-pink-900/80">$1</em>');

    // Clean Math Superscripts (e.g. X^2, Y^3, x^(n+1))
    formatted = formatted.replace(/\b([a-zA-Z0-9]+)\^([0-9n\+\-]+)\b/g, '<span class="font-mono font-bold text-pink-700 tracking-wide">$1<sup>$2</sup></span>');
    // Square roots √(X)
    formatted = formatted.replace(/√(\([^\)]+\)|[a-zA-Z0-9]+)/g, '<span class="font-mono font-bold text-pink-700">√$1</span>');
    // Plus-Minus ±
    formatted = formatted.replace(/±/g, '<span class="font-bold text-pink-700">±</span>');

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      const clean = formatted.replace(/^(\s*[-•]\s*)/, '');
      return (
        <li
          key={Math.random()}
          className="flex items-start gap-2 my-1 text-[var(--text-dark)]"
          dangerouslySetInnerHTML={{ __html: `<span class="text-pink-500 mt-1 select-none">▸</span> <span>${clean}</span>` }}
        />
      );
    }

    return (
      <p
        key={Math.random()}
        className="my-1 text-[var(--text-dark)] leading-relaxed text-sm md:text-base"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  };

  return (
    <div className={`space-y-3.5 text-[var(--text-dark)] ${className}`}>
      {blocks.map((block, idx) => {
        // 1. Math Greeting
        if (block.type === 'math_greeting') {
          return (
            <div
              key={idx}
              className="bg-[#FFF5F7] border border-[#FAC6D5] rounded-2xl p-4 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2 text-pink-700 font-extrabold text-sm sm:text-base">
                <span className="text-xl">🩺🤍</span>
                <span>أهلاً بكبيرة دكاترة الماث منوشة 🌸✨</span>
              </div>
              <div className="space-y-1 text-[var(--text-dark)] leading-relaxed font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // 2. Bio Greeting
        if (block.type === 'bio_greeting') {
          return (
            <div
              key={idx}
              className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2 text-emerald-800 font-extrabold text-sm sm:text-base">
                <span className="text-xl">🔬🌸</span>
                <span>أهلاً بدكتورتنا المستقبليّة منة 🧬✨</span>
              </div>
              <div className="space-y-1 text-emerald-950 leading-relaxed font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // 3. Game Opening
        if (block.type === 'game_opening') {
          return (
            <div
              key={idx}
              className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2 text-amber-800 font-extrabold text-sm sm:text-base">
                <span className="text-2xl animate-bounce">🎲🩺</span>
                <span>جاهزة يا منوشة ننعش العقل بلعبة طبية سريعة؟ 👑✨</span>
              </div>
              <div className="space-y-1 text-amber-950 font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // 4. Emotional Validation (Chat/Venting)
        if (block.type === 'emotional_validation') {
          return (
            <div
              key={idx}
              className="bg-[#FFF5F7] border-2 border-[#FAC6D5] rounded-3xl p-5 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-pink-700 font-extrabold text-base border-b border-pink-200 pb-2.5">
                <span className="text-2xl animate-pulse">🫂🤍</span>
                <span>احتواء واحتضان نفسي دافئ لدكتورة منة من دكتورة ميمو 🩺🌸</span>
              </div>
              <div className="space-y-1.5 text-[var(--text-dark)] leading-relaxed font-medium text-base">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Direct Final Answer
        if (block.type === 'answer') {
          return (
            <div
              key={idx}
              className="bg-white border-2 border-pink-400 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2 text-pink-700 font-extrabold text-base">
                <span className="text-xl">🎯</span>
                <span>الإجابة النهائية المباشرة 🤍</span>
              </div>
              <div className="text-pink-900 font-black text-lg md:text-xl space-y-1">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Math Solution (Clean standard symbols)
        if (block.type === 'math_solution') {
          return (
            <div
              key={idx}
              className="bg-white border border-[#FAC6D5] rounded-2xl p-4 md:p-5 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-pink-700 font-bold text-sm sm:text-base border-b border-pink-100 pb-2">
                <span className="text-xl">📐</span>
                <span>الشرح خطوة بخطوة بالرموز الواضحة (X^2, 1/2, √(X))</span>
              </div>
              <div className="space-y-1 text-[var(--text-dark)] font-sans">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Bio Solution
        if (block.type === 'bio_solution') {
          return (
            <div
              key={idx}
              className="bg-white border border-emerald-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base border-b border-emerald-100 pb-2">
                <span className="text-xl">🧬</span>
                <span>الشرح وتبسيط المفهوم خطوة بخطوة ("واحدة واحدة")</span>
              </div>
              <div className="space-y-1 text-emerald-950">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Distractor Elimination Matrix
        if (block.type === 'elimination') {
          return (
            <div
              key={idx}
              className="bg-[#FFF5F7] border border-[#FAC6D5] rounded-2xl p-4 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-pink-700 font-bold text-sm border-b border-pink-200 pb-2">
                <span className="text-lg">🔍</span>
                <span>جدول فحص واستبعاد المشتتات (Option Elimination Matrix)</span>
              </div>
              <div className="space-y-1 text-[var(--text-dark)]">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Speed Hack & Calculator
        if (block.type === 'speedhack') {
          return (
            <div
              key={idx}
              className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 md:p-5 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2 text-amber-800 font-extrabold text-sm md:text-base">
                <span className="text-xl">⚡</span>
                <span>وصفة دكتورة ميمو للسرعة وحيل الحاسبة 🩺🎀</span>
              </div>
              <div className="space-y-1 text-amber-950 font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Mnemonic & Memory Hook
        if (block.type === 'mnemonic') {
          return (
            <div
              key={idx}
              className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4.5 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-purple-800 font-extrabold text-sm md:text-base">
                <span className="text-xl">💡</span>
                <span>شفرة دكتورة ميمو للحفظ السريع (Memory Hook) 🔬✨</span>
              </div>
              <div className="space-y-1 text-purple-950 font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Game Challenge
        if (block.type === 'game_challenge') {
          return (
            <div
              key={idx}
              className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4.5 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-base">
                <span className="text-xl">🧩</span>
                <span>التحدي السريع وفك الفصلة 🎯</span>
              </div>
              <div className="space-y-1 text-indigo-950 font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Game Reward
        if (block.type === 'game_reward') {
          return (
            <div
              key={idx}
              className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm md:text-base">
                <span className="text-xl">🏆</span>
                <span>نظام النقاط والمكافأة لدكتورة منة 👑</span>
              </div>
              <div className="space-y-1 text-amber-950 font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Venting Session & Schedule
        if (block.type === 'venting_session') {
          return (
            <div
              key={idx}
              className="bg-[#FFF5F7] border border-[#FAC6D5] rounded-2xl p-4.5 md:p-5 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-pink-700 font-bold text-sm md:text-base border-b border-pink-200 pb-2">
                <span className="text-xl">☕🌸</span>
                <span>عيادة الفضفضة والروقان / علاج الضغط والجدول لمنوشة 🩺</span>
              </div>
              <div className="space-y-1 text-[var(--text-dark)] leading-relaxed">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Actionable Steps
        if (block.type === 'actionable_steps') {
          return (
            <div
              key={idx}
              className="bg-white border border-[#FAC6D5] rounded-2xl p-4.5 md:p-5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center gap-2 text-pink-700 font-bold text-sm md:text-base">
                <span className="text-xl">✨</span>
                <span>جرعة راحة وهدوء بال دلوقتي (بدون أي ضغط) 🤍🌸</span>
              </div>
              <div className="space-y-1 text-[var(--text-dark)]">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Sisterly Love & Encouragement
        if (block.type === 'sisterly_love') {
          return (
            <div
              key={idx}
              className="bg-[#FFF5F7] border border-pink-300 rounded-2xl p-4.5 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-pink-700 font-extrabold text-sm md:text-base">
                <span className="text-xl">🤍🩺</span>
                <span>روشتة أمل وحب لدكتورة منة من دكتورة ميمو 🌸</span>
              </div>
              <div className="space-y-1 text-[var(--text-dark)] font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>
            </div>
          );
        }

        // Challenge (Interactive micro quiz)
        if (block.type === 'challenge') {
          return (
            <div
              key={idx}
              className="bg-white border-2 border-pink-300 rounded-2xl p-4 md:p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-700 font-bold text-sm md:text-base">
                  <span className="text-xl">💖</span>
                  <span>تحدي العيادة لمنة (حلي الآن يا دكتورة منة 🩺)</span>
                </div>
                <span className="text-xs text-pink-700 bg-pink-100 px-2.5 py-1 rounded-md border border-pink-200 font-bold">
                  تأكيد التمكن اللحظي ✨
                </span>
              </div>

              <div className="space-y-1 text-[var(--text-dark)] font-medium">
                {block.rawLines.slice(1).map(formatTextLine)}
              </div>

              {/* Interactive option buttons if available */}
              {onSelectChallengeOption && (
                <div className="pt-2 border-t border-pink-200">
                  <div className="text-xs text-pink-700 mb-2 font-medium">اختاري إجابتك للتقييم الفوري من دكتورة ميمو:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isSelected = selectedChallengeOption === opt;
                      return (
                        <button
                          key={opt}
                          disabled={isEvaluatingChallenge}
                          onClick={() => onSelectChallengeOption(opt)}
                          className={`py-2 px-3 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[var(--primary-rose)] text-white shadow-sm ring-2 ring-pink-300'
                              : 'btn-pink-secondary'
                          } ${isEvaluatingChallenge ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                        >
                          <span className="font-mono">({opt})</span>
                          <span>الخيار {opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {isEvaluatingChallenge && (
                    <div className="flex items-center gap-2 text-xs text-pink-600 mt-2 animate-pulse font-medium">
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></div>
                      <span>دكتورة ميمو بتراجع إجابتك دلوقتي وبتحضرلك التقييم والتشجيع الطبي... 🩺🤍</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }

        // General text block
        return (
          <div key={idx} className="space-y-1">
            {block.rawLines.map(formatTextLine)}
          </div>
        );
      })}
    </div>
  );
};
