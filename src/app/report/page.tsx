'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ArrowLeft, MessageCircle, Shield, Target, Zap,
  TrendingUp, Brain, CheckCircle, AlertTriangle, Copy,
  Key, Loader2, Lock, Share2, Star,
  Sparkles, ChevronRight, type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { reportGenerator, RelationshipReport } from '@/lib/services/report.generator';

// ── helpers ──────────────────────────────────────────────────────────────────

function scoreVerdict(score: number): string {
  if (score >= 8.5) return 'Excellent';
  if (score >= 7.0) return 'Strong';
  if (score >= 5.5) return 'Good';
  if (score >= 4.0) return 'Fair';
  return 'Needs work';
}

function scoreBarColor(score: number): string {
  if (score >= 8.0) return 'bg-green-500';
  if (score >= 6.5) return 'bg-blue-500';
  if (score >= 5.0) return 'bg-yellow-500';
  if (score >= 3.5) return 'bg-orange-500';
  return 'bg-red-500';
}

function scoreTextColor(score: number): string {
  if (score >= 8.0) return 'text-green-600';
  if (score >= 6.5) return 'text-blue-600';
  if (score >= 5.0) return 'text-yellow-600';
  if (score >= 3.5) return 'text-orange-600';
  return 'text-red-600';
}

function riskColor(label: string) {
  if (label === 'Low') return { bg: 'bg-green-100', text: 'text-green-700' };
  if (label === 'Moderate') return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
  return { bg: 'bg-red-100', text: 'text-red-700' };
}

// ── blur wrapper ──────────────────────────────────────────────────────────────

