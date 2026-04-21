"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Share2, Copy, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import type { BookingShareToken } from "@/types";
import { formatDate } from "@/lib/utils/format";

export function ShareButton({
  bookingId,
  token,
}: {
  bookingId: string;
  token: BookingShareToken | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/portal/${token.token}`
      : null;

  async function create() {
    setBusy(true);
    const res = await fetch(`/api/bookings/${bookingId}/share`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.ok) return toast.error("Could not create share link");
    toast.success("Share link created");
    startTransition(() => router.refresh());
  }

  async function revoke() {
    setBusy(true);
    const res = await fetch(`/api/bookings/${bookingId}/share`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) return toast.error("Could not revoke");
    toast.success("Link revoked");
    startTransition(() => router.refresh());
  }

  async function copy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <Share2 className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Public project page</p>
          <p className="mt-1 text-sm text-gray-600">
            Anyone with the link sees live project status — no login needed.
            Revoke any time.
          </p>

          {token ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                <input
                  readOnly
                  value={shareUrl ?? ""}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-gray-700 outline-none"
                />
                <button
                  onClick={copy}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow hover:bg-gray-50"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {token.view_count} view{token.view_count === 1 ? "" : "s"}
                  {token.last_viewed_at && (
                    <> · last {formatDate(token.last_viewed_at)}</>
                  )}
                </span>
                <span>
                  {token.expires_at && <>expires {formatDate(token.expires_at)}</>}
                </span>
              </div>
              <button
                onClick={revoke}
                disabled={busy}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Revoke link
              </button>
            </div>
          ) : (
            <button
              onClick={create}
              disabled={busy}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" />
              {busy ? "Creating…" : "Create share link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
