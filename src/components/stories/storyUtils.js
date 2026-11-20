import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

export { gsap, ScrollTrigger, SplitText };

export const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const rand = (min, max) =>
  Math.floor(Math.random() * (1 + max - min) + min);

export const riseOnScroll = (trigger, targets, extra = {}) =>
  gsap.from(targets, {
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: { trigger, start: "top top", once: true },
    ...extra,
  });

export const pinPage = (el) =>
  ScrollTrigger.create({
    trigger: el,
    start: "top top",
    end: () => `+=${window.innerHeight}`,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });

/* run setup once fonts are ready, in the order components asked for it,
   so every pin is measured against the same layout */
export const whenReady = (cb) => {
  let live = true;
  const ready = document.fonts?.ready ?? Promise.resolve();
  ready.then(() => {
    if (live) cb();
  });
  return () => {
    live = false;
  };
};
