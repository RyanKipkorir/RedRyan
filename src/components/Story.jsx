import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Counter from "./Counter";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* ───────────── edit me ───────────── */
const LINKS = {
  mmu: "https://www.mmu.ac.ke/",
  nbx: "http://localhost:5173/#", // ← swap for the live NBX URL
  ystudios: "https://ystudios.co.ke/",
  github: "https://github.com/RyanKipkorir",
};

// October 30th, 2026 at 18:00 East Africa Time (UTC+3)
const SUSPENDED_AT = new Date("2026-10-30T18:00:00+03:00");
const SUSPENDED_LABEL = "Oct 30, 2026 · 18:00 EAT";
const COUNTER_AT = 12; // timeline time when the counter appears

const daysSince = () =>
  Math.max(0, Math.floor((Date.now() - SUSPENDED_AT.getTime()) / 86400000));

const ext = (url) =>
  url.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};

/* ───────────── component ───────────── */
const Story = () => {
  const root = useRef(null);
  const b1 = useRef(null);
  const b2 = useRef(null);
  const b3 = useRef(null);

  // days since the suspension — re-checked every minute, so it rolls over live at 18:00 EAT
  const [days, setDays] = useState(daysSince);
  useEffect(() => {
    const id = setInterval(() => setDays(daysSince()), 60000);
    return () => clearInterval(id);
  }, []);

  // the counter mounts when its beat arrives, so its intro animation is actually seen
  const [showCount, setShowCount] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const opts = {
          type: "words,chars",
          wordsClass: "story-word",
          charsClass: "story-char",
        };

        const s1 = SplitText.create(
          b1.current.querySelector(".story-big"),
          opts,
        );
        const s2 = SplitText.create(
          b2.current.querySelectorAll(".story-text"),
          { ...opts, aria: "none" },
        );
        const s3 = SplitText.create(
          b3.current.querySelectorAll(".story-line"),
          { ...opts, aria: "none" },
        );

        // each word's resting color (links, <strong>, <em> keep their own)
        const finals = s2.words.map((el) => getComputedStyle(el).color);

        /* beat 1 — scroll reveal: chars rise as the section arrives */
        gsap.from(s1.chars, {
          scrollTrigger: {
            trigger: root.current,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
          duration: 0.6,
          ease: "circ.out",
          y: 80,
          autoAlpha: 0,
          stagger: 0.02,
        });

        /* the story: pinned and scrubbed, with long holds so there's time to read */
        gsap.set([b2.current, b3.current], { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=800%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) =>
              setShowCount(self.animation.time() >= COUNTER_AT),
          },
        });

        /* beat 1 → beat 2 */
        tl.to(
          b1.current,
          { autoAlpha: 0, y: -60, duration: 1, ease: "power2.in" },
          2.5,
        )
          .set(b2.current, { autoAlpha: 1 }, 3.2)
          .from(
            s2.chars,
            {
              autoAlpha: 0,
              scale: 3,
              force3D: true,
              duration: 0.6,
              ease: "back.out(1.4)",
              stagger: 0.008,
            },
            3.4,
          )
          /* words flash white, then settle back to their own color */
          .to(
            s2.words,
            { color: "#ffffff", scale: 0.94, duration: 0.2, stagger: 0.03 },
            6.2,
          )
          .to(
            s2.words,
            { color: (i) => finals[i], scale: 1, duration: 0.4, stagger: 0.03 },
            6.3,
          )

          /* beat 2 → beat 3 */
          .to(
            b2.current,
            { autoAlpha: 0, y: -60, duration: 1, ease: "power2.in" },
            10,
          )
          .set(b3.current, { autoAlpha: 1 }, 11.4)
          .from(
            ".story-counter-tag",
            { autoAlpha: 0, y: 20, duration: 0.5, stagger: 0.15 },
            12.2,
          );

        /* beat 3 — the story, one paragraph at a time */
        const starts = [11.8, 14.6, 18.2];
        b3.current.querySelectorAll(".story-line").forEach((p, i) => {
          const chars = s3.chars.filter((c) => p.contains(c));
          tl.from(
            chars,
            {
              autoAlpha: 0,
              scale: 3,
              force3D: true,
              duration: 0.5,
              stagger: 0.02,
            },
            starts[i],
          );
        });

        tl.to({}, { duration: 2.5 }); // hold on the last beat

        return () => {
          s1.revert();
          s2.revert();
          s3.revert();
        };
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root },
  );

  const counterSize =
    typeof window !== "undefined" && window.innerWidth < 640 ? 88 : 160;

  return (
    <section id="story" ref={root}>
      <div className="story-stage">
        {/* 01 — intro */}
        <div className="story-beat story-beat--1" ref={b1}>
          <p className="about-tag">[ 01 / Intro ]</p>
          <h2 className="story-big">
            I’m a creative developer, fascinated by the intersection of{" "}
            <em>mathematics</em>, <em>motion</em> and{" "}
            <em>visual storytelling</em>.
          </h2>
        </div>

        {/* 02 — background */}
        <div className="story-beat story-beat--2" ref={b2}>
          <p className="about-tag">[ 02 / Background ]</p>
          <p className="story-text">
            I studied pure <strong>mathematics</strong> and computer science at{" "}
            <a href={LINKS.mmu} {...ext(LINKS.mmu)}>
              Multimedia University of Kenya
            </a>{" "}
            🎓, and I still build every interface like a proof:{" "}
            <em>structure first</em>, then make it feel{" "}
            <strong>inevitable</strong> ✨.
          </p>
          <p className="story-text">
            I make trading platforms 📈, dashboards 📊 and games 🎮, and
            co-found{" "}
            <a href={LINKS.nbx} {...ext(LINKS.nbx)}>
              NBX
            </a>{" "}
            🔗 and{" "}
            <a href={LINKS.ystudios} {...ext(LINKS.ystudios)}>
              YStudios
            </a>{" "}
            🎬.
          </p>
        </div>

        {/* 03 — the setback */}
        <div className="story-beat story-beat--3" ref={b3}>
          <div className="story-tale">
            <p className="about-tag">[ 03 / Oct 30, 2026 ]</p>
            <p className="story-line">
              On <strong>October 30th, 2026</strong>, at{" "}
              <strong>18:00 East Africa Time</strong>, GitHub suspended my
              account 🚫.
            </p>
            <p className="story-line">
              I was trying to release an <strong>APK</strong> 📱: a{" "}
              <em>local AI</em> that runs on your phone, with a{" "}
              <em>self-custodial wallet</em> 🔐.
            </p>
            <p className="story-line">
              So I started again at{" "}
              <a href={LINKS.github} {...ext(LINKS.github)}>
                github.com/RyanKipkorir
              </a>{" "}
              🌱, still building.
            </p>
          </div>

          {/* days since the suspension */}
          <div
            className="story-counter"
            role="timer"
            aria-label={`${days} days since the GitHub suspension`}
          >
            <p className="story-counter-tag about-tag">
              <span className="story-live" aria-hidden="true" /> [ Days since
              suspended ]
            </p>

            <div className="story-counter-num">
              {showCount && (
                <Counter
                  value={days}
                  fontSize={counterSize}
                  fontWeight={600}
                  direction="auto"
                  duration={0.7}
                  bounce={0.2}
                  stagger={0.04}
                  fade={0.3}
                  gap={0}
                  decimals={0}
                  minDigits={3}
                  motionBlur
                  intro
                  tabular
                />
              )}
            </div>

            <p className="story-counter-tag about-tag">
              since {SUSPENDED_LABEL}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
