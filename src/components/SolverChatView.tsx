import React, { useState, useRef, useEffect } from 'react';
import { SubjectType, ChatMessage } from '../types';
import { SAMPLE_EST_QUESTIONS, SampleQuestion } from '../data/sampleQuestions';
import { MathMarkdown } from './MathMarkdown';
import { ScratchpadModal } from './ScratchpadModal';
import {
  Send,
  Image as ImageIcon,
  X,
  Sparkles,
  PenTool,
  Volume2,
  Trash2,
  HelpCircle,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

interface SolverChatViewProps {
  studentName: string;
}

export type CornerType = 'auto' | 'math' | 'bio' | 'games' | 'chat';

export const SolverChatView: React.FC<SolverChatViewProps> = ({ studentName }) => {
  const [subject, setSubject] = useState<SubjectType>('math_est1');
  const [activeCorner, setActiveCorner] = useState<CornerType>('auto');
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial welcoming message from Dr. Memo to Menna
    return [
      {
        id: 'msg-welcome',
        sender: 'menna',
        text: `🩺🤍 **أهلاً بيكي يا دكتورة منة يا قمر في عيادتك الخاصة مع دكتورة ميمو (White & Soft Pink Edition v11.0) 🌸✨**\n\nأنا مرشدتك ومعلمتك الطبية والأكاديمية عشان نقفل الـ EST I & EST II في الماث والبايو، ومقسمالك كل حاجة في **4 أركان بيضاء ووردية طبية تشرح النفس**:\n\n1. 📐 **ركن الماث (عيادة الماث):** شرح مبسط بالرموز الواضحة النظيفة (X^2, 1/2, √(X), 5 * X) بدون تعقيد، مع وصفة دكتورة ميمو للسرعة والآلة الحاسبة وتحدي العيادة!\n2. 🧬 **ركن البايو (المعمل البايولوجي):** تفكيك عميق لمفاهيم الوراثة والخلية والفسيولوجي واحدة واحدة، وجدول استبعاد المشتتات وشفرة الحفظ السريع!\n3. 🎮 **ركن الألعاب والمسابقات (تحديات الطبيبة):** ألعاب ذكاء وتحديات سرعة وفوازير مصايد EST لنعنشة العقل وفك الفصلة مع نظام نقاط ومكافأة!\n4. ☕ **ركن الحكي والفضفضة (روشتة الهدوء والفضفضة):** احتواء نفسي دافئ بدون أي ضغط، وجلسات علاج التوتر وجداول مذاكرة بيضاء ووردية مريحة!\n\n💡 المنظومة بتحول تلقائياً حسب كلامك، أو تقدري تختاري أي ركن من الأزرار بالأعلى. جاهزة يا منوشة يا دكتورتنا نبدأ؟ 🩺🤍🌸`,
        timestamp: Date.now(),
      },
    ];
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle image upload
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }
    setSelectedImageMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleImageFile(file);
      }
    }
  };

  // Submit question or chat to Memo Al-Qamar
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputPrompt;
    if (!text.trim() && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      image: selectedImage || undefined,
      timestamp: Date.now(),
      subject,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    const imagePayload = selectedImage;
    const mimePayload = selectedImageMime;
    setSelectedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text.trim(),
          imageBase64: imagePayload,
          mimeType: mimePayload,
          subject:
            activeCorner === 'math'
              ? subject === 'math_est2'
                ? 'EST II Mathematics'
                : 'EST I Mathematics'
              : activeCorner === 'bio'
              ? 'EST II Biology'
              : subject === 'math_est1'
              ? 'EST I Mathematics'
              : subject === 'math_est2'
              ? 'EST II Mathematics'
              : 'EST II Biology',
          studentName: studentName || 'منة',
          requestedCorner: activeCorner,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء معالجة السؤال');
      }

      const memoMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'menna',
        text: data.text,
        timestamp: Date.now(),
        subject,
      };

      setMessages((prev) => [...prev, memoMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'menna',
          text: `⚠️ **تنبيه من ميمو القمر:** ${err.message || 'حصل عطل بسيط في الاتصال. جربي تبعتيلي تانية يا منوشة! 🌸'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Interactive challenge evaluator
  const handleChallengeOption = async (messageId: string, option: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg || msg.challengeAnswered || msg.challengeEvaluating) return;

    // Set evaluating state
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, challengeSelected: option, challengeEvaluating: true } : m))
    );

    try {
      const res = await fetch('/api/evaluate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeQuestion: msg.text.slice(msg.text.indexOf('تحدي الفهم السريع')),
          studentAnswer: `الخيار (${option})`,
          correctOption: `الخيار (${option})`,
          studentName,
        }),
      });

      const json = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                challengeAnswered: true,
                challengeEvaluating: false,
                challengeFeedback: json.feedback,
              }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, challengeEvaluating: false } : m))
      );
    }
  };

  // Quick insertion of math symbols
  const insertSymbol = (sym: string) => {
    setInputPrompt((prev) => prev + sym);
  };

  // Text-to-speech for Menna
  const handleReadAloud = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('المتصفح لا يدعم القراءة الصوتية');
      return;
    }
    window.speechSynthesis.cancel();
    // Clean text from markdown symbols for clean speech
    const clean = text
      .replace(/[#*`_~]/g, '')
      .replace(/\$\$(.*?)\$\$/g, 'المعادلة الرياضية')
      .replace(/\$(.*?)\$/g, '$1')
      .slice(0, 350);

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ar-EG';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] max-w-5xl mx-auto space-y-3.5">
      {/* الأركان الأربعة: درجات الأبيض والوردي */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setActiveCorner('math');
            setSubject('math_est1');
          }}
          className={`pink-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-xs ${
            activeCorner === 'math'
              ? 'ring-2 ring-[var(--primary-rose)] bg-white shadow-sm'
              : 'hover:border-pink-400'
          }`}
        >
          <span className="text-2xl">📐</span>
          <span className="text-sm font-bold text-pink-700">ركن الماث</span>
          <span className="text-[10px] text-pink-500 font-medium">شرح وتدريبات EST</span>
        </button>

        <button
          onClick={() => {
            setActiveCorner('bio');
            setSubject('biology_est2');
          }}
          className={`pink-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-xs ${
            activeCorner === 'bio'
              ? 'ring-2 ring-[var(--primary-rose)] bg-white shadow-sm'
              : 'hover:border-pink-400'
          }`}
        >
          <span className="text-2xl">🧬</span>
          <span className="text-sm font-bold text-pink-700">ركن البايو</span>
          <span className="text-[10px] text-pink-500 font-medium">تفكيك ومفاهيم</span>
        </button>

        <button
          onClick={() => setActiveCorner('games')}
          className={`pink-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-xs ${
            activeCorner === 'games'
              ? 'ring-2 ring-[var(--primary-rose)] bg-white shadow-sm'
              : 'hover:border-pink-400'
          }`}
        >
          <span className="text-2xl">🎮</span>
          <span className="text-sm font-bold text-pink-700">ركن الألعاب</span>
          <span className="text-[10px] text-pink-500 font-medium">تحديات وسرعة</span>
        </button>

        <button
          onClick={() => setActiveCorner('chat')}
          className={`pink-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-xs ${
            activeCorner === 'chat'
              ? 'ring-2 ring-[var(--primary-rose)] bg-white shadow-sm'
              : 'hover:border-pink-400'
          }`}
        >
          <span className="text-2xl">☕</span>
          <span className="text-sm font-bold text-pink-700">ركن الحكي</span>
          <span className="text-[10px] text-pink-500 font-medium">فضفضة وجداول</span>
        </button>
      </div>

      {/* شريط الإعدادات السريعة (الوضع التلقائي، التبديل بين EST I و II، والمسودة) */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCorner('auto')}
            className={`px-3 py-1 rounded-full font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs ${
              activeCorner === 'auto'
                ? 'bg-pink-100 text-pink-700 border border-pink-300'
                : 'text-pink-600/80 hover:text-pink-800'
            }`}
          >
            <span>🌟</span>
            <span>الوضع التلقائي الذكي للأركان</span>
          </button>

          {(activeCorner === 'math' || activeCorner === 'auto') && (
            <div className="flex items-center gap-1 p-0.5 bg-white border border-pink-200 rounded-lg shadow-2xs">
              <button
                onClick={() => setSubject('math_est1')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  subject === 'math_est1'
                    ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                    : 'text-pink-600 hover:text-pink-800'
                }`}
              >
                EST I
              </button>
              <button
                onClick={() => setSubject('math_est2')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  subject === 'math_est2'
                    ? 'bg-[var(--primary-rose)] text-white shadow-xs'
                    : 'text-pink-600 hover:text-pink-800'
                }`}
              >
                EST II
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsScratchpadOpen(true)}
            className="text-pink-600 hover:text-pink-800 p-1.5 rounded-lg hover:bg-pink-100/50 cursor-pointer transition"
            title="مسودة الحسابات"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (confirm('هل تريدي مسح محادثة الأركان والبدء من جديد مع دكتورة ميمو يا دكتورة منة؟')) {
                setMessages([
                  {
                    id: 'msg-welcome-new',
                    sender: 'menna',
                    text: `🩺🤍 **أهلاً بيكي من جديد يا دكتورة منة يا قمر! 🌸✨** جاهزة نذاكر أو نلعب أو نحكي في أي ركن بالعيادة؟ دكتورة ميمو معاكي دايماً! 💖`,
                    timestamp: Date.now(),
                  },
                ]);
              }
            }}
            className="text-pink-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* منطقة المحادثة الشفافة والنقية */}
      <div className="white-card flex-1 rounded-3xl p-4 min-h-[420px] flex flex-col justify-between shadow-sm">
        <div id="chat-messages" className="space-y-4 overflow-y-auto max-h-[500px] p-2 flex-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            if (isUser) {
              return (
                <div key={msg.id} className="flex gap-2.5 justify-end items-end">
                  <div className="chat-bubble-menna p-4 max-w-[85%] sm:max-w-[75%] space-y-2 text-white shadow-sm">
                    {msg.image && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-pink-400/40 max-w-sm bg-black/10">
                        <img src={msg.image} alt="Uploaded" className="w-full h-auto object-contain max-h-60" />
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs border border-pink-200">
                    👑
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm border border-pink-200 shrink-0 text-pink-700 font-bold shadow-xs">
                  🩺
                </div>
                <div className="chat-bubble-memo p-4 max-w-[92%] sm:max-w-[85%] space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-pink-100 pb-1.5">
                    <p className="font-bold text-pink-700 text-sm flex items-center gap-1.5">
                      <span>دكتورة ميمو</span>
                      <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">خاص بـ منة 🌸</span>
                    </p>
                    <button
                      onClick={() => handleReadAloud(msg.text)}
                      className="text-pink-400 hover:text-pink-600 p-1 cursor-pointer transition-colors"
                      title="قراءة صوتية"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <MathMarkdown
                    content={msg.text}
                    onSelectChallengeOption={(opt) => handleChallengeOption(msg.id, opt)}
                    selectedChallengeOption={msg.challengeSelected}
                    isEvaluatingChallenge={msg.challengeEvaluating}
                  />

                  {msg.challengeFeedback && (
                    <div className="mt-3 pt-3 border-t border-pink-100 bg-pink-50/70 rounded-2xl p-3.5">
                      <div className="flex items-center gap-2 text-pink-700 font-bold text-xs mb-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>تقييم وتشجيع دكتورة ميمو الفوري لمنوشة 🩺🤍:</span>
                      </div>
                      <MathMarkdown content={msg.challengeFeedback} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm border border-pink-200 shrink-0 text-pink-700 font-bold shadow-xs">
                🩺
              </div>
              <div className="chat-bubble-memo p-4 max-w-md space-y-2 border border-pink-200 shadow-xs">
                <div className="flex items-center gap-2 text-pink-700 font-bold text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping"></div>
                  <span>دكتورة ميمو بتجهز الشرح والزتونة لمنوشة بالروقان... 🩺🌸🤍</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-pink-100 rounded-full w-5/6 animate-pulse"></div>
                  <div className="h-2.5 bg-pink-50 rounded-full w-4/6 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* الاختصارات السريعة (درجات الوردي والأبيض) */}
        <div className="pt-3 border-t border-pink-100 space-y-2.5">
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => handleSendMessage('اشرحيلي مسألة Quadratic وحيل الآلة الحاسبة 📐')}
              className="btn-pink-secondary px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-xs"
            >
              📐 اشرحيلي مسألة Quadratic
            </button>
            <button
              onClick={() => handleSendMessage('الفرق بين Translation و Transcription في البايو 🧬')}
              className="btn-pink-secondary px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-xs"
            >
              🧬 الفرق بين Translation و Transcription
            </button>
            <button
              onClick={() => handleSendMessage('يلا نلعب مسابقة سريعة في مفاهيم الـ EST 🎮')}
              className="btn-pink-secondary px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-xs"
            >
              🎮 يلا نلعب مسابقة سريعة
            </button>
            <button
              onClick={() => handleSendMessage('اعمليلي جدول مذاكرة متوازن ومريح للـ EST ☕')}
              className="btn-pink-secondary px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-xs"
            >
              ☕ اعمليلي جدول مذاكرة متوازن
            </button>
          </div>

          {/* Clean standard math symbols row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            <span className="text-pink-600 text-[11px] font-bold shrink-0">رموز واضحة 🩺:</span>
            {[
              { label: 'X^2', value: '^2' },
              { label: 'X^3', value: '^3' },
              { label: '√(X)', value: '√( )' },
              { label: '1/2', value: '1/2' },
              { label: '±', value: '±' },
              { label: '÷', value: ' ÷ ' },
              { label: '×', value: ' × ' },
              { label: 'sin(X)', value: 'sin( )' },
              { label: 'cos(X)', value: 'cos( )' },
              { label: 'tan(X)', value: 'tan( )' },
              { label: 'π', value: 'π' },
            ].map((sym) => (
              <button
                key={sym.label}
                type="button"
                onClick={() => insertSymbol(sym.value)}
                className="px-2.5 py-0.5 bg-white hover:bg-pink-100 text-pink-700 font-mono text-[11px] rounded-lg transition-colors cursor-pointer border border-pink-200 shadow-2xs font-semibold"
              >
                {sym.label}
              </button>
            ))}
          </div>

          {/* Selected image preview */}
          {selectedImage && (
            <div className="relative inline-block bg-white p-1.5 rounded-2xl border border-pink-300 shadow-xs">
              <img src={selectedImage} alt="Selected preview" className="h-16 w-auto rounded-xl object-contain" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 cursor-pointer shadow-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* صندوق الكتابة */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white hover:bg-pink-50 text-pink-600 rounded-2xl transition-colors cursor-pointer shrink-0 border border-pink-200 shadow-xs"
              title="رفع صورة مسألة أو دياجرام"
            >
              <ImageIcon className="w-5 h-5 text-pink-600" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                activeCorner === 'math'
                  ? 'اسألي مسألة ماث، أو اكتبي معادلة يا دكتورة منة... 📐🩺'
                  : activeCorner === 'bio'
                  ? 'اسألي مفهوم بايو، أو ارفعي دياجرام يا دكتورتنا المستقبليّة... 🔬🧬'
                  : activeCorner === 'games'
                  ? 'جاهزة يا منوشة نلعب وننعش العقل بلعبة طبية سريعة؟ 🎲🩺'
                  : activeCorner === 'chat'
                  ? 'فضفضي واحكي لدكتورة ميمو اللي تعبك بكل راحة واحتواء... 🫂🤍'
                  : 'اسألي دكتورة ميمو في الماث، البايو، أو فضفضي معايا يا منوشة... 🌸'
              }
              className="flex-1 bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 text-pink-900 placeholder-pink-300 shadow-2xs"
            />

            <button
              type="button"
              disabled={loading || (!inputPrompt.trim() && !selectedImage)}
              onClick={() => handleSendMessage()}
              className="btn-pink-primary px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-xs shrink-0"
            >
              <span>إرسال</span>
              <Send className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Digital Scratchpad */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        title="مسودة الـ EST للحسابات والرسومات"
      />
    </div>
  );
};
