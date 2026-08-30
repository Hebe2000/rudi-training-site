"use client";

import { useEffect } from "react";

export default function ScrollToHash() {
  useEffect(() => {
    if (!window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    el?.scrollIntoView({ block: "start" });
  }, []);

  return null;
}
