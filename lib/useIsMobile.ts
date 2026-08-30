"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  return isMobile;
}
