import { useId, useLayoutEffect, useRef } from "react";
import {
  gsap,
  ScrollTrigger,
  pinPage,
  reduceMotion,
  whenReady,
} from "./storyUtils";

/* an eye: white almond, black pupil clipped to it */
const EYE = "M4 50Q50 2 96 50Q50 98 4 50Z";

const EyeArt = () => {
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

const Story1 = ({ wipe }) => {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;

    if (reduceMotion()) {
      el.classList.replace("tone-dark", "tone-red");
      return () => el.classList.replace("tone-red", "tone-dark");
    }

    const ctx = gsap.context(() => {
      /* a liquid wipe turns this beat from dark to red, then its lines rise */
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        once: true,
        onEnter: () =>
          wipe.current?.play(() => {
            el.classList.replace("tone-dark", "tone-red");
            gsap.from(el.querySelectorAll(".story-rise"), {
              y: 40,
              opacity: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.12,
              delay: 0.2,
            });
          }),
      });
    }, el);
    const cancelPin = whenReady(() => {
      ctx.add(() => pinPage(el));
    });

    /* both eyes follow the cursor */
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
    window.addEventListener("mousemove", onMove);

    return () => {
      cancelPin();
      window.removeEventListener("mousemove", onMove);
      ctx.revert();
      el.classList.replace("tone-red", "tone-dark");
    };
  }, [wipe]);

  return (
    <div className="story-solo tone-dark" data-beat ref={root}>
      <p className="story-kicker story-rise">I know why you’re asking.</p>
      <div className="story-eyes story-rise" aria-hidden="true">
        <EyeArt />
        <EyeArt />
      </div>
      <figure className="story-quote story-rise">
        <blockquote>
          “The important thing is not to stop questioning. Curiosity has its own
          reason for existence.”
        </blockquote>
        <figcaption className="text-white">— Albert Einstein</figcaption>
      </figure>
    </div>
  );
};

export default Story1;
