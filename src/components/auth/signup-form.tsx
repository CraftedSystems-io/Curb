"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RoleSelector } from "./role-selector";

export function SignupForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "client";
  const [role, setRole] = useState<string>(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("role", role);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Create your account
        </h1>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <RoleSelector value={role} onChange={setRole} />
          <Input
            id="full_name"
            name="full_name"
            type="text"
            label="Full name"
            placeholder="John Doe"
            required
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Min 6 characters"
            minLength={6}
            required
          />
          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <Button type="submit" className="w-full" loading={loading}>
            {role === "contractor"
              ? "Join as Contractor"
              : "Sign up as Client"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
