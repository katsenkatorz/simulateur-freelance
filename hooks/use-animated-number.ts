"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

export function useAnimatedNumber(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const objRef = useRef({ val: target });

  useEffect(() => {
    if (prevRef.current === target) return;
    const from = prevRef.current;
    prevRef.current = target;
    objRef.current.val = from;

    animate(objRef.current, {
      val: target,
      duration,
      easing: "outExpo",
      onUpdate: () => {
        setDisplay(Math.round(objRef.current.val));
      },
    });
  }, [target, duration]);

  return display;
}
