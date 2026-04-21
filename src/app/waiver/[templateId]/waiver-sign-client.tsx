"use client";

import { useRef, useState, useEffect } from "react";
import { Eraser, PenLine, Check } from "lucide-react";
import { toast } from "sonner";

export function WaiverSignClient({
  templateId,
  bookingId,
  title,
  body,
  proName,
}: {
  templateId: string;
  bookingId: string | null;
  title: string;
  body: string;
  proName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  // Drawing state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI setup
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;

    let drawing = false;
    let prev: { x: number; y: number } | null = null;

    function getPoint(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function start(e: PointerEvent) {
      e.preventDefault();
      drawing = true;
      prev = getPoint(e);
    }
    function move(e: PointerEvent) {
      if (!drawing || !prev) return;
      const p = getPoint(e);
      ctx!.beginPath();
      ctx!.moveTo(prev.x, prev.y);
      ctx!.lineTo(p.x, p.y);
      ctx!.stroke();
      prev = p;
      setHasInk(true);
    }
    function end() {
      drawing = false;
      prev = null;
    }

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    return () => {
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
  }, []);

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  async function submit() {
    if (!name.trim()) return toast.error("Enter your full name");
    if (!agreed) return toast.error("Tick the agreement box");
    if (!hasInk) return toast.error("Sign in the box above");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");

    setSubmitting(true);
    const res = await fetch("/api/waivers/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        template_id: templateId,
        signer_name: name.trim(),
        signer_email: email.trim() || undefined,
        signature_svg: dataUrl,
        booking_id: bookingId ?? undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const msg = (await res.json()).error ?? "Could not sign";
      return toast.error(msg);
    }
    setSigned(true);
  }

  if (signed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Signed</h1>
        <p className="mt-2 text-gray-600">
          Thanks, {name}. {proName} has been notified.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">From {proName}</p>
        <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap text-gray-700">
          {body}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Homeowner"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Sign below
            </label>
            <button
              onClick={clear}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <canvas
              ref={canvasRef}
              className="block h-40 w-full touch-none rounded-lg bg-white"
              style={{ touchAction: "none" }}
            />
          </div>
        </div>

        <label className="mt-4 flex items-start gap-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-gray-700">
            I have read and agree to the terms above. I understand my signature
            and timestamp will be permanently recorded.
          </span>
        </label>

        <div className="mt-6 flex justify-end">
          <button
            onClick={submit}
            disabled={submitting || !name || !agreed || !hasInk}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <PenLine className="h-4 w-4" />
            {submitting ? "Signing…" : "Sign waiver"}
          </button>
        </div>
      </div>
    </div>
  );
}
