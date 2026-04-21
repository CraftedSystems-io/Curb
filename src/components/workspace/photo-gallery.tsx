"use client";

import Image from "next/image";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BookingPhoto, PhotoPhase } from "@/types";
import { PHOTO_PHASE_CONFIG } from "@/lib/utils/constants";
import { createClient } from "@/lib/supabase/client";

export function PhotoGallery({
  bookingId,
  photos,
  canUpload,
  canDelete,
}: {
  bookingId: string;
  photos: BookingPhoto[];
  canUpload: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [phase, setPhase] = useState<PhotoPhase>("during");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const phases: PhotoPhase[] = ["before", "during", "after", "issue"];
  const grouped = phases.map((p) => ({
    phase: p,
    items: photos.filter((ph) => ph.phase === p),
  }));

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);

    const supabase = createClient();
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `bookings/${bookingId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("booking-photos")
        .upload(path, file, { contentType: file.type });
      if (upErr) {
        toast.error(`Upload failed: ${upErr.message}`);
        continue;
      }
      const { data: pub } = supabase.storage
        .from("booking-photos")
        .getPublicUrl(path);
      const res = await fetch(`/api/bookings/${bookingId}/photos`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: pub.publicUrl, phase }),
      });
      if (!res.ok) {
        toast.error("Could not record photo");
        continue;
      }
    }
    setUploading(false);
    toast.success("Photos uploaded");
    if (fileInput.current) fileInput.current.value = "";
    startTransition(() => router.refresh());
  }

  async function remove(photoId: string) {
    const res = await fetch(
      `/api/bookings/${bookingId}/photos?photoId=${photoId}`,
      { method: "DELETE" }
    );
    if (!res.ok) return toast.error("Could not delete");
    toast.success("Deleted");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {canUpload && (
        <div className="rounded-xl border border-dashed border-gray-300 p-4">
          <div className="flex items-center gap-3">
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value as PhotoPhase)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {phases.map((p) => (
                <option key={p} value={p}>
                  {PHOTO_PHASE_CONFIG[p].label}
                </option>
              ))}
            </select>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload photos"}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPick}
                disabled={uploading}
              />
            </label>
            <span className="text-xs text-gray-500">
              Tagged as {PHOTO_PHASE_CONFIG[phase].label}
            </span>
          </div>
        </div>
      )}

      {photos.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
          No photos yet.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(
            ({ phase: p, items }) =>
              items.length > 0 && (
                <div key={p}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {PHOTO_PHASE_CONFIG[p].label}{" "}
                    <span className="text-gray-400">({items.length})</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((ph) => (
                      <div
                        key={ph.id}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                      >
                        <Image
                          src={ph.url}
                          alt={ph.caption ?? ""}
                          fill
                          sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                          className="object-cover"
                        />
                        {canDelete && (
                          <button
                            onClick={() => remove(ph.id)}
                            className="absolute right-1 top-1 rounded-full bg-white/90 p-1.5 opacity-0 shadow transition-opacity hover:bg-red-50 group-hover:opacity-100"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
