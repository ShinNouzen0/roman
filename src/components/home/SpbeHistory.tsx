"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Award,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  X,
  Zap,
  BarChart3,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { SPBE_ASPECTS, SPBE_DOMAINS, spbeAnnualData, SpbeAnnualRecord } from "@/data/spbeData";

// ─── Helpers ───────────────────────────────────────────
function getPredikatMeta(score: number) {
  if (score >= 4.2)
    return {
      label: "Memuaskan",
      color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
      ring: "stroke-emerald-500",
      glow: "rgba(16,185,129,0.3)",
    };
  if (score >= 3.5)
    return {
      label: "Sangat Baik",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/60",
      dot: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      ring: "stroke-blue-500",
      glow: "rgba(59,130,246,0.3)",
    };
  if (score >= 2.6)
    return {
      label: "Baik",
      color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
      dot: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
      ring: "stroke-indigo-500",
      glow: "rgba(99,102,241,0.3)",
    };
  if (score >= 1.8)
    return {
      label: "Cukup",
      color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
      dot: "bg-amber-500",
      gradient: "from-amber-500 to-amber-600",
      ring: "stroke-amber-500",
      glow: "rgba(245,158,11,0.3)",
    };
  return {
    label: "Kurang",
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
    dot: "bg-rose-500",
    gradient: "from-rose-500 to-rose-600",
    ring: "stroke-rose-500",
    glow: "rgba(244,63,94,0.3)",
  };
}