function BlurLock({ locked, children }: { locked: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className={locked ? 'blur-sm pointer-events-none select-none' : ''}>{children}</div>
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 rounded-xl z-10">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm">
            <Lock className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Share to unlock</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── subscore card ─────────────────────────────────────────────────────────────

const SUBSCORE_META: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
  communication: { label: 'Communication', Icon: MessageCircle, color: 'text-blue-500' },
  trust:         { label: 'Trust',          Icon: Shield,        color: 'text-green-500' },
  conflict:      { label: 'Conflict',       Icon: Zap,           color: 'text-orange-500' },
  intimacy:      { label: 'Intimacy',       Icon: Heart,         color: 'text-pink-500' },
  futureAlignment: { label: 'Future Goals', Icon: Target,        color: 'text-purple-500' },
  finances:      { label: 'Finances',       Icon: TrendingUp,    color: 'text-indigo-500' },
};

function SubscoreCard({ id, score }: { id: string; score: number | null }) {
  const meta = SUBSCORE_META[id];
  if (!meta || score === null) return null;
  const { label, Icon, color } = meta;
  const pct = (score / 10) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-semibold text-gray-800">{label}</span>
        </div>
        <span className={`text-sm font-bold ${scoreTextColor(score)}`}>{score.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className={`h-full rounded-full ${scoreBarColor(score)}`}
        />
      </div>
      <p className="text-xs text-gray-500">{scoreVerdict(score)}</p>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ReportPageInner />
    </Suspense>
  );
}

function ReportPageInner() {
  const searchParams = useSearchParams();
  const userKey = searchParams.get('key');

  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [report, setReport]       = useState<RelationshipReport | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sharing, setSharing]     = useState(false);

  // restore unlock from localStorage
  useEffect(() => {
    if (userKey && localStorage.getItem(`unlock_${userKey}`) === 'true') {
      setIsUnlocked(true);
    }
  }, [userKey]);

  useEffect(() => {
    if (!userKey) {
      setError('No user key provided. Please complete the survey first.');
      setLoading(false);
      return;
    }
    const loadReport = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await reportGenerator.generateReport(userKey);
        if (!result.success || !result.report) {
          setError(result.error || 'Failed to load report');
          setLoading(false);
          return;
        }
        setReport(result.report);
      } catch {
        setError('Failed to load report. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [userKey]);

  const copyKey = () => {
    if (userKey) {
      navigator.clipboard.writeText(userKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (!userKey) return;
    setSharing(true);
    const text = encodeURIComponent(
      `I just got my relationship health score on Love Lens! 💑\nTake yours free — it only takes 3 minutes.\nhttps://lovelens.app\n\nUse my key ${userKey} to compare scores!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setTimeout(() => {
      setIsUnlocked(true);
      localStorage.setItem(`unlock_${userKey}`, 'true');
      setSharing(false);
    }, 1500);
  };

  // ── loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Analysing your relationship…</p>
          <p className="text-sm text-gray-500 mt-1">Comparing with 15,000+ couples</p>
        </div>
      </div>
    );
  }

  // ── error ──
  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <Link href="/survey">
            <button className="btn-primary w-full">Take the Survey</button>
          </Link>
        </div>
      </div>
    );
  }

  const risk = riskColor(report.breakupRisk.label);
  const visibleSubscores  = ['communication', 'trust', 'conflict'];
  const lockedSubscores   = ['intimacy', 'futureAlignment', 'finances'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">

      {/* ── sticky top bar ── */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Key className="w-4 h-4 text-red-500" />
            <span className="font-mono text-sm font-semibold text-gray-800">{userKey}</span>
            <button onClick={copyKey} className="ml-1 p-1 rounded hover:bg-gray-100 transition-colors">
              {keyCopied
                ? <CheckCircle className="w-4 h-4 text-green-500" />
                : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── safety alert ── */}
        {report.flags.hasAbuseWarning && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm mb-1">Safety Alert</p>
                <p className="text-red-800 text-sm">Your responses suggest potential safety concerns. Please reach out for support.</p>
                <p className="text-red-700 text-sm mt-2 font-medium">Helpline: <a href="tel:1-800-799-7233" className="underline">1-800-799-7233</a></p>
              </div>
            </div>
          </div>
        )}

        {/* ── hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
            {report.category.replace('_', ' ')} relationship
          </p>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-bold">{report.overallScore.toFixed(1)}</span>
                <span className="text-white/70 text-lg mb-1">/10</span>
              </div>
              <p className="text-white/90 font-semibold text-lg">{report.scoreLabel}</p>
              <p className="text-white/70 text-sm mt-1">{report.comparisons.betterThanText}</p>
            </div>
            <div className="text-5xl">{report.archetype.icon}</div>
          </div>
        </motion.div>

        {/* ── quick stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {/* breakup risk */}
          <div className={`rounded-xl p-3 flex sm:flex-col items-center sm:text-center justify-between sm:justify-center gap-2 sm:gap-0 ${risk.bg}`}>
            <p className="text-xs text-gray-600 sm:hidden">Breakup Risk</p>
            <div className="flex items-center gap-2 sm:block">
              <p className={`text-xl font-bold ${risk.text}`}>{report.breakupRisk.percentage}%</p>
              <p className={`text-xs font-medium ${risk.text}`}>{report.breakupRisk.label}</p>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 hidden sm:block">Breakup Risk</p>
          </div>
          {/* percentile */}
          <div className="bg-blue-50 rounded-xl p-3 flex sm:flex-col items-center sm:text-center justify-between sm:justify-center gap-2 sm:gap-0">
            <p className="text-xs text-gray-600 sm:hidden">Percentile</p>
            <div className="flex items-center gap-2 sm:block">
              <p className="text-xl font-bold text-blue-600">Top {100 - report.comparisons.percentileRank}%</p>
              <p className="text-xs text-blue-600 font-medium">vs all couples</p>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 hidden sm:block">Percentile</p>
          </div>
          {/* stability */}
          <div className="bg-purple-50 rounded-xl p-3 flex sm:flex-col items-center sm:text-center justify-between sm:justify-center gap-2 sm:gap-0">
            <p className="text-xs text-gray-600 sm:hidden">Stability</p>
            <div className="flex items-center gap-2 sm:block">
              <p className="text-xl font-bold text-purple-600">{report.predictions.stabilityIndex}</p>
              <p className="text-xs text-purple-600 font-medium">out of 100</p>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 hidden sm:block">Stability</p>
          </div>
        </motion.div>

        {/* ── archetype banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start gap-4"
        >
          <div className="text-3xl">{report.archetype.icon}</div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Your Relationship Type</p>
            <p className="font-bold text-gray-900">{report.archetype.name}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{report.archetype.description}</p>
          </div>
        </motion.div>

        {/* ── subscores — visible 3 ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Relationship Dimensions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {visibleSubscores.map(id => (
              <SubscoreCard key={id} id={id} score={report.subscores[id as keyof typeof report.subscores]} />
            ))}
          </div>
        </motion.div>

        {/* ── subscores — locked 3 ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {lockedSubscores.map(id => (
            <BlurLock key={id} locked={!isUnlocked}>
              <SubscoreCard id={id} score={report.subscores[id as keyof typeof report.subscores]} />
            </BlurLock>
          ))}
        </motion.div>

        {/* ── strengths (always visible) ── */}
        {report.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-green-500" />
              <p className="font-semibold text-gray-900 text-sm">Your Strengths</p>
            </div>
            <ul className="space-y-2">
              {report.strengths.slice(0, 2).map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ── unlock banner (shown when locked) ── */}
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white border-2 border-red-200 rounded-2xl p-5 shadow-md"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  <Lock className="w-3 h-3" />
                  3 insights locked
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Unlock Your Full Report</h3>
                <p className="text-sm text-gray-600">Share Love Lens on WhatsApp to instantly reveal:</p>
              </div>

              <ul className="space-y-2 mb-5">
                {[
                  'Concerns & red flags in your relationship',
                  'Personalised action plan & recommendations',
                  'Relationship forecast + growth potential',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleWhatsAppShare}
                disabled={sharing}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
              >
                {sharing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
                {sharing ? 'Unlocking…' : 'Share on WhatsApp'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Free forever · No signup · 100% anonymous
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── concerns (locked) ── */}
        {report.concerns.length > 0 && (
          <BlurLock locked={!isUnlocked}>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <p className="font-semibold text-gray-900 text-sm">Areas to Watch</p>
              </div>
              <ul className="space-y-2">
                {report.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </BlurLock>
        )}

        {/* ── recommendations (locked) ── */}
        <BlurLock locked={!isUnlocked}>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-blue-500" />
              <p className="font-semibold text-gray-900 text-sm">Action Plan</p>
            </div>
            <ul className="space-y-2">
              {report.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </BlurLock>

        {/* ── forecast (locked) ── */}
        <BlurLock locked={!isUnlocked}>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <p className="font-semibold text-gray-900 text-sm">Relationship Forecast</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{report.predictions.stabilityIndex}</p>
                <p className="text-xs text-gray-600 mt-0.5">Stability Index</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-pink-600">{report.predictions.growthPotential}</p>
                <p className="text-xs text-gray-600 mt-0.5">Growth Potential</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Long-term Outlook</p>
              <p className="text-sm text-gray-700 leading-relaxed">{report.predictions.longevityForecast}</p>
            </div>
          </div>
        </BlurLock>

        {/* ── AI chat CTA (locked) ── */}
        <BlurLock locked={!isUnlocked}>
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-5 text-white text-center shadow-lg">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <h3 className="font-bold text-lg mb-1">Chat with AI Coach</h3>
            <p className="text-white/80 text-sm mb-4">
              Get personalised advice based on your exact survey answers.
            </p>
            <Link href={`/chat?key=${userKey}`}>
              <button className="bg-white text-red-600 font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-red-50 transition-colors">
                Start Free Chat
              </button>
            </Link>
          </div>
        </BlurLock>

        {/* ── unlock success message ── */}
        <AnimatePresence>
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Full report unlocked!</p>
                <p className="text-xs text-green-700">Thanks for sharing Love Lens.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── footer ── */}
        <div className="text-center pb-8 pt-2">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            <span className="text-sm font-semibold text-gray-700">Love Lens</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">
            Your key: <span className="font-mono font-semibold text-gray-700">{userKey}</span>
          </p>
          <p className="text-xs text-gray-400 mb-3">Save this key to access your report anytime.</p>
          <Link href="/survey" className="text-xs text-red-500 hover:text-red-600 underline">
            Retake survey
          </Link>
        </div>

      </div>
    </div>
  );
}
