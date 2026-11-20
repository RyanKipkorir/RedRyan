import { useLayoutEffect, useRef } from "react";
import { gsap, reduceMotion, whenReady } from "./storyUtils";
import { STORY_BAR_COUNT } from "../../../constants/index.js";

const StorySwap = () => {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    const bars = el.querySelectorAll(".story-bar");
    const text = el.querySelector(".story-swap-text");

    if (reduceMotion()) {
      gsap.set(bars, { xPercent: 100 });
      gsap.set(text, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {}, el);
    const cancel = whenReady(() => {
      ctx.add(() => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              scrub: 0.5,
              pin: true,
              start: "top top",
              end: "+=150%",
            },
          })
          .to(bars, {
            force3D: true,
            duration: 1,
            xPercent: 100,
            ease: "power1.inOut",
            stagger: { amount: 1 },
          })
          .to(bars, { ease: "power1.out", duration: 1, rotation: 45 }, 0)
          .to(bars, { ease: "power1.in", duration: 1, rotation: 0 }, 1)
          /* once the bars clear, the "I" steps in */
          .fromTo(
            text,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, ease: "power2.out", duration: 1 },
            1.2,
          );
      });
    });

    return () => {
      cancel();
      ctx.revert();
    };
  }, []);

  return (
    <div className="story-swap" ref={root}>
      <p className="story-swap-text">
        <span>However</span>
        <span className="story-i">I</span>
        <span>was suspended from GitHub.</span>
      </p>
      {Array.from({ length: STORY_BAR_COUNT }, (_, i) => (
        <i key={i} className="story-bar" aria-hidden="true" />
      ))}
    </div>
  );
};

export default StorySwap;
