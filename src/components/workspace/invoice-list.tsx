"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BookingInvoice, InvoiceKind, InvoiceStatus } from "@/types";
import {
  INVOICE_KIND_CONFIG,
  INVOICE_STATUS_CONFIG,
} from "@/lib/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export function InvoiceList({
  bookingId,
  invoices,
  editable,
  quotedPrice,
}: {
  bookingId: string;
  invoices: BookingInvoice[];
  editable: boolean;
  quotedPrice: number | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState<{
    kind: InvoiceKind;
    amount: number;
    notes: string;
  }>({
    kind: "deposit",
    amount: 0,
    notes: "",
  });

  const totalBilled = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);
  const outstanding = totalBilled - totalPaid;

  async function addInvoice() {
    if (!draft.amount || draft.amount <= 0) return toast.error("Enter an amount");
    const res = await fetch(`/api/bookings/${bookingId}/invoices`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) return toast.error("Could not create invoice");
    toast.success("Invoice created");
    setDraft({ kind: "deposit", amount: 0, notes: "" });
    startTransition(() => router.refresh());
  }

  async function updateStatus(invoiceId: string, status: InvoiceStatus) {
    const res = await fetch(`/api/bookings/${bookingId}/invoices`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ invoiceId, status }),
    });
    if (!res.ok) return toast.error("Could not update invoice");
    toast.success(`Marked ${status}`);
    startTransition(() => router.refresh());
  }

  async function removeInvoice(invoiceId: string) {
    const res = await fetch(
      `/api/bookings/${bookingId}/invoices?invoiceId=${invoiceId}`,
      { method: "DELETE" }
    );
    if (!res.ok) return toast.error("Could not delete invoice");
    toast.success("Deleted");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Quoted"
          value={quotedPrice ? formatCurrency(quotedPrice) : "—"}
          color="bg-gray-50"
        />
        <Stat
          label="Paid"
          value={formatCurrency(totalPaid)}
          color="bg-emerald-50 text-emerald-800"
        />
        <Stat
          label="Outstanding"
          value={formatCurrency(outstanding)}
          color="bg-amber-50 text-amber-800"
        />
      </div>

      {/* List */}
      {invoices.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
          No invoices yet.
        </p>
      ) : (
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
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(Number(inv.amount))}
                  </p>
                  {inv.notes && (
                    <p className="text-xs text-gray-500">{inv.notes}</p>
                  )}
                  {inv.paid_at && (
                    <p className="mt-0.5 text-xs text-emerald-700">
                      Paid {formatDate(inv.paid_at)}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${sc.color}`}
                >
                  {sc.label}
                </span>
                {editable && (
                  <div className="flex items-center gap-1">
                    {inv.status !== "paid" && (
                      <button
                        onClick={() => updateStatus(inv.id, "paid")}
                        className="rounded-md bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                        title="Mark paid"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeInvoice(inv.id)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editable && (
        <div className="rounded-xl border border-dashed border-gray-300 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Create invoice
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-6">
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
              value={draft.kind}
              onChange={(e) =>
                setDraft({ ...draft, kind: e.target.value as InvoiceKind })
              }
            >
              <option value="deposit">Deposit</option>
              <option value="progress">Progress</option>
              <option value="final">Final</option>
              <option value="change_order">Change Order</option>
            </select>
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-1"
              type="number"
              step="0.01"
              placeholder="Amount"
              value={draft.amount}
              onChange={(e) =>
                setDraft({ ...draft, amount: Number(e.target.value) })
              }
            />
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-3"
              placeholder="Notes (optional)"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={addInvoice}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
