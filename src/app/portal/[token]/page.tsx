import { notFound } from "next/navigation";
import { MapPin, Calendar, ClipboardList, Camera, Receipt, Activity } from "lucide-react";
import { getBookingByShareToken, getBookingEvents, getScopeItems, getInvoices, getBookingPhotos, getDailyLogs, getCheckins } from "@/lib/queries/workspace";
import { StagePipeline } from "@/components/workspace/stage-pipeline";
import { Timeline } from "@/components/workspace/timeline";
import { TierBadge } from "@/components/ui/tier-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, formatCurrency, formatRelativeTime } from "@/lib/utils/format";
import { PHOTO_PHASE_CONFIG, INVOICE_KIND_CONFIG, INVOICE_STATUS_CONFIG } from "@/lib/utils/constants";
import Image from "next/image";
import Link from "next/link";
import type { BookingStage, ProTier, PhotoPhase } from "@/types";

export const dynamic = "force-dynamic";

export default async function PublicPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getBookingByShareToken(token);
  if (!result || !result.booking) notFound();

  const { booking } = result;
  const bookingId = booking.id as string;
  const stage = booking.stage as BookingStage | null;
  const contractor = booking.contractors as {
    business_name: string | null;
    tier?: ProTier;
    profiles?: { full_name?: string; avatar_url?: string | null };
  };
  const contractorName =
    contractor?.business_name ?? contractor?.profiles?.full_name ?? "Service pro";

  const [events, scope, invoices, photos, logs, checkins] = await Promise.all([
    getBookingEvents(bookingId),
    getScopeItems(bookingId),
    getInvoices(bookingId),
    getBookingPhotos(bookingId),
    getDailyLogs(bookingId),
    getCheckins(bookingId),
  ]);

  const scopeTotal = scope.reduce(
    (s, i) => s + Number(i.quantity) * Number(i.unit_price),
    0
  );
  const paid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);
  const billed = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const lastLog = logs[0];
  const lastCheckin = checkins[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-emerald-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-emerald-200">
            <MapPin className="h-4 w-4" />
            Curb project page
          </div>
          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {booking.job_number ?? "Project"}
              </p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                {contractorName}
              </h1>
              <p className="mt-1 text-sm text-emerald-200">
                {booking.services?.name ?? "Service"} at {booking.address}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {contractor?.tier && contractor.tier !== "new" && (
                <TierBadge tier={contractor.tier} size="md" />
              )}
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                <Avatar
                  src={contractor?.profiles?.avatar_url ?? null}
                  name={contractorName}
                  size="sm"
                />
                <span className="text-sm">{contractorName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        {/* Pipeline */}
        <StagePipeline stage={stage} />

        {/* Key stats */}
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard
            label="Scheduled"
            value={booking.scheduled_date ? formatDate(booking.scheduled_date) : "TBD"}
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            label="Scope"
            value={formatCurrency(scopeTotal || Number(booking.quoted_price ?? 0))}
            icon={<ClipboardList className="h-4 w-4" />}
          />
          <StatCard
            label="Paid / Billed"
            value={`${formatCurrency(paid)} / ${formatCurrency(billed)}`}
            icon={<Receipt className="h-4 w-4" />}
          />
          <StatCard
            label="Last activity"
            value={
              events[0] ? formatRelativeTime(events[0].created_at) : "—"
            }
            icon={<Activity className="h-4 w-4" />}
          />
        </div>

        {/* On-site status */}
        {lastCheckin && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-emerald-900">
                  {lastCheckin.kind === "arrival"
                    ? "Pro is on site"
                    : lastCheckin.kind === "departure"
                      ? "Pro left the job"
                      : "Break in progress"}
                </p>
                <p className="text-xs text-emerald-700">
                  {formatRelativeTime(lastCheckin.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scope */}
        {scope.length > 0 && (
          <Section icon={<ClipboardList />} title="Scope of Work">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scope.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{i.title}</span>
                          {i.is_change_order && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                              CO
                            </span>
                          )}
                        </div>
                        {i.description && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {i.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {Number(i.quantity)} {i.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatCurrency(Number(i.unit_price))}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(Number(i.quantity) * Number(i.unit_price))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right text-sm font-medium text-gray-700"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-base font-semibold text-gray-900">
                      {formatCurrency(scopeTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Invoices */}
        {invoices.length > 0 && (
          <Section icon={<Receipt />} title="Payments">
            <div className="space-y-2">
              {invoices.map((inv) => {
                const kc = INVOICE_KIND_CONFIG[inv.kind];
                const sc = INVOICE_STATUS_CONFIG[inv.status];
                return (
                  <div
                    key={inv.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${kc.color}`}
                    >
                      {kc.label}
                    </span>
                    <p className="flex-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(inv.amount))}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${sc.color}`}
                    >
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <Section icon={<Camera />} title="Photos">
            {(["before", "during", "after", "issue"] as PhotoPhase[]).map(
              (p) => {
                const items = photos.filter((ph) => ph.phase === p);
                if (items.length === 0) return null;
                return (
                  <div key={p} className="mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {PHOTO_PHASE_CONFIG[p].label} ({items.length})
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {items.map((ph) => (
                        <div
                          key={ph.id}
                          className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                        >
                          <Image
                            src={ph.url}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 200px, 50vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </Section>
        )}

        {/* Daily logs */}
        {logs.length > 0 && (
          <Section icon={<ClipboardList />} title="Daily Progress">
            <div className="space-y-2">
              {logs.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="font-medium text-gray-900">
                      {formatDate(l.log_date)}
                    </p>
                    {l.percent_complete != null && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        {l.percent_complete}% complete
                      </span>
                    )}
                  </div>
                  {l.notes && (
                    <p className="mt-2 text-sm text-gray-600">{l.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Timeline */}
        <Section icon={<Activity />} title="Activity">
          <Timeline events={events.slice(0, 20)} />
        </Section>

        <div className="pt-6 text-center text-xs text-gray-400">
          Powered by{" "}
          <Link
            href="/"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            Curb
          </Link>{" "}
          — this is a live view of your project. Refresh to see updates.
          {lastLog && (
            <> · Last updated {formatRelativeTime(lastLog.updated_at)}</>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
