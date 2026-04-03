import { useEffect, useState } from "react";

type Scheme = "light" | "dark";

// Key stored in localStorage to persist user preference on web
const STORAGE_KEY = "theme";

function readStoredScheme(): Scheme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    // ignore (e.g., SSR or denied storage)
  }
  return null;
}

export function useColorScheme(): Scheme {
  const getSystem = () => {
    try {
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
    } catch {
      // ignore
    }
    return "light";
  };

  const [scheme, setScheme] = useState<Scheme>(() => {
    const stored = readStoredScheme();
    return stored ?? getSystem();
  });

  //O Keep the document element class in sync: only add 'dark' class when in dark mode,
  // otherwise remove it. We don't add a 'light' class.
  useEffect(() => {
    try {
      if (typeof document !== "undefined" && document.documentElement) {
        if (scheme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
    } catch {
      // ignore
    }
  }, [scheme]);

  useEffect(() => {
    const onSystemChange = (e: MediaQueryListEvent) => {
      const stored = readStoredScheme();
      if (stored) return; // user override takes precedence
      setScheme(e.matches ? "dark" : "light");
    };
    const mql =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    if (mql) {
      // modern addEventListener or fallback to addListener
      if (mql.addEventListener) mql.addEventListener("change", onSystemChange);
      else if ((mql as any).addListener)
        (mql as any).addListener(onSystemChange);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const stored = readStoredScheme();
        if (stored) setScheme(stored);
        else setScheme(getSystem());
      }
    };

    const onThemeChange = () => {
      const stored = readStoredScheme();
      if (stored) setScheme(stored);
      else setScheme(getSystem());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("theme-change", onThemeChange as EventListener);

    return () => {
      if (mql) {
        if (mql.removeEventListener)
          mql.removeEventListener("change", onSystemChange);
        else if ((mql as any).removeListener)
          (mql as any).removeListener(onSystemChange);
      }
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "theme-change",
        onThemeChange as EventListener,
      );
    };
  }, []);

  return scheme;
}

export function setColorScheme(value: Scheme | null) {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
  // Update DOM immediately so UI responds without waiting for listeners.
  try {
    if (typeof document !== "undefined" && document.documentElement) {
      if (value === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  } catch {
    // ignore
  }
  // notify listeners on the same window
  window.dispatchEvent(new Event("theme-change"));
}

// Provide a default export for environments or hot-reloads that expect it.
export default {
  useColorScheme,
  setColorScheme,
};
