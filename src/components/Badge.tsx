import clsx from "clsx";

interface BadgeProps {
  status: "active" | "maintenance" | "inactive" | "development";
}

export default function Badge({ status }: BadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return { label: "Aktif", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" };
      case "maintenance":
        return { label: "Maintenance", color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" };
      case "inactive":
        return { label: "Tidak Aktif", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" };
      case "development":
        return { label: "Dalam Pengembangan", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-500" };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={clsx("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", config.color)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)}></span>
      {config.label}
    </div>
  );
}
