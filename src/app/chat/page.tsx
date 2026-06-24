'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ArrowLeft, Loader2, Shield, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { chatbotService } from '@/lib/services/chatbot.service';
import { ChatMessage } from '@/lib/services/db.service';

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}

const SUGGESTED = [
  "How strong is our relationship? 💪",
  "What's our biggest weakness? 🤔",
  "How do we compare to other couples? 📊",
  "Any tips to improve things? 💡",
];

function ChatPageInner() {
  const searchParams = useSearchParams();
  const userKey = searchParams.get('key');

  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading]         = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError]             = useState('');
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userKey) {
      setError('No user key found. Please complete the survey first.');
      setInitializing(false);
      return;
    }
    const init = async () => {
      try {
        const result = await chatbotService.getChatHistory(userKey);
        if (result.success && result.messages) {
          if (result.messages.length === 0) {
            setMessages([{
              role: 'assistant',
              content: "Hey! 👋 I'm your Love Lens Coach. I've read your full relationship report and I'm ready to spill the tea ☕ — ask me anything!",
              timestamp: new Date().toISOString(),
            }]);
          } else {
            setMessages(result.messages);
          }
        }
      } catch {
        // show welcome anyway
        setMessages([{
          role: 'assistant',
          content: "Hey! 👋 I'm your Love Lens Coach. I've read your full relationship report and I'm ready to spill the tea ☕ — ask me anything!",
          timestamp: new Date().toISOString(),
        }]);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [userKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading || !userKey) return;
    setInputMessage('');
    setLoading(true);

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await chatbotService.sendMessage(userKey, text.trim());
      if (!response.success) throw new Error(response.error || 'Failed');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message || "Hmm, I lost my train of thought 😅 Try again?",
        timestamp: new Date().toISOString(),
      }]);

      if (response.needsHelp) setShowCrisisAlert(true);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Oops! Something went wrong 😬 — ${err.message}. Try again!`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inputMessage); }
  };

  if (initializing) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Heart className="w-7 h-7 text-white" fill="currentColor" />
        </div>
        <p className="text-gray-600 font-medium">Loading your coach…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <p className="text-gray-700 mb-4">{error}</p>
        <Link href="/survey"><button className="btn-primary w-full">Take Survey</button></Link>
      </div>
    </div>
  );

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">

      {/* ── header ── */}
      <div className="bg-white border-b border-gray-200 px-3 py-2.5 flex items-center gap-2 flex-shrink-0">
        <Link href={`/report?key=${userKey}`} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>

        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate leading-tight">Love Lens Coach 💑</p>
          <p className="text-xs text-green-500 font-medium leading-tight">Online</p>
        </div>

        <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg px-2 py-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-red-400" />
          <span className="text-xs font-mono text-red-600 font-semibold truncate max-w-[90px]">{userKey}</span>
        </div>
      </div>

      {/* ── crisis banner ── */}
      <AnimatePresence>
        {showCrisisAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex-shrink-0"
          >
            <div className="flex items-start gap-2 max-w-2xl mx-auto">
              <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800 flex-1">
                <span className="font-semibold">Support available: </span>
                <a href="tel:988" className="underline font-bold">988</a> · <a href="tel:1-800-799-7233" className="underline font-bold">1-800-799-7233</a>
              </p>
              <button onClick={() => setShowCrisisAlert(false)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">

          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-br-sm'
                    : isSystem
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* suggested questions */}
        {showSuggestions && (
          <div className="max-w-2xl mx-auto mt-4">
            <p className="text-xs text-gray-400 text-center mb-2">Try asking…</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="text-xs bg-white border border-gray-200 text-gray-700 rounded-full px-3 py-1.5 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── input bar ── */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your coach anything… 💬"
            disabled={loading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => send(inputMessage)}
            disabled={loading || !inputMessage.trim()}
            className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {loading
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </motion.button>
        </div>
      </div>

    </div>
  );
}
