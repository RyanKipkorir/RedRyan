import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const rand = (min, max) => gsap.utils.random(min, max);

export const riseOnScroll = (trigger, targets, vars = {}) => {
  const els = gsap.utils.toArray(targets);
  if (!trigger || !els.length) return null;

  return gsap.from(els, {
    y: 32,
    opacity: 0,
    duration: 0.85,
    stagger: 0.08,
    ease: "power3.out",
    clearProps: "transform",
    scrollTrigger: {
      trigger,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
    ...vars,
  });
};

export const whenReady = (fn) => {
  let cancelled = false;
  let rafId = 0;

  const run = () => {
    if (cancelled) return;
    rafId = requestAnimationFrame(() => {
      if (!cancelled) fn();
    });
  };

  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(run);
  } else {
    run();
  }

  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
  };
};
