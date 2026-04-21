import { formatCurrency } from "@/lib/utils/format";
import type { MonthlyRevenue } from "@/lib/queries/admin";

export function RevenueTrendChart({ data }: { data: MonthlyRevenue[] }) {
  const maxGmv = Math.max(...data.map((d) => d.gmv), 1);
  const totalGmv = data.reduce((s, d) => s + d.gmv, 0);
  const totalBookings = data.reduce((s, d) => s + d.bookings, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Platform GMV (last 12 months)
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {formatCurrency(totalGmv)} across {totalBookings} completed bookings
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-end gap-2" style={{ height: 220 }}>
        {data.map((d) => {
          const h = maxGmv > 0 ? (d.gmv / maxGmv) * 100 : 0;
          return (
            <div key={d.key} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-400 opacity-0 group-hover:opacity-100">
                {d.gmv > 0 ? formatCurrency(d.gmv).replace(".00", "") : ""}
              </span>
              <div className="relative w-full flex-1 overflow-hidden rounded-t-lg bg-gray-100">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-700"
                  style={{ height: `${Math.max(h, 2)}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-gray-600">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
