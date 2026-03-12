import { MapPin } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <div className="absolute -inset-3 animate-ping rounded-2xl bg-emerald-400 opacity-20" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
