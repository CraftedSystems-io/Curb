import { TIER_CONFIG } from "@/lib/utils/constants";
import type { ProTier } from "@/types";

export function TierBadge({
  tier,
  size = "sm",
}: {
  tier: ProTier;
  size?: "xs" | "sm" | "md";
}) {
  const config = TIER_CONFIG[tier];
  if (!config || tier === "new") return null;

  const sizeClasses =
    size === "xs"
      ? "text-[10px] px-1.5 py-0.5 gap-0.5"
      : size === "md"
        ? "text-sm px-3 py-1 gap-1.5"
        : "text-xs px-2 py-0.5 gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold bg-gradient-to-r ${config.gradient} text-white shadow-sm ${sizeClasses}`}
      title={`${config.label} pro`}
    >
      <span aria-hidden>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
