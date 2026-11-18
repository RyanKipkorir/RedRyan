import { useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ShapeOverlay from "./ShapeOverlay";
import Stan from "./Stan";
import Counter from "./Counter";

gsap.registerPlugin(ScrollTrigger);

/* ───────────── edit me ───────────── */
// GitHub suspended the account on October 30th, 2026 at 18:00 East Africa Time (UTC+3)
const SUSPENDED_AT = new Date("2026-10-30T18:00:00+03:00");

// ← the year you started building games and websites
const STARTED_YEAR = 2021;

/* edit freely: this is the tools beat */
const TOOLS = [
  { group: "Languages", items: ["JavaScript", "TypeScript", "HTML & CSS"] },
  {
    group: "Frameworks",
    items: [
      "React",
      "React Native",
      "Expo",
      "Tailwind CSS",
      "NativeWind",
      "Vite",
      "GSAP",
    ],
  },
  { group: "Software", items: ["Git & GitHub", "Vercel", "Hedera"] },
];

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

const BARS = 100; // 100 bars x 1dvh = one full screen height

const Story = () => {
  const root = useRef(null);
  const wipe = useRef(null);
  const [showYears, setShowYears] = useState(false);

  const days = Math.max(
    0,
    Math.floor((Date.now() - SUSPENDED_AT.getTime()) / 86400000),
  );
  const years = Math.max(1, new Date().getFullYear() - STARTED_YEAR);
  const yearsSize =
    typeof window !== "undefined" && window.innerWidth < 640 ? 96 : 160;

  useLayoutEffect(() => {
    const el = root.current;
    const first = el.querySelector(".story-solo"); // the opening beat
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* every beat but the first: its lines rise in one after the other */
      el.querySelectorAll("[data-beat]").forEach((beat) => {
        if (beat === first) return;
        gsap.from(beat.querySelectorAll(".story-rise"), {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: beat, start: "top 65%", once: true },
        });
      });

      /* the opening beat: a liquid wipe turns it from dark to red, then its lines rise */
      ScrollTrigger.create({
        trigger: first,
        start: "top 60%",
        once: true,
        onEnter: () =>
          wipe.current.play(() => {
            first.classList.replace("tone-dark", "tone-red");
            gsap.from(first.querySelectorAll(".story-rise"), {
              y: 40,
              opacity: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.12,
              delay: 0.2,
            });
          }),
      });

      /* days since suspended counts up */
      const num = el.querySelector("[data-days]");
      const n = { v: 0 };
      num.textContent = "0";
      gsap.to(n, {
        v: days,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => (num.textContent = Math.round(n.v)),
        scrollTrigger: { trigger: num, start: "top 80%", once: true },
      });

      /* suspension -> tools: red bars sweep from the left half to the right half */
      const swap = el.querySelector(".story-swap");
      const bars = swap.querySelectorAll(".story-bar");

      gsap
        .timeline({
          scrollTrigger: {
            trigger: swap,
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
        .to(bars, { ease: "power1.in", duration: 1, rotation: 0 }, 1);

      /* years counter: mounts when its half arrives, so its intro is seen */
      ScrollTrigger.create({
        trigger: el.querySelector(".story-years"),
        start: "top 85%",
        once: true,
        onEnter: () => setShowYears(true),
      });

      /* vision: both eyes follow the cursor */
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

      return () => window.removeEventListener("mousemove", onMove);
    });

    /* the plus: sits on the centre line and turns 900deg from section 2 to the end
       (desktop only; the halves are stacked on mobile) */
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const beats = el.querySelectorAll("[data-beat]");
        const plusBox = el.querySelector(".story-plus");
        const plusSvg = el.querySelector(".story-plus-svg");

        gsap
          .timeline({
            scrollTrigger: {
              scrub: 1,
              trigger: beats[1],
              start: "top center",
              endTrigger: beats[beats.length - 1],
              end: "bottom 50%",
              onToggle: (self) =>
                gsap.to(plusBox, {
                  autoAlpha: self.isActive ? 1 : 0,
                  duration: 0.4,
                  overwrite: true,
                }),
            },
          })
          .to(plusSvg, { rotateZ: 900, ease: "none" });
      },
    );

    // reduced motion: the finished frame, no pinning
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(el.querySelectorAll(".story-bar"), { xPercent: 100 });
      first.classList.replace("tone-dark", "tone-red");
      setShowYears(true);
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
      first.classList.replace("tone-red", "tone-dark");
    };
  }, [days]);

  return (
    <section id="story" ref={root}>
      <ShapeOverlay ref={wipe} colors={["#000000", "#ff0000"]} />

      {/* the plus: fixed on the centre line while you move through the sections */}
      <div className="story-plus" aria-hidden="true">
        <svg className="story-plus-svg" viewBox="0 0 100 100">
          <path d="M38 4H62V38H96V62H62V96H38V62H4V38H38Z" />
        </svg>
      </div>

      {/* 1 · opening: one full screen, dark until the wipe turns it red */}
      <div className="story-solo tone-dark" data-beat>
        <p className="story-kicker story-rise">Hi, I'm Ryan</p>
        <h2 className="story-big story-rise">A Creative developer</h2>
        <p className="story-text story-rise">
          fascinated by , <strong>mathematics</strong> ,{" "}
          <strong> motion</strong> and <strong>visual storytelling</strong>.
        </p>
        <div className="story-eyes story-rise" aria-hidden="true">
          <EyeArt />
          <EyeArt />
        </div>
      </div>

      {/* 2 · white | dark */}
      <div className="story-split" data-beat>
        <div className="story-half tone-dark">
          <p className="story-kicker story-rise">
            A little math. A lot of curiosity.
          </p>
          <h2 className="story-big story-rise text-white">
            I studied Mathematics and Computer Science
          </h2>
          <p className="story-text story-rise ">
            at The Multimedia University of Kenya
          </p>
        </div>
        <div className="story-half tone-red">
          <p className="story-text story-rise">
            But I've always been interested in what happens when abstract{" "}
            <strong> ideas </strong>
            become something you can see, touch and interact with.
          </p>
        </div>
      </div>

      {/* 3 · red | white  (the suspension) */}
      <div className="story-split" data-beat>
        <div className="story-half tone-dark">
          <p className="story-kicker story-rise">SCHOOL</p>
          <h2 className="story-big story-rise">
            I studied Mathematics and Computer Science
          </h2>
          <p className="story-text story-rise">
            at The Multimedia University of Kenya
          </p>
        </div>
        <div className="story-half tone-red">
          <p className="story-kicker story-rise">
            <span className="story-live" />
            Days since suspended
          </p>
          <p className="story-counter-num story-rise" data-days>
            {days}
          </p>
        </div>
      </div>

      {/* transition: red bars sweep red|white into dark|red */}
      <div className="story-swap">
        <span className="story-swap-label is-left">Suspended.</span>
        <span className="story-swap-label is-right">Still building.</span>
        {Array.from({ length: BARS }, (_, i) => (
          <i key={i} className="story-bar" aria-hidden="true" />
        ))}
      </div>

      {/* 4 · dark | red  (the toolbox) */}
      <div className="story-split" data-beat>
        <div className="story-half tone-dark">
          <p className="story-kicker story-rise text-white">
            History has a sense of humour
          </p>

          <Stan className="story-rise" />
        </div>

        <div className="story-half tone-red">
          <div className="story-years story-rise">
            <p className="story-kicker">Years of experience</p>
            <div className="story-years-row">
              <div className="story-years-num" aria-label={`${years} years`}>
                {showYears && (
                  <Counter
                    value={years}
                    fontSize={yearsSize}
                    fontWeight={600}
                    direction="auto"
                    duration={0.7}
                    bounce={0.2}
                    stagger={0.04}
                    fade={0.3}
                    gap={0}
                    decimals={0}
                    minDigits={2}
                    motionBlur
                    intro
                    tabular
                  />
                )}
              </div>
              <p className="story-years-label">
                building games
                <br />
                and websites
              </p>
            </div>
          </div>

          <div className="story-tools">
            {TOOLS.map(({ group, items }) => (
              <div key={group} className="story-tools-group story-rise">
                <h3>{group}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