function getScoreColor(score: number) {
  if (score >= 4.2) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", fill: "#10b981" };
  if (score >= 3.5) return { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500", fill: "#3b82f6" };
  if (score >= 2.6) return { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500", fill: "#6366f1" };
  if (score >= 1.8) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", fill: "#f59e0b" };
  return { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500", fill: "#f43f5e" };
}

// ─── Radar Chart Geometry ──────────────────────────────
const CX = 320;
const CY = 240;
const R = 140;
const N = 8;

const getPoint = (index: number, radius: number): [number, number] => {
  const theta = -Math.PI / 2 + (index * 2 * Math.PI) / N;
  return [
    Math.round((CX + radius * Math.cos(theta)) * 10) / 10,
    Math.round((CY + radius * Math.sin(theta)) * 10) / 10,
  ];
};

function wrapLabel(text: string, maxLen = 19): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxLen && current) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── Circular Score Gauge ──────────────────────────────
function ScoreGauge({ score, maxScore = 5, size = 180, strokeWidth = 10 }: { score: number; maxScore?: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(score / maxScore, 1);
  const dashOffset = circumference * (1 - percentage);
  const predikatMeta = getPredikatMeta(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={predikatMeta.ring}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
        {/* Glow filter */}
        <defs>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={predikatMeta.ring}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          opacity={0.15}
          filter="url(#gaugeGlow)"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={score}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight"
        >
          {score.toFixed(2)}
        </motion.span>
        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 -mt-0.5">/ {maxScore.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── Aspect Detail Panel ───────────────────────────────
function AspectDetailPanel({
  aspectIndex,
  activeData,
  prevData,
  onClose,
}: {
  aspectIndex: number;
  activeData: SpbeAnnualRecord;
  prevData: SpbeAnnualRecord | undefined;
  onClose: () => void;
}) {
  const name = SPBE_ASPECTS[aspectIndex];
  const score = activeData.aspectScores[aspectIndex] || 0;
  const prevScore = prevData?.aspectScores[aspectIndex];
  const delta = prevScore !== undefined ? score - prevScore : null;
  const percentage = (score / 5) * 100;
  const scoreColor = getScoreColor(score);
  const predikat = getPredikatMeta(score);

  // Find which domain this aspect belongs to
  const domain = SPBE_DOMAINS.find((d) => (d.aspectIndices as readonly number[]).includes(aspectIndex));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 shadow-xl shadow-black/5 dark:shadow-black/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={clsx("w-2.5 h-2.5 rounded-full", scoreColor.bg)} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Aspek {aspectIndex + 1} of {N}
            </span>
          </div>
          <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{name}</h4>
          {domain && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {domain.name}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Tutup panel detail"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Score + Progress */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <span className={clsx("text-3xl font-extrabold tabular-nums", scoreColor.text)}>
            {score.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-slate-400 ml-1">/ 5.00</span>
        </div>
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
            predikat.color
          )}
        >
          <span className={clsx("w-1.5 h-1.5 rounded-full", predikat.dot)} />
          {predikat.label}
        </span>
      </div>

      {/* Animated Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Capaian</span>
          <span className={clsx("font-bold", scoreColor.text)}>{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700/80 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: scoreColor.fill }}
            initial={{ width: "0%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
          />
        </div>
      </div>

      {/* Year-over-Year Comparison */}
      {delta !== null && prevData && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          {delta >= 0 ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <div className="text-xs">
            <span
              className={clsx(
                "font-bold",
                delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(2)}
            </span>{" "}
            <span className="text-slate-500 dark:text-slate-400">
              dari {prevData.tahun} ({prevScore?.toFixed(2)})
            </span>
          </div>
        </div>
      )}

      {/* Mini comparison bars for all years */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Tren Tahunan
        </div>
        <div className="space-y-1.5">
          {[...spbeAnnualData]
            .sort((a, b) => a.tahun - b.tahun)
            .map((d) => {
              const s = d.aspectScores[aspectIndex] || 0;
              const w = (s / 5) * 100;
              const isActive = d.tahun === activeData.tahun;
              return (
                <div key={d.tahun} className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "text-[11px] w-8 tabular-nums font-semibold shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {d.tahun}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700/80 overflow-hidden">
                    <motion.div
                      className={clsx("h-full rounded-full transition-colors", isActive ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600")}
                      initial={{ width: "0%" }}
                      animate={{ width: `${w}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                  </div>
                  <span
                    className={clsx(
                      "text-[11px] w-7 text-right tabular-nums font-semibold shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {s.toFixed(1)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function SpbeHistory() {
  const [mounted, setMounted] = useState(false);
  const years = useMemo(() => spbeAnnualData.map((d) => d.tahun).sort((a, b) => b - a), []);
  const [activeYear, setActiveYear] = useState<number>(years[0] || 2024);

  const activeData: SpbeAnnualRecord = useMemo(() => {
    return spbeAnnualData.find((d) => d.tahun === activeYear) || spbeAnnualData[0];
  }, [activeYear]);

  const prevYearData = useMemo(() => {
    return spbeAnnualData.find((d) => d.tahun === activeYear - 1);
  }, [activeYear]);

  // Animated values
  const [displayScore, setDisplayScore] = useState<number>(activeData.indeks);
  const [animatedAspects, setAnimatedAspects] = useState<number[]>([...activeData.aspectScores]);
  const animatedIndexRef = useRef<number>(activeData.indeks);
  const animatedAspectsRef = useRef<number[]>([...activeData.aspectScores]);

  // Interactive states
  const [hoveredAspect, setHoveredAspect] = useState<number | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<number | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset selected aspect when year changes
  useEffect(() => {
    setSelectedAspect(null);
  }, [activeYear]);

  // Smooth tweening on year change
  useEffect(() => {
    if (!mounted || !activeData) return;

    const targetIndex = activeData.indeks;
    const targetAspects = activeData.aspectScores;
    const startIndex = animatedIndexRef.current;
    const startAspects = [...animatedAspectsRef.current];

    let startTime: number | null = null;
    let animId: number;
    const duration = 600;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Spring-like ease
      const ease = 1 - Math.pow(1 - progress, 4);

      const nextIndex = startIndex + (targetIndex - startIndex) * ease;
      const nextAspects = startAspects.map((start, i) => start + (targetAspects[i] - start) * ease);

      animatedIndexRef.current = nextIndex;
      animatedAspectsRef.current = nextAspects;

      setDisplayScore(nextIndex);
      setAnimatedAspects([...nextAspects]);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [activeYear, mounted, activeData]);

  // Radar polygon points
  const capaianPolygonPoints = useMemo(() => {
    return animatedAspects
      .map((score, i) => {
        const r = (R * Math.min(Math.max(score, 0), 5)) / 5;
        return getPoint(i, r).join(",");
      })
      .join(" ");
  }, [animatedAspects]);

  const targetPolygonPoints = useMemo(() => {
    return Array.from({ length: N }, (_, i) => getPoint(i, R).join(",")).join(" ");
  }, []);

  const delta = prevYearData ? activeData.indeks - prevYearData.indeks : null;

  // Domain breakdown data
  const domainCards = useMemo(() => {
    return SPBE_DOMAINS.map((domain, domIdx) => {
      const aspects = domain.aspectIndices.map((i) => ({
        name: SPBE_ASPECTS[i],
        score: activeData.aspectScores[i] || 0,
        index: i,
      }));
      const calcAvg = aspects.reduce((s, a) => s + a.score, 0) / aspects.length;
      const officialScore = activeData.domainScores?.[domain.name] ?? calcAvg;

      return {
        name: domain.name,
        score: officialScore,
        aspects,
        index: domIdx,
      };
    });
  }, [activeData]);

  // Sparkline data
  const chronologicalData = useMemo(() => {
    return [...spbeAnnualData].sort((a, b) => a.tahun - b.tahun);
  }, []);

  const sparklineData = useMemo(() => {
    const xs = [35, 115, 195, 275];
    const pts = chronologicalData.map((d, i) => {
      const clamped = Math.max(1.0, Math.min(d.indeks, 5.0));
      const y = Math.round(92 - ((clamped - 1.0) / 4.0) * 54);
      return { x: xs[i] || 35 + i * 80, y, tahun: d.tahun, indeks: d.indeks };
    });
    const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
    const area = `${pts[0]?.x || 35},100 ` + polyline + ` ${pts[pts.length - 1]?.x || 275},100`;
    return { pts, polyline, area };
  }, [chronologicalData]);

  const handleAspectClick = useCallback(
    (index: number) => {
      setSelectedAspect((prev) => (prev === index ? null : index));
    },
    []
  );

  if (!mounted) return null;

  const predikatMeta = getPredikatMeta(activeData.indeks);

  return (
    <section
      id="spbe-history"
      className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ─── Header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-4 border border-blue-200/50 dark:border-blue-800/40">
            <TrendingUp className="w-3.5 h-3.5" />
            Indeks SPBE
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Nilai SPBE Kabupaten Bekasi
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Pemantauan perkembangan dan evaluasi Sistem Pemerintahan Berbasis Elektronik dari tahun ke tahun.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
            Terakhir diperbarui: Evaluasi KemenPAN-RB
          </p>

          {/* ─── Year Selector ───────────────────── */}
          <div className="inline-flex items-center p-1.5 bg-slate-200/70 dark:bg-slate-800/90 rounded-2xl border border-slate-300/60 dark:border-slate-700 mt-6 shadow-inner">
            {years.map((y) => {
              const isSelected = activeYear === y;
              return (
                <button
                  key={y}
                  onClick={() => setActiveYear(y)}
                  aria-pressed={isSelected}
                  className={clsx(
                    "relative flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-[1.02]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5 opacity-80" />
                  <span>Tahun {y}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="yearIndicator"
                      className="absolute inset-0 rounded-xl bg-blue-600 -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── 2-Column Grid ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ──────────────────────────────────────── */}
          {/* LEFT: Score Card + Sparkline            */}
          {/* ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Indeks SPBE {activeYear}
                </span>
              </div>

              {/* ── Circular Score Gauge ─────────── */}
              <div className="flex flex-col items-center mb-4">
                <ScoreGauge score={displayScore} />
              </div>

              {/* Predicate Pill */}
              <div className="text-center mb-4">
                <motion.span
                  key={`${activeYear}-${predikatMeta.label}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
                  className={clsx(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border shadow-sm",
                    predikatMeta.color
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Predikat: {predikatMeta.label}
                </motion.span>
              </div>

              {/* Delta change */}
              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                {delta !== null ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                  >
                    {delta >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-500" />
                    )}
                    <span
                      className={clsx(
                        "font-bold text-base",
                        delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                    </span>
                    <span className="text-xs">dibanding {activeYear - 1}</span>
                  </motion.div>
                ) : (
                  <span className="text-xs">Data tahun awal evaluasi (baseline)</span>
                )}
              </div>
            </div>

            {/* ── Sparkline: Perkembangan ────────── */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Perkembangan Indeks
                  </span>
                </div>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  Klik titik untuk beralih
                </span>
              </div>

              <div className="w-full h-[120px] relative">
                <svg viewBox="0 0 310 125" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[38, 51.5, 65, 78.5, 92].map((y, i) => (
                    <line
                      key={i}
                      x1="20"
                      y1={y}
                      x2="290"
                      y2={y}
                      className="stroke-slate-200 dark:stroke-slate-800"
                      strokeWidth={0.5}
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Area fill */}
                  <polygon points={sparklineData.area} fill="url(#trendGradient)" />

                  {/* Connecting line */}
                  <polyline
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklineData.polyline}
                  />

                  {/* Data Points */}
                  {sparklineData.pts.map((p) => {
                    const isCurrent = p.tahun === activeYear;
                    return (
                      <g
                        key={p.tahun}
                        className="cursor-pointer group"
                        onClick={() => setActiveYear(p.tahun)}
                      >
                        {/* Glow ring */}
                        {isCurrent && (
                          <>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={14}
                              className="fill-blue-500/10 dark:fill-blue-400/10"
                            />
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={10}
                              className="fill-blue-500/15 dark:fill-blue-400/15 animate-pulse"
                            />
                          </>
                        )}

                        {/* Node circle */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isCurrent ? 6 : 4}
                          className={clsx(
                            "transition-all duration-200 stroke-blue-600 dark:stroke-blue-400 stroke-2",
                            isCurrent
                              ? "fill-blue-600 dark:fill-blue-400"
                              : "fill-white dark:fill-[#111B2E] group-hover:fill-blue-100 group-hover:r-5"
                          )}
                        />

                        {/* Score label above */}
                        <text
                          x={p.x}
                          y={p.y - 12}
                          textAnchor="middle"
                          className={clsx(
                            "text-[11px] font-extrabold select-none transition-colors",
                            isCurrent
                              ? "fill-blue-600 dark:fill-blue-400 font-black"
                              : "fill-slate-700 dark:fill-slate-300"
                          )}
                        >
                          {p.indeks.toFixed(2)}
                        </text>

                        {/* Year label below */}
                        <text
                          x={p.x}
                          y={118}
                          textAnchor="middle"
                          className={clsx(
                            "text-[11px] font-semibold select-none transition-colors",
                            isCurrent
                              ? "fill-blue-600 dark:fill-blue-400 font-bold"
                              : "fill-slate-400 dark:fill-slate-500"
                          )}
                        >
                          {p.tahun}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </motion.div>

          {/* ──────────────────────────────────────── */}
          {/* RIGHT: Radar Chart + Aspect Detail      */}
          {/* ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Peta Aspek SPBE
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Klik aspek pada radar untuk melihat detail & tren tahunan
                </p>
              </div>
              {hoveredAspect !== null && selectedAspect === null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold max-w-[200px] truncate"
                >
                  {SPBE_ASPECTS[hoveredAspect]}: {activeData.aspectScores[hoveredAspect]?.toFixed(1)}
                </motion.div>
              )}
            </div>

            <div className="flex flex-col xl:flex-row gap-4 flex-1">
              {/* Radar Chart SVG */}
              <div className="flex-1 flex justify-center items-center py-2 relative min-h-[320px]">
                <svg
                  viewBox="0 0 640 480"
                  className="w-full max-w-[540px] h-auto overflow-visible select-none"
                  role="img"
                  aria-label="Radar capaian indeks per aspek SPBE"
                >
                  <defs>
                    {/* Gradient fills for the radar polygon */}
                    <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
                    </radialGradient>
                    <radialGradient id="radarFillDark" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
                    </radialGradient>
                    {/* Glow filter for active dots */}
                    <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* Pulse animation */}
                    <filter id="selectedGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* 5 Concentric polygon web rings with labels */}
                  {[1, 2, 3, 4, 5].map((level) => {
                    const ringPoints = Array.from({ length: N }, (_, i) =>
                      getPoint(i, (R * level) / 5).join(",")
                    ).join(" ");
                    return (
                      <g key={level}>
                        <polygon
                          points={ringPoints}
                          fill="none"
                          className="stroke-slate-200/80 dark:stroke-slate-700/60"
                          strokeWidth={level === 5 ? 1.5 : 0.8}
                        />
                        {/* Level number label at top */}
                        <text
                          x={CX + 6}
                          y={CY - (R * level) / 5 + 4}
                          className="text-[9px] fill-slate-300 dark:fill-slate-600 font-medium select-none"
                        >
                          {level}
                        </text>
                      </g>
                    );
                  })}

                  {/* 8 Radial Spokes */}
                  {Array.from({ length: N }, (_, i) => {
                    const [px, py] = getPoint(i, R);
                    const isActive = hoveredAspect === i || selectedAspect === i;
                    return (
                      <line
                        key={i}
                        x1={CX}
                        y1={CY}
                        x2={px}
                        y2={py}
                        className={clsx(
                          "transition-all duration-200",
                          isActive
                            ? "stroke-blue-400 dark:stroke-blue-500"
                            : "stroke-slate-200 dark:stroke-slate-800"
                        )}
                        strokeWidth={isActive ? 1.5 : 0.8}
                      />
                    );
                  })}

                  {/* Target Polygon (5.00) */}
                  <polygon
                    points={targetPolygonPoints}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    opacity={0.6}
                  />

                  {/* Capaian Polygon (Actual values) */}
                  <polygon
                    points={capaianPolygonPoints}
                    fill="url(#radarFill)"
                    className="stroke-blue-600 dark:stroke-blue-400 transition-all duration-300"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {animatedAspects.map((score, i) => {
                    const r = (R * Math.min(Math.max(score, 0), 5)) / 5;
                    const [px, py] = getPoint(i, r);
                    const isHovered = hoveredAspect === i;
                    const isSelected = selectedAspect === i;
                    const isActive = isHovered || isSelected;
                    const scoreColor = getScoreColor(activeData.aspectScores[i] || 0);

                    return (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredAspect(i)}
                        onMouseLeave={() => setHoveredAspect(null)}
                        onClick={() => handleAspectClick(i)}
                        className="cursor-pointer"
                      >
                        {/* Hit area (larger invisible circle for easier interaction) */}
                        <circle
                          cx={px}
                          cy={py}
                          r={18}
                          fill="transparent"
                        />

                        {/* Glow ring when active */}
                        {isActive && (
                          <>
                            <circle
                              cx={px}
                              cy={py}
                              r={14}
                              fill={scoreColor.fill}
                              opacity={0.12}
                            />
                            <circle
                              cx={px}
                              cy={py}
                              r={10}
                              fill={scoreColor.fill}
                              opacity={isSelected ? 0.25 : 0.15}
                              className={isSelected ? "animate-pulse" : ""}
                            />
                          </>
                        )}

                        {/* Node circle */}
                        <circle
                          cx={px}
                          cy={py}
                          r={isActive ? 7 : 4.5}
                          fill={isActive ? scoreColor.fill : "#3b82f6"}
                          stroke="white"
                          strokeWidth={isActive ? 2.5 : 1.5}
                          className="transition-all duration-200"
                          filter={isSelected ? "url(#dotGlow)" : undefined}
                        />

                        {/* Score badge on hover/select */}
                        {isActive && (
                          <g>
                            <rect
                              x={px - 18}
                              y={py - 30}
                              width={36}
                              height={18}
                              rx={9}
                              fill={scoreColor.fill}
                              opacity={0.95}
                            />
                            <text
                              x={px}
                              y={py - 18}
                              textAnchor="middle"
                              className="text-[10px] font-bold fill-white select-none"
                            >
                              {(activeData.aspectScores[i] || 0).toFixed(1)}
                            </text>
                          </g>
                        )}

                        <title>
                          {SPBE_ASPECTS[i]}: {activeData.aspectScores[i]?.toFixed(1)}
                        </title>
                      </g>
                    );
                  })}

                  {/* Aspect Text Labels */}
                  {SPBE_ASPECTS.map((label, i) => {
                    const [px, py] = getPoint(i, R + 28);
                    const anchor = px < CX - 10 ? "end" : px > CX + 10 ? "start" : "middle";
                    const lines = wrapLabel(label, 19);
                    const isActive = hoveredAspect === i || selectedAspect === i;

                    return (
                      <text
                        key={i}
                        x={px}
                        y={py - (lines.length - 1) * 7 + 4}
                        textAnchor={anchor}
                        onMouseEnter={() => setHoveredAspect(i)}
                        onMouseLeave={() => setHoveredAspect(null)}
                        onClick={() => handleAspectClick(i)}
                        className={clsx(
                          "text-[11px] transition-all duration-200 cursor-pointer select-none",
                          isActive
                            ? "fill-blue-600 dark:fill-blue-400 font-bold"
                            : "fill-slate-600 dark:fill-slate-400 font-medium hover:fill-slate-800 dark:hover:fill-slate-200"
                        )}
                      >
                        {lines.map((line, j) => (
                          <tspan x={px} dy={j === 0 ? 0 : 14} key={j}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* ── Aspect Detail Panel (shown on click) */}
              <AnimatePresence mode="wait">
                {selectedAspect !== null && (
                  <motion.div
                    key={selectedAspect}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="xl:w-[280px] xl:min-w-[280px] shrink-0 overflow-hidden"
                  >
                    <AspectDetailPanel
                      aspectIndex={selectedAspect}
                      activeData={activeData}
                      prevData={prevYearData}
                      onClose={() => setSelectedAspect(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-500 inline-block" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Capaian Indeks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3 rounded-sm border-2 border-dashed border-rose-500 inline-block" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Target (5.00)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Info className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400">Klik titik untuk detail</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Bottom: Rincian Domain ──────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-sm mt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Rincian Domain
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluasi 4 domain utama arsitektur SPBE Kabupaten Bekasi
              </p>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
              <Info className="w-3 h-3" />
              Klik domain untuk rincian aspek
            </div>
          </div>

          {/* 4 Domain Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {domainCards.map((domain, idx) => {
              const isExpanded = expandedDomain === domain.index;
              const barWidth = Math.min(Math.max((domain.score / 5) * 100, 0), 100);
              const scoreColor = getScoreColor(domain.score);
              const predikat = getPredikatMeta(domain.score);

              return (
                <motion.div
                  key={domain.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => setExpandedDomain(isExpanded ? null : domain.index)}
                  className={clsx(
                    "group relative bg-slate-50 dark:bg-slate-900/60 border rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer overflow-hidden",
                    isExpanded
                      ? "border-blue-500 shadow-lg shadow-blue-500/10 -translate-y-1"
                      : "border-slate-200/80 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-1 hover:shadow-md"
                  )}
                >
                  {/* Subtle accent bar at top */}
                  <div
                    className={clsx(
                      "absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-300",
                      isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    style={{ backgroundColor: scoreColor.fill }}
                  />

                  {/* Domain Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {domain.name}
                    </span>
                    <div className="text-right shrink-0">
                      <span className={clsx("font-extrabold text-lg tabular-nums", scoreColor.text)}>
                        {domain.score.toFixed(1)}
                      </span>
                      <small className="text-xs font-semibold text-slate-400 ml-0.5">/ 5.0</small>
                    </div>
                  </div>

                  {/* Predikat pill */}
                  <div className="mt-2 mb-3">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        predikat.color
                      )}
                    >
                      <span className={clsx("w-1.5 h-1.5 rounded-full", predikat.dot)} />
                      {predikat.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ backgroundColor: scoreColor.fill }}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${barWidth}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                    />
                  </div>

                  {/* Expandable Aspects */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700 space-y-2">
                          {domain.aspects.map((asp, aspIdx) => {
                            const aspColor = getScoreColor(asp.score);
                            const aspWidth = (asp.score / 5) * 100;
                            return (
                              <motion.div
                                key={aspIdx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: aspIdx * 0.06 }}
                                className={clsx(
                                  "p-2 rounded-lg transition-colors cursor-pointer",
                                  "hover:bg-white dark:hover:bg-slate-800/80"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAspect((prev) => (prev === asp.index ? null : asp.index));
                                  // Scroll to radar
                                  document.getElementById("spbe-history")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                              >
                                <div className="flex justify-between items-center gap-2 mb-1">
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                    {asp.name}
                                  </span>
                                  <span className={clsx("text-xs font-bold tabular-nums shrink-0", aspColor.text)}>
                                    {asp.score.toFixed(1)}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: aspColor.fill }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${aspWidth}%` }}
                                    transition={{ duration: 0.5, delay: aspIdx * 0.05 }}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hover indicator (desktop) */}
                  <div
                    className={clsx(
                      "overflow-hidden transition-all duration-300 ease-in-out text-xs text-slate-600 dark:text-slate-300",
                      !isExpanded
                        ? "max-h-0 sm:group-hover:max-h-56 opacity-0 sm:group-hover:opacity-100 sm:group-hover:mt-3 sm:group-hover:pt-3 sm:group-hover:border-t border-slate-200/80 dark:border-slate-700"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="space-y-1.5">
                      {domain.aspects.map((asp, aspIdx) => (
                        <div key={aspIdx} className="flex justify-between items-center gap-2">
                          <span className="truncate text-slate-600 dark:text-slate-400">{asp.name}</span>
                          <span className="font-bold text-slate-900 dark:text-white shrink-0">
                            {asp.score.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile toggle indicator */}
                  <div className="mt-2 flex items-center justify-end text-[11px] text-blue-600 dark:text-blue-400 font-semibold sm:hidden">
                    <span>{isExpanded ? "Tutup" : "Rincian"}</span>
                    <ChevronDown
                      className={clsx(
                        "w-3.5 h-3.5 ml-0.5 transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 text-center text-xs text-slate-600 dark:text-slate-400">
            Sumber Data: Evaluasi Penyelenggaraan SPBE Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (KemenPAN-RB) Republik Indonesia.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
