"use client";

import { useCallback, useEffect, useRef } from "react";

const STATE_KEY = "sentiStep";

/**
 * Binds the multi-step flow to the browser's history stack.
 *
 * Without this the whole app lives at one URL with no history entries, so a
 * user reaching for Back — the hardware button on Android, the swipe gesture
 * on iOS, the browser chevron on desktop — leaves the site entirely and loses
 * everything they filled in. Each forward step now pushes an entry, so Back
 * walks the flow in reverse and only exits from the landing screen.
 *
 * Steps that shouldn't be returned to (the analysis run, the rate-limit
 * screen) replace the current entry instead of pushing, so Back skips past
 * them to the last real question.
 */
export function useStepHistory<T extends string>(
  step: T,
  setStep: (step: T) => void,
  options?: { replaceFor?: readonly T[] }
) {
  const replaceFor = options?.replaceFor ?? [];
  // Set while responding to popstate, so the resulting step change doesn't
  // push a duplicate entry back onto the stack.
  const poppingRef = useRef(false);
  const stepRef = useRef(step);
  stepRef.current = step;

  // Tag the initial entry so popstate can recognise our own states.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.history.state?.[STATE_KEY]) {
      window.history.replaceState(
        { ...window.history.state, [STATE_KEY]: stepRef.current },
        ""
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onPopState(event: PopStateEvent) {
      const target = event.state?.[STATE_KEY] as T | undefined;
      // No tagged state means the user has walked back past our first entry —
      // let the browser do what it would normally do.
      if (!target) return;
      poppingRef.current = true;
      setStep(target);
      // Cleared on the next frame so the step change lands first.
      requestAnimationFrame(() => {
        poppingRef.current = false;
      });
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setStep]);

  /** Navigate forward, recording an entry the Back button can return through. */
  const goTo = useCallback(
    (next: T) => {
      setStep(next);
      if (typeof window === "undefined" || poppingRef.current) return;
      const method = replaceFor.includes(next) ? "replaceState" : "pushState";
      window.history[method]({ ...window.history.state, [STATE_KEY]: next }, "");
    },
    // replaceFor is a literal list defined at the call site; re-running on
    // identity change would rebind the callback every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStep]
  );

  /** Step backwards through the history stack. */
  const goBack = useCallback(() => {
    if (typeof window === "undefined") return;
    window.history.back();
  }, []);

  return { goTo, goBack };
}
