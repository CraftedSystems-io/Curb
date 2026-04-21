"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSignature, Plus, Copy, Check, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format";

type WaiverWithCount = {
  id: string;
  title: string;
  body: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  waiver_signatures: { count: number }[];
};

export function WaiversClient({ templates }: { templates: WaiverWithCount[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function openNew() {
    setEditing("new");
    setDraft({ title: "", body: DEFAULT_WAIVER });
  }

  function openEdit(tmpl: WaiverWithCount) {
    setEditing(tmpl.id);
    setDraft({ title: tmpl.title, body: tmpl.body });
  }

  async function save() {
    if (!draft.title.trim() || !draft.body.trim())
      return toast.error("Title and body required");
    const res = await fetch("/api/waivers", {
      method: editing === "new" ? "POST" : "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        editing === "new" ? draft : { id: editing, ...draft }
      ),
    });
    if (!res.ok) return toast.error("Could not save waiver");
    toast.success(editing === "new" ? "Waiver created" : "Waiver updated");
    setEditing(null);
    startTransition(() => router.refresh());
  }

  async function remove(id: string) {
    if (!confirm("Archive this waiver? Existing signatures stay intact."))
      return;
    const res = await fetch(`/api/waivers?id=${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Could not archive");
    toast.success("Archived");
    startTransition(() => router.refresh());
  }

  async function copyLink(id: string) {
    const url = `${window.location.origin}/waiver/${id}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Sign link copied");
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (editing !== null) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {editing === "new" ? "New waiver" : "Edit waiver"}
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Pool Service Waiver"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Body (plain text; each blank line is a new paragraph)
            </label>
            <textarea
              rows={14}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditing(null)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Save waiver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          New waiver
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <FileSignature className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-900">No waivers yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create your first waiver and share the link with clients before a
            job starts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => {
            const count = t.waiver_signatures?.[0]?.count ?? 0;
            return (
              <div
                key={t.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FileSignature className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-500">
                    v{t.version} · {count} signature{count === 1 ? "" : "s"} ·
                    updated {formatDate(t.updated_at)}
                  </p>
                </div>
                <button
                  onClick={() => copyLink(t.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  {copiedId === t.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedId === t.id ? "Copied" : "Copy link"}
                </button>
                <a
                  href={`/waiver/${t.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </a>
                <button
                  onClick={() => openEdit(t)}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Archive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const DEFAULT_WAIVER = `ASSUMPTION OF RISK AND RELEASE

In consideration of the services being provided, I acknowledge and agree to the following:

1. I understand that the services involve certain inherent risks including but not limited to property damage, personal injury, and unforeseen outcomes.

2. I voluntarily assume all risks associated with the services to be performed at my property.

3. I release the service provider from any and all claims, demands, or causes of action that may arise from the services, except in cases of gross negligence or willful misconduct.

4. I represent that I am the owner or authorized representative of the property where services will be performed.

5. I confirm that I have read, understood, and voluntarily agree to this waiver.

By signing below, I certify that the information provided is true and that I am entering into this agreement freely and willingly.
`;
