"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

/**
 * In-app account deletion card — required by Apple App Store Guideline
 * 5.1.1(v). Hits /api/account/delete which cascades all user data
 * (profile, bookings, reviews, contractor rows, messages) and finally
 * deletes the Supabase auth user.
 *
 * Two-step confirmation: click Delete Account → dialog → type DELETE → confirm.
 * On success, signs out and redirects to /login.
 */
export default function DeleteAccountCard() {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);

    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete account");
        setDeleting(false);
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="mt-8 border-red-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Delete account</p>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteConfirmText("");
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
            <div className="text-sm text-red-800">
              <p className="font-medium">
                This action is permanent and cannot be undone.
              </p>
              <p className="mt-1">
                All your data will be permanently deleted, including your
                profile, bookings, reviews, and messages.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Type <span className="font-bold text-red-600">DELETE</span> to
              confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteConfirmText !== "DELETE" || deleting}
              onClick={handleDeleteAccount}
            >
              {deleting ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Permanently Delete"
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
