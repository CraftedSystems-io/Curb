"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { BookingScopeItem } from "@/types";
import { formatCurrency } from "@/lib/utils/format";

export function ScopeEditor({
  bookingId,
  items,
  editable,
}: {
  bookingId: string;
  items: BookingScopeItem[];
  editable: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    quantity: 1,
    unit: "ea",
    unit_price: 0,
    is_change_order: false,
  });

  const total = items.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unit_price),
    0
  );

  async function addItem() {
    if (!draft.title.trim()) return toast.error("Add a title");
    const res = await fetch(`/api/bookings/${bookingId}/scope`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) return toast.error("Could not add item");
    toast.success(draft.is_change_order ? "Change order added" : "Line item added");
    setDraft({
      title: "",
      description: "",
      quantity: 1,
      unit: "ea",
      unit_price: 0,
      is_change_order: false,
    });
    startTransition(() => router.refresh());
  }

  async function removeItem(itemId: string) {
    const res = await fetch(
      `/api/bookings/${bookingId}/scope?itemId=${itemId}`,
      { method: "DELETE" }
    );
    if (!res.ok) return toast.error("Could not remove item");
    toast.success("Removed");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && !editable && (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
          No scope items yet.
        </p>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Unit</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Total</th>
                {editable && <th className="px-2 py-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((i) => (
                <tr key={i.id} className="bg-white">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{i.title}</span>
                      {i.is_change_order && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                          <Sparkles className="h-3 w-3" />
                          CO
                        </span>
                      )}
                    </div>
                    {i.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{i.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{Number(i.quantity)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{i.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(Number(i.unit_price))}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(Number(i.quantity) * Number(i.unit_price))}
                  </td>
                  {editable && (
                    <td className="px-2 py-3 text-right">
                      <button
                        onClick={() => removeItem(i.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td
                  colSpan={editable ? 5 : 4}
                  className="px-4 py-3 text-right text-sm font-medium text-gray-700"
                >
                  Total
                </td>
                <td
                  colSpan={editable ? 1 : 1}
                  className="px-4 py-3 text-right text-base font-semibold text-gray-900"
                >
                  {formatCurrency(total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {editable && (
        <div className="rounded-xl border border-dashed border-gray-300 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Add line item
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-6">
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-3"
              placeholder="Title (e.g. Pool chemical balance)"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              type="number"
              step="0.5"
              placeholder="Qty"
              value={draft.quantity}
              onChange={(e) =>
                setDraft({ ...draft, quantity: Number(e.target.value) })
              }
            />
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={draft.unit}
              onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
            >
              <option value="ea">ea</option>
              <option value="hr">hr</option>
              <option value="sqft">sqft</option>
              <option value="lf">lf</option>
              <option value="lump">lump</option>
            </select>
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              type="number"
              step="0.01"
              placeholder="Unit price"
              value={draft.unit_price}
              onChange={(e) =>
                setDraft({ ...draft, unit_price: Number(e.target.value) })
              }
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={draft.is_change_order}
                onChange={(e) =>
                  setDraft({ ...draft, is_change_order: e.target.checked })
                }
              />
              Mark as change order
            </label>
            <button
              onClick={addItem}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
