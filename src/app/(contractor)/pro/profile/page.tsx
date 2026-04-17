"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { updateContractorProfile } from "@/lib/actions/contractors";
import DeleteAccountCard from "@/components/account/DeleteAccountCard";

export default function ContractorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    business_name: "",
    bio: "",
    years_experience: 0,
    hourly_rate: 0,
    service_radius_m: 40000,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: contractorData } = await supabase
        .from("contractors")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (profileData && contractorData) {
        setProfile({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          business_name: contractorData.business_name || "",
          bio: contractorData.bio || "",
          years_experience: contractorData.years_experience || 0,
          hourly_rate: contractorData.hourly_rate || 0,
          service_radius_m: contractorData.service_radius_m || 40000,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    const result = await updateContractorProfile(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-64 rounded-xl bg-gray-200" />
    </div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>

      <form action={handleSubmit}>
        <Card className="mt-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              Personal Information
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="full_name"
              name="full_name"
              label="Full name"
              defaultValue={profile.full_name}
              required
            />
            <Input
              id="phone"
              name="phone"
              label="Phone"
              type="tel"
              defaultValue={profile.phone}
            />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              Business Details
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="business_name"
              name="business_name"
              label="Business name"
              defaultValue={profile.business_name}
            />
            <div className="space-y-1">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={profile.bio}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Tell clients about yourself and your services..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="years_experience"
                name="years_experience"
                label="Years of experience"
                type="number"
                min={0}
                defaultValue={profile.years_experience}
              />
              <Input
                id="hourly_rate"
                name="hourly_rate"
                label="Base hourly rate ($)"
                type="number"
                min={0}
                step={0.01}
                defaultValue={profile.hourly_rate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service radius: {Math.round(profile.service_radius_m / 1609)} miles
              </label>
              <input
                type="range"
                name="service_radius_m"
                min={8045}
                max={128748}
                step={1609}
                defaultValue={profile.service_radius_m}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    service_radius_m: parseInt(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5 mi</span>
                <span>80 mi</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button type="submit" loading={saving}>
            Save Profile
          </Button>
        </div>
      </form>

      {/* Danger zone — Apple App Store Guideline 5.1.1(v) requires in-app account deletion */}
      <DeleteAccountCard />
    </div>
  );
}
