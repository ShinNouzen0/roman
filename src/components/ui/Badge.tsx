import clsx from "clsx";

interface BadgeProps {
  status: "active" | "maintenance" | "inactive" | "development" | string;
}

export default function Badge({ status }: BadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          label: "Aktif",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
          dot: "bg-emerald-500",
        };
      case "maintenance":
        return {
          label: "Pemeliharaan",
          color: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700",
          dot: "bg-amber-500 animate-pulse",
        };
      case "inactive":
        return {
          label: "Tidak Aktif",
          color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
          dot: "bg-rose-500",
        };
      case "development":
        return {
          label: "Pengembangan",
          color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800",
          dot: "bg-blue-500",
        };
      default:
        return {
          label: status || "Unknown",
          color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
          dot: "bg-slate-500",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-xs transition-colors",
        config.color
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)}></span>
      {config.label}
    </div>
  );
}
