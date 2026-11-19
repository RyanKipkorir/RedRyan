import { useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ShapeOverlay from "./ShapeOverlay";
import Stan from "./Stan";
import Counter from "./Counter";
import {
  STORY_BAR_COUNT,
  STORY_FLOW,
  STORY_STARTED_YEAR,
  STORY_TOOLS,
  SECTION_IDS,
} from "../../constants/index.js";

gsap.registerPlugin(ScrollTrigger);

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

const Story = () => {
  const root = useRef(null);
  const wipe = useRef(null);
  const [showYears, setShowYears] = useState(false);

  const years = Math.max(1, new Date().getFullYear() - STORY_STARTED_YEAR);
  const yearsSize =
    typeof window !== "undefined" && window.innerWidth < 640 ? 96 : 160;

  useLayoutEffect(() => {
    const el = root.current;
    const first = el.querySelector(".story-solo"); // the opening beat: the eyes
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* pins first, in page order, so everything created after them counts their spacing */

      /* the flow: the list scrolls past a pinned stage and each line lights up near the centre */
      const stage = el.querySelector(".story-flow-stage");
      const list = stage.querySelector(".story-flow-list");
      const rows = gsap.utils.toArray("li", list);
      const travel = () => Math.max(0, list.scrollHeight - stage.offsetHeight);

      const light = () => {
        const box = stage.getBoundingClientRect();
        const mid = box.top + box.height / 2;
        rows.forEach((li) => {
          const r = li.getBoundingClientRect();
          const d = Math.min(
            1,
            Math.abs(r.top + r.height / 2 - mid) / (box.height * 0.34),
          );
          gsap.set(li, { opacity: 0.2 + 0.8 * (1 - d), x: (1 - d) * 28 });
        });
      };

      gsap.fromTo(
        list,
        { y: 0 },
        {
          y: () => -travel(),
          ease: "none",
          onUpdate: light,
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => "+=" + travel(),
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: light,
          },
        },
      );
      light();

      /* suspension: red bars sweep across, the red screen gives way to dark */
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

      /* years counter: mounts when its block arrives, so its intro is seen */
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

    /* the plus: sits at the right edge and turns 900deg from the intro to the end
       (desktop only) */
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
  }, []);

  return (
    <section id={SECTION_IDS.about} ref={root}>
      <ShapeOverlay ref={wipe} colors={["#000000", "#ff0000"]} />

      {/* the plus: fixed at the right edge while you move through the sections */}
      <div className="story-plus" aria-hidden="true">
        <svg className="story-plus-svg" viewBox="0 0 100 100">
          <path d="M38 4H62V38H96V62H62V96H38V62H4V38H38Z" />
        </svg>
      </div>

      {/* 1 · the eyes: dark until the wipe turns it red */}
      <div className="story-solo tone-dark" data-beat>
        <p className="story-kicker story-rise">I know why you’re asking.</p>
        <div className="story-eyes story-rise" aria-hidden="true">
          <EyeArt />
          <EyeArt />
        </div>
        <figure className="story-quote story-rise">
          <blockquote>
            “The important thing is not to stop questioning. Curiosity has its
            own reason for existence.”
          </blockquote>
          <figcaption>— Albert Einstein</figcaption>
        </figure>
      </div>

      {/* 2 · who */}
      <div className="story-beat tone-dark" data-beat>
        <p className="story-kicker story-rise">Hi, I’m Ryan</p>
        <h2 className="story-big story-rise">A Creative developer</h2>
        <p className="story-text story-rise story-aside">
          fascinated by <strong>mathematics</strong>, <strong>motion</strong>{" "}
          and <strong>visual storytelling</strong>.
        </p>
      </div>

      {/* 3 · school */}
      <div className="story-beat tone-white" data-beat>
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
          <strong>ideas</strong> become something you can see, touch and
          interact with.
        </p>
      </div>

      {/* 4 · the flow: a pinned stage, the list scrolls past and each line lights up */}
      <div className="story-flow tone-red" data-beat>
        <div className="story-flow-stage">
          <p className="story-kicker story-flow-kicker story-rise">
            Daily involvements
          </p>
          <h2 className="story-flow-head">I</h2>
          <ul className="story-flow-list">
            {STORY_FLOW.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* transition: red bars sweep across, red gives way to dark */}
      <div className="story-swap">
        <span className="story-swap-label is-a">However I was.</span>
        <span className="story-swap-label is-b">Suspended from GitHub.</span>
        {Array.from({ length: STORY_BAR_COUNT }, (_, i) => (
          <i key={i} className="story-bar" aria-hidden="true" />
        ))}
      </div>

      {/* 5 · Stańczyk */}
      <div className="story-beat story-beat--stan tone-dark" data-beat>
        <h2 className="story-big story-rise">History has a sense of humour</h2>
        <Stan className="story-rise" />
      </div>

      {/* 6 · the toolbox */}
      <div className="story-beat story-beat--tools tone-white" data-beat>
        <div className="story-tools-lead">
          <p className="story-kicker story-rise">The toolbox</p>
          <h2 className="story-big story-rise">What I build with.</h2>
          <p className="story-text story-rise">
            Languages, frameworks and the software I use every day.
          </p>

          <div className="story-years story-rise">
            <p className="story-kicker">I have been building for about</p>
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
                years of
                <br />
                games and websites
              </p>
            </div>
          </div>
        </div>

        <div className="story-tools">
          {STORY_TOOLS.map(({ group, items }) => (
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
    </section>
  );
};

export default Story;
