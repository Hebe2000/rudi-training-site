"use client";

import { useEffect } from "react";

const SIZE_CLASS = {
  md: "max-w-md",
  lg: "max-w-2xl",
};

export default function Modal({
  onClose,
  children,
  size = "md",
}: {
  onClose: () => void;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Outer wrapper stays unclipped so the close button's negative offset is never cut off. */}
      <div className={`relative w-full ${SIZE_CLASS[size]}`}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-clay text-base leading-none text-white shadow-md hover:bg-clay-strong"
        >
          ×
        </button>
        <div className="scroll-thin max-h-[85vh] overflow-y-auto rounded-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
