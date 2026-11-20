import { useId, useLayoutEffect, useRef } from "react";
import {
  gsap,
  pinPage,
  reduceMotion,
  riseOnScroll,
  whenReady,
} from "../stories/storyUtils";

const EYE = "M4 50Q50 2 96 50Q50 98 4 50Z";

const Eye = () => {
  const id = useId().replace(/:/g, "");

  return (
    <svg className="story-eye-svg" viewBox="0 20 100 60" aria-hidden="true">
      <defs>
        <clipPath id={`eye-clip-${id}`}>
          <path d={EYE} />
        </clipPath>
      </defs>
      <g className="story-eye">
        <path d={EYE} fill="#ffffff" />
        <g clipPath={`url(#eye-clip-${id})`}>
          <circle
            className="story-pupil"
            cx="50"
            cy="50"
            r="20.91"
            fill="#000000"
          />
        </g>
      </g>
    </svg>
  );
};

const EyeArt = () => {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (reduceMotion()) return;

    const ctx = gsap.context(() => {
      riseOnScroll(el, el.querySelectorAll(".story-eyes"));
    }, el);
    const cancelPin = whenReady(() => {
      ctx.add(() => pinPage(el));
    });

    const eyes = el.querySelectorAll(".story-eye");
    const onMove = (e) => {
      eyes.forEach((eye) => {
        const svg = eye.ownerSVGElement;
        const pupil = eye.querySelector(".story-pupil");
        const r = svg.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        const px = gsap.utils.clamp(
          -20,
          20,
          (x / (window.innerWidth / 2)) * 20,
        );
        const py = gsap.utils.clamp(
          -20,
          20,
          (y / (window.innerHeight / 2)) * 20,
        );

        gsap.to(pupil, {
          xPercent: px,
          yPercent: py,
          duration: 0.2,
          overwrite: "auto",
        });
        gsap.to(eye, {
          xPercent: px * 0.4,
          yPercent: py * 0.4,
          duration: 0.2,
          overwrite: "auto",
        });
      });
    };
    el.addEventListener("mousemove", onMove);

    return () => {
      cancelPin();
      el.removeEventListener("mousemove", onMove);
      ctx.revert();
    };
  }, []);

  return (
    <div className="story-eye-art" data-beat ref={root} aria-hidden="true">
      <div className="story-eyes story-rise">
        <Eye />
        <Eye />
      </div>
    </div>
  );
};

export default EyeArt;
