"use client";

import { motion } from "framer-motion";
import { spbeHistory } from "@/data/spbeData";
import { useState, useMemo, useEffect, useRef } from "react";
import { Award, TrendingUp, Calendar } from "lucide-react";
import clsx from "clsx";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function SpbeHistory() {
  const history = spbeHistory.filter((data) => data.indeks > 0).sort((a, b) => b.tahun - a.tahun);
  
  const [activeYear, setActiveYear] = useState<number>(history[0]?.tahun || 2024);
  const [mounted, setMounted] = useState(false);

  const activeData = useMemo(() => history.find(h => h.tahun === activeYear) || history[0], [activeYear, history]);

  // Animate SPBE score from 0 → actual value on mount + each year change
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (!mounted || !activeData) return;
    const target = activeData.indeks;
    let current = 0;
    setDisplayScore(0);
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayScore(current);
      if (current >= target) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [activeYear, mounted, activeData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!activeData || !activeData.chart || !activeData.chart.labels) return [];
    return activeData.chart.labels.map((label: string, i: number) => ({
      subject: label.length > 35 ? label.substring(0, 35) + '...' : label,
      fullLabel: label,
      indeks: activeData.chart.indeks[i],
      target: activeData.chart.target[i],
    }));
  }, [activeData]);

  const getPredikatColor = (predikat: string) => {
    switch (predikat.toLowerCase()) {
      case "memuaskan": return "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "sangat baik": return "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "baik": return "text-indigo-700 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
      case "cukup": return "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default: return "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-sm max-w-[250px]">
          <p className="font-semibold text-slate-900 dark:text-white mb-2">{data.fullLabel}</p>
          <div className="flex justify-between gap-4 text-blue-600 dark:text-blue-400">
            <span>Indeks:</span>
            <span className="font-bold">{data.indeks}</span>
          </div>
          <div className="flex justify-between gap-4 text-rose-500 dark:text-rose-400">
            <span>Target:</span>
            <span className="font-bold">{data.target}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!mounted) return null;

  return (
    <section id="spbe-history" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 scroll-mt-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-50/50 dark:bg-blue-900/10 blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-4">
            <TrendingUp className="w-4 h-4" />
            Indeks SPBE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Nilai SPBE Kabupaten Bekasi
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Pantau perkembangan dan evaluasi Sistem Pemerintahan Berbasis Elektronik dari tahun ke tahun.
          </p>
        </motion.div>

        {/* Year Selector Tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-4">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl">
            {history.map((h) => (
              <button
                key={h.tahun}
                onClick={() => setActiveYear(h.tahun)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300",
                  activeYear === h.tahun 
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                )}
              >
                <Calendar className="w-4 h-4" />
                Tahun {h.tahun}
              </button>
            ))}
          </div>
        </div>

        {activeData && (
          <motion.div 
            key={activeData.tahun}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/20 dark:shadow-black/20"
          >
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              
              {/* Left Side: Score & Details */}
              <div className="w-full lg:w-5/12 flex flex-col gap-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                  <span className="text-sm font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2 block">SKOR INDEKS SPBE</span>
                  <div className="flex items-end justify-center gap-2 mb-4">
                    <motion.span
                      key={activeData.tahun}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="text-6xl font-black text-slate-900 dark:text-white leading-none tabular-nums"
                    >
                      {displayScore.toFixed(2)}
                    </motion.span>
                    <span className="text-lg font-bold text-slate-400 mb-1">/ 5.0</span>
                  </div>
                  <div className="flex justify-center">
                    <div className={clsx("flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold shadow-sm", getPredikatColor(activeData.predikat))}>
                      <Award className="w-5 h-5" />
                      PREDIKAT: {activeData.predikat.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                    Rincian Domain
                  </h4>
                  <div className="space-y-3 max-h-[290px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeData.domains.map((domain: any, idx: number) => {
                      const isMainDomain = domain.nama.toLowerCase().includes("domain");
                      const score = parseFloat(domain.nilai) || 0;
                      const barPct = Math.min((score / 5) * 100, 100);
                      return (
                        <motion.div
                          key={`${activeData.tahun}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.3, ease: "easeOut" }}
                          className={clsx(
                            "py-2",
                            isMainDomain
                              ? "font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700"
                              : "text-sm text-slate-600 dark:text-slate-400 pl-3"
                          )}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="pr-3 text-[13px] leading-snug">{domain.nama}</span>
                            <span className={clsx(
                              "font-bold shrink-0 text-sm",
                              isMainDomain ? "text-slate-900 dark:text-white" : "text-blue-600 dark:text-blue-400"
                            )}>
                              {domain.nilai}
                            </span>
                          </div>
                          {!isMainDomain && (
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${barPct}%` }}
                                transition={{ duration: 0.85, delay: 0.1 + idx * 0.04, ease: "easeOut" }}
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Side: Radar Chart */}
              <div className="w-full lg:w-7/12 h-[450px] md:h-[500px] flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 relative">
                 <h4 className="absolute top-6 left-6 font-bold text-slate-900 dark:text-white text-lg">Peta Aspek SPBE</h4>
                 <div className="w-full h-full mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid strokeOpacity={0.3} className="stroke-slate-400 dark:stroke-slate-500" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: mounted && document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569', fontSize: 11 }} 
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      <Radar name="Capaian Indeks" dataKey="indeks" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.4} />
                      <Radar name="Target (5.0)" dataKey="target" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.1} strokeDasharray="3 3" />
                    </RadarChart>
                  </ResponsiveContainer>
                 </div>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
