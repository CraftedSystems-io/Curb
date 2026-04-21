"use client";

import { useState } from "react";
import { FileSignature, Copy, Check, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { WaiverTemplate, WaiverSignature } from "@/types";
import { formatDate } from "@/lib/utils/format";

export function WaiversPanel({
  bookingId,
  contractorTemplates,
  signatures,
  role,
}: {
  bookingId: string;
  contractorTemplates: WaiverTemplate[];
  signatures: (WaiverSignature & { waiver_templates?: { title: string } })[];
  role: "client" | "contractor";
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyLink(tmpl: WaiverTemplate) {
    const url = `${window.location.origin}/waiver/${tmpl.id}?booking=${bookingId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(tmpl.id);
    toast.success("Sign link copied");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-4">
      {signatures.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Signed
          </p>
          <div className="mt-2 space-y-2">
            {signatures.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {s.waiver_templates?.title ?? "Waiver"}
                  </p>
                  <p className="text-xs text-gray-600">
                    Signed by {s.signer_name} on {formatDate(s.signed_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {role === "contractor" && contractorTemplates.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Send to client
          </p>
          <div className="mt-2 space-y-2">
            {contractorTemplates.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <FileSignature className="h-4 w-4" />
                </span>
                <p className="flex-1 text-sm font-medium text-gray-900">
                  {t.title}
                </p>
                <button
                  onClick={() => copyLink(t)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  {copiedId === t.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedId === t.id ? "Copied" : "Copy sign link"}
                </button>
                <a
                  href={`/waiver/${t.id}?booking=${bookingId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {role === "contractor" && contractorTemplates.length === 0 && (
        <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
          No waivers yet.{" "}
          <a
            href="/pro/waivers"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            Create one
          </a>{" "}
          to send for signing.
        </p>
      )}

      {signatures.length === 0 && role === "client" && (
        <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
          No waivers required for this project.
        </p>
      )}
    </div>
  );
}
