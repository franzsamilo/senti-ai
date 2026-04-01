"use client";

import { useRef, useState, useCallback } from "react";

export function useSound() {
  const [muted, setMuted] = useState(true); // muted by default
  const audioCtxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    // Resume context if suspended (browsers suspend on page load until user gesture)
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  // Quick descending tone: 800Hz → 400Hz over 50ms, gain 0.1
  const playClick = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, [muted]);

  // Ascending "lock-in" tone: 400Hz → 800Hz over 150ms, gain 0.15
  const playLockIn = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }, [muted]);

  // Two-tone alert: 440Hz then 660Hz, square wave, 80ms each
  const playAlert = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();

    function playTone(freq: number, startTime: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.08);
    }

    playTone(440, ctx.currentTime);
    playTone(660, ctx.currentTime + 0.1); // slight gap between tones
  }, [muted]);

  return { muted, setMuted, playClick, playLockIn, playAlert };
}
