"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

const POLL_INTERVAL = 30_000;

interface FeedState {
  items: FeedItem[];
  /** IDs of items added in the most recent batch (for entrance animation) */
  newIds: Set<string>;
  sources: number;
  errors: string[];
  fetchedAt: string;
  isLoading: boolean;
  isStreaming: boolean;
}

/**
 * Streams feeds from /api/feeds via NDJSON.
 * Items appear as each source resolves — no waiting for all 47.
 * On refresh, merges new items into existing list without disrupting the UI.
 * Re-fetches every 30s.
 */
export function useFeedStream() {
  const [state, setState] = useState<FeedState>({
    items: [],
    newIds: new Set(),
    sources: 0,
    errors: [],
    fetchedAt: "",
    isLoading: true,
    isStreaming: false,
  });

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStream = useCallback(async (isInitial: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({
      ...prev,
      isLoading: isInitial && prev.items.length === 0,
      isStreaming: true,
    }));

    const batchErrors: string[] = [];

    try {
      const res = await fetch("/api/feeds", { signal: controller.signal });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);

            if (msg.type === "batch") {
              setState((prev) => {
                const { merged, addedIds } = mergeItems(prev.items, msg.items as FeedItem[]);
                if (addedIds.size === 0 && merged === prev.items) return { ...prev, isLoading: false };

                // Clear newIds after animation plays (300ms matches card-in duration)
                if (addedIds.size > 0) {
                  setTimeout(() => {
                    setState((s) => (s.newIds.size > 0 ? { ...s, newIds: new Set() } : s));
                  }, 600);
                }

                return {
                  ...prev,
                  items: merged,
                  newIds: addedIds,
                  isLoading: false,
                };
              });
            } else if (msg.type === "error") {
              batchErrors.push(`${msg.source}: ${msg.message}`);
            } else if (msg.type === "done") {
              setState((prev) => ({
                ...prev,
                sources: msg.sources,
                errors: batchErrors,
                fetchedAt: msg.fetchedAt,
                isLoading: false,
                isStreaming: false,
              }));
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        errors: [...batchErrors, (err as Error).message],
      }));
    }
  }, []);

  useEffect(() => {
    fetchStream(true);

    timerRef.current = setInterval(() => {
      fetchStream(false);
    }, POLL_INTERVAL);

    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchStream]);

  return state;
}

/**
 * Merge new items into existing list.
 * Returns the merged array + the set of newly added item IDs.
 */
function mergeItems(
  existing: FeedItem[],
  incoming: FeedItem[]
): { merged: FeedItem[]; addedIds: Set<string> } {
  const seen = new Set<string>();
  for (const item of existing) {
    seen.add(`${item.source}::${item.link}`);
  }

  const addedIds = new Set<string>();
  const newItems: FeedItem[] = [];
  for (const item of incoming) {
    const key = `${item.source}::${item.link}`;
    if (!seen.has(key)) {
      seen.add(key);
      newItems.push(item);
      addedIds.add(item.id);
    }
  }

  if (newItems.length === 0) return { merged: existing, addedIds };

  const merged = [...existing, ...newItems];
  merged.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  return { merged, addedIds };
}
