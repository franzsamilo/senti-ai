"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AttachmentStyle, LoveLanguage, Song } from "@/lib/types";

/** Everything the user has answered so far. */
export interface AssessmentDraft {
  songs: Song[];
  mbti: string;
  /** null until chosen — nothing is pre-selected on the user's behalf. */
  attachmentStyle: AttachmentStyle | null;
  loveLanguage: LoveLanguage[];
  zodiac: string;
  personalContext: string;
}

export const EMPTY_DRAFT: AssessmentDraft = {
  songs: [],
  mbti: "",
  attachmentStyle: null,
  loveLanguage: [],
  zodiac: "",
  personalContext: "",
};

/** True once every required answer is in (written context is optional). */
export function isDraftComplete(draft: AssessmentDraft): boolean {
  return (
    draft.songs.length >= 3 &&
    Boolean(draft.mbti) &&
    draft.attachmentStyle !== null &&
    draft.loveLanguage.length > 0 &&
    Boolean(draft.zodiac)
  );
}

/**
 * Answers persisted to sessionStorage, so a refresh or an accidental
 * swipe-back doesn't throw away five steps of input. Session-scoped on
 * purpose: it should survive a reload, not follow the user to a shared
 * computer tomorrow.
 *
 * `hydrated` flips once storage has been read — callers that make routing
 * decisions from the draft should wait for it.
 */
export function useAssessmentDraft(storageKey: string) {
  const [draft, setDraft] = useState<AssessmentDraft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const skipNextWrite = useRef(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AssessmentDraft>;
        // Storage is browser-only, so this can't be read during render
        // without a hydration mismatch. Syncing after mount is intended.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft({ ...EMPTY_DRAFT, ...parsed });
      }
    } catch {
      // Corrupt or blocked storage — start fresh.
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    // Don't overwrite stored answers with the empty initial state before the
    // read above has landed.
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Private mode / quota — persistence is a convenience, not a feature.
    }
  }, [draft, storageKey]);

  const update = useCallback(
    <K extends keyof AssessmentDraft>(key: K, value: AssessmentDraft[K]) =>
      setDraft((prev) => ({ ...prev, [key]: value })),
    []
  );

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  return { draft, setDraft, update, reset, hydrated };
}
