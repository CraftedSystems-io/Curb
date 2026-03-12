import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "pool" | "landscaping" | "maid";
}

const variantStyles = {
  default: "bg-gray-100 text-gray-800",
  pool: "bg-blue-100 text-blue-800",
  landscaping: "bg-green-100 text-green-800",
  maid: "bg-purple-100 text-purple-800",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
