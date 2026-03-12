"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={clsx(
        "w-full max-w-lg rounded-xl border-0 bg-white p-0 shadow-xl backdrop:bg-black/50",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </dialog>
  );
}
