"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  MapPin,
  Save,
  Loader2,
  Camera,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notification preferences (client-side only for now)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Settings saved successfully");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account preferences and profile information
        </p>
      </div>

      {/* Profile Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 pb-16">
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </CardHeader>
        <CardContent className="-mt-12 pb-6">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || "User"}
                size="lg"
              />
              <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-emerald-600 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {profile?.full_name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {profile?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                <User size={14} className="text-gray-400" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail size={14} className="text-gray-400" />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed here
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone size={14} className="text-gray-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Bell size={18} className="text-gray-400" />
            Notifications
          </h2>
        </CardHeader>
        <CardContent className="space-y-1 divide-y divide-gray-100">
          <ToggleRow
            label="Email notifications"
            description="Receive booking updates and messages via email"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          <ToggleRow
            label="Push notifications"
            description="Get instant updates on your device"
            checked={pushNotifications}
            onChange={setPushNotifications}
          />
          <ToggleRow
            label="Booking reminders"
            description="Reminders 24 hours before your scheduled service"
            checked={bookingReminders}
            onChange={setBookingReminders}
          />
          <ToggleRow
            label="Marketing emails"
            description="Tips, promotions, and updates from Curb"
            checked={marketingEmails}
            onChange={setMarketingEmails}
          />
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield size={18} className="text-gray-400" />
            Privacy & Security
          </h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <button className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Change password
              </p>
              <p className="text-xs text-gray-500">
                Update your account password
              </p>
            </div>
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Two-factor authentication
              </p>
              <p className="text-xs text-gray-500">
                Add an extra layer of security
              </p>
            </div>
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">
              Coming soon
            </span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Download my data
              </p>
              <p className="text-xs text-gray-500">
                Export your account data
              </p>
            </div>
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </CardContent>
      </Card>

      {/* Default Address */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MapPin size={18} className="text-gray-400" />
            Default Address
          </h2>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Enter your default service address"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            This will be pre-filled when you book a service
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[140px]"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle size={16} className="mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="mt-8 border-red-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Delete account</p>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          checked ? "bg-emerald-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
