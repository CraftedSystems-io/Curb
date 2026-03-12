"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  X,
  Image,
  Pencil,
  Check,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PhotoGallery } from "@/components/portfolio/photo-gallery";
import {
  deletePortfolioPhoto,
  addPortfolioPhoto,
  updatePhotoCaption,
} from "@/lib/actions/portfolio";
import type { ServiceCategory } from "@/types";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  category: ServiceCategory | null;
  sort_order: number;
}

interface PortfolioManagerProps {
  photos: Photo[];
}

export function PortfolioManager({ photos: initialPhotos }: PortfolioManagerProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleDelete(photoId: string) {
    const previous = photos;
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));

    const result = await deletePortfolioPhoto(photoId);
    if (result.error) {
      toast.error(result.error);
      setPhotos(previous);
    } else {
      toast.success("Photo deleted");
    }
  }

  async function handleAddPhoto(formData: FormData) {
    setUploading(true);
    const result = await addPortfolioPhoto(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Photo added to portfolio!");
      setShowUploadForm(false);
      formRef.current?.reset();
      // Reload to get the new photo from the server
      window.location.reload();
    }
    setUploading(false);
  }

  async function handleSaveCaption(photoId: string) {
    const result = await updatePhotoCaption(photoId, captionValue);
    if (result.error) {
      toast.error(result.error);
    } else {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, caption: captionValue } : p
        )
      );
      toast.success("Caption updated");
    }
    setEditingCaption(null);
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Upload section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Add Photos</h2>
            </div>
            <Button
              variant={showUploadForm ? "ghost" : "primary"}
              size="sm"
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              {showUploadForm ? (
                <>
                  <X size={16} className="mr-1.5" /> Cancel
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-1.5" /> Add Photo
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showUploadForm && (
          <CardContent>
            <form ref={formRef} action={handleAddPhoto} className="space-y-4">
              {/* URL input — placeholder for when file upload/storage is configured */}
              <div>
                <Input
                  id="url"
                  name="url"
                  label="Photo URL"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">
                  Paste a direct image URL. File upload coming soon when storage
                  is configured.
                </p>
              </div>

              <Input
                id="caption"
                name="caption"
                label="Caption (optional)"
                placeholder="Describe the work shown in this photo"
              />

              <div className="space-y-1">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  defaultValue=""
                >
                  <option value="">No category</option>
                  <option value="pool">Pool</option>
                  <option value="landscaping">Landscaping</option>
                  <option value="maid">Maid / Cleaning</option>
                </select>
              </div>

              {/* Upload placeholder visual */}
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6">
                <div className="rounded-full bg-emerald-100 p-2">
                  <Image size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Direct file upload coming soon
                  </p>
                  <p className="text-xs text-gray-400">
                    Storage bucket configuration required. For now, use image
                    URLs from hosted images.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" loading={uploading}>
                  Add to Portfolio
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        {!showUploadForm && (
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  High-quality photos help you win more clients. Show off your
                  best before &amp; after shots.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Caption editing list */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Pencil size={16} className="text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Edit Captions</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-2"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || "Photo"}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  {editingCaption === photo.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={captionValue}
                        onChange={(e) => setCaptionValue(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="Enter caption..."
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveCaption(photo.id);
                          }
                          if (e.key === "Escape") {
                            setEditingCaption(null);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleSaveCaption(photo.id)}
                        className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingCaption(null)}
                        className="rounded-lg bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-between">
                      <p
                        className={clsx(
                          "text-sm",
                          photo.caption
                            ? "text-gray-700"
                            : "italic text-gray-400"
                        )}
                      >
                        {photo.caption || "No caption"}
                      </p>
                      <button
                        onClick={() => {
                          setEditingCaption(photo.id);
                          setCaptionValue(photo.caption || "");
                        }}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo gallery */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            Your Portfolio ({photos.length} photo
            {photos.length !== 1 ? "s" : ""})
          </h2>
        </CardHeader>
        <CardContent>
          <PhotoGallery
            photos={photos}
            editable
            onDelete={handleDelete}
            onAddClick={() => {
              setShowUploadForm(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
