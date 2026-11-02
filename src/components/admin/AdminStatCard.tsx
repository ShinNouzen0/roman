"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import clsx from "clsx";

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  gradient: "blue" | "emerald" | "violet" | "amber";
  sparklineData?: number[];
}

const GRADIENT_MAP = {
  blue: {
    bg: "from-blue-600 to-indigo-600",
    shadow: "shadow-blue-500/20",
    border: "border-blue-500/20",
    accent: "text-blue-600 dark:text-blue-400",
    glow: "bg-blue-500/10",
  },
  emerald: {
    bg: "from-emerald-600 to-teal-600",
    shadow: "shadow-emerald-500/20",
    border: "border-emerald-500/20",
    accent: "text-emerald-600 dark:text-emerald-400",
    glow: "bg-emerald-500/10",
  },
  violet: {
    bg: "from-purple-600 to-violet-600",
    shadow: "shadow-purple-500/20",
    border: "border-purple-500/20",
    accent: "text-purple-600 dark:text-purple-400",
    glow: "bg-purple-500/10",
  },
  amber: {
    bg: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
    border: "border-amber-500/20",
    accent: "text-amber-600 dark:text-amber-400",
    glow: "bg-amber-500/10",
  },
};

export default function AdminStatCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  gradient,
}: AdminStatCardProps) {
  const theme = GRADIENT_MAP[gradient];

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md dark:shadow-none transition-all duration-300 group"
    >
      {/* Background ambient glow */}
      <div
        className={clsx(
          "absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-75 pointer-events-none",
          theme.glow
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
          </div>
        </div>

        {/* Gradient Icon Badge */}
        <div
          className={clsx(
            "w-12 h-12 rounded-xl bg-gradient-to-tr text-white flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105",
            theme.bg,
            theme.shadow
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Subtitle & Trend section */}
      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {change && (
            <div
              className={clsx(
                "inline-flex items-center gap-1 font-semibold",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{change}</span>
            </div>
          )}

          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate ml-auto">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
