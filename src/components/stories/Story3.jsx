import { useId, useLayoutEffect, useRef } from "react";
import {
  gsap,
  pinPage,
  reduceMotion,
  riseOnScroll,
  whenReady,
} from "./storyUtils";

const Story3 = () => {
  const root = useRef(null);
  const circle = useRef(null);
  const uid = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const el = root.current;
    const c = circle.current;

    gsap.set(c, { rotation: -90, transformOrigin: "center center" });
    if (reduceMotion()) return;

    const ctx = gsap.context(() => {
      riseOnScroll(el, el.querySelectorAll(".story-rise"));
      gsap.from(c, {
        drawSVG: "0%",
        repeat: -1,
        yoyo: true,
        repeatDelay: 0,
        duration: 4,
        ease: "sine.inOut",
      });
    }, el);
    const cancelPin = whenReady(() => {
      ctx.add(() => pinPage(el));
    });

    return () => {
      cancelPin();
      ctx.revert();
    };
  }, []);

  return (
    <div className="story-beat tone-white" data-beat ref={root}>
      <p className="story-kicker story-rise">
        A little math. A lot of curiosity.
      </p>
      <h2 className="story-big story-rise">
        I studied Mathematics and Computer Science
      </h2>
      <p className="story-text story-rise story-indent">
        at The Multimedia University of Kenya
      </p>
      <p className="story-text story-rise story-aside">
        But I’ve always been interested in what happens when abstract{" "}
        <strong>ideas</strong> become something you can see, touch and interact
        with.
      </p>

      <svg
        className="story-art story-rise"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`grad-${uid}`}
            x1="0"
            y1="0"
            x2="66"
            y2="99"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.25" stopColor="#ff0000" />
            <stop offset="0.85" stopColor="#000000" />
          </linearGradient>
        </defs>
        <circle
          ref={circle}
          stroke={`url(#grad-${uid})`}
          strokeWidth="50"
          fill="none"
          cx="50"
          cy="50"
          r="25"
        />
      </svg>
    </div>
  );
};

export default Story3;
