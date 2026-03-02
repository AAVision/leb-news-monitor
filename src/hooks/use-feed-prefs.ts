"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "lebmon-feed-prefs";

export interface FeedPrefs {
  /** Source names in desired display order */
  order: string[];
  /** Source names that are hidden */
  hidden: Set<string>;
}

function loadPrefs(): FeedPrefs {
  if (typeof window === "undefined") return { order: [], hidden: new Set() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: [], hidden: new Set() };
    const parsed = JSON.parse(raw);
    return {
      order: parsed.order ?? [],
      hidden: new Set(parsed.hidden ?? []),
    };
  } catch {
    return { order: [], hidden: new Set() };
  }
}

function savePrefs(prefs: FeedPrefs) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      order: prefs.order,
      hidden: [...prefs.hidden],
    })
  );
}

export function useFeedPrefs() {
  const [prefs, setPrefs] = useState<FeedPrefs>({ order: [], hidden: new Set() });

  // Load from localStorage on mount
  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const toggleSource = useCallback((source: string) => {
    setPrefs((prev) => {
      const next = { order: [...prev.order], hidden: new Set(prev.hidden) };
      if (next.hidden.has(source)) {
        next.hidden.delete(source);
      } else {
        next.hidden.add(source);
      }
      savePrefs(next);
      return next;
    });
  }, []);

  const moveSource = useCallback((source: string, direction: "up" | "down") => {
    setPrefs((prev) => {
      const order = [...prev.order];
      const idx = order.indexOf(source);
      if (idx === -1) return prev;

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= order.length) return prev;

      [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
      const next = { order, hidden: new Set(prev.hidden) };
      savePrefs(next);
      return next;
    });
  }, []);

  /** Ensure all known sources are in the order list */
  const syncSources = useCallback((sources: string[]) => {
    setPrefs((prev) => {
      const existing = new Set(prev.order);
      const newSources = sources.filter((s) => !existing.has(s));
      if (newSources.length === 0 && prev.order.length === sources.length) return prev;

      // Keep existing order, append new sources at end
      const order = [...prev.order.filter((s) => sources.includes(s)), ...newSources];
      const next = { order, hidden: new Set([...prev.hidden].filter((s) => sources.includes(s))) };
      savePrefs(next);
      return next;
    });
  }, []);

  return { prefs, toggleSource, moveSource, syncSources };
}
