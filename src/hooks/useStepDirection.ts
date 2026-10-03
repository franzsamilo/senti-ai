"use client";

import { useState } from "react";

/**
 * 1 when the flow moved forward, -1 when it moved back — so step transitions
 * can slide the way the user is travelling. Derived during render with the
 * "adjust state when a prop changes" pattern, so the direction is already
 * right on the frame the new step mounts (an effect would be one frame late).
 */
export function useStepDirection<T extends string>(step: T, order: readonly T[]): number {
  const [previous, setPrevious] = useState(step);
  const [direction, setDirection] = useState(1);

  if (step !== previous) {
    const from = order.indexOf(previous);
    const to = order.indexOf(step);
    setDirection(to >= from ? 1 : -1);
    setPrevious(step);
  }

  return direction;
}
