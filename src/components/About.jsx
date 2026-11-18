import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* ───────────── edit me ───────────── */
const LINKS = {
  mmu: "https://www.mmu.ac.ke/",
  nbx: "http://localhost:5173/#", // ← swap for the live NBX URL
  ystudios: "https://ystudios.co.ke/",
};

const ext = (url) =>
  url.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};

const EQUATIONS = [
  {
    tag: "Mathematics",
    node: (
      <>
        e<sup>iπ</sup> + 1 = 0
      </>
    ),
  },
  {
    tag: "Motion",
    node: (
      <>
        x(t) = x<sub>0</sub> + v<sub>0</sub>t + ½at<sup>2</sup>
      </>
    ),
  },
  { tag: "Markets", node: <>∂V/∂t + ½σ²S² ∂²V/∂S² + rS ∂V/∂S − rV = 0</> },
  { tag: "Story", node: <>r = cos(5θ)</> },
];

/* rose curve r = cos(5θ), drawn on scroll */
const ROSE_D = Array.from({ length: 361 }, (_, i) => {
  const t = (i * Math.PI) / 360;
  const r = 42 * Math.cos(5 * t);
  return `${i ? "L" : "M"}${(50 + r * Math.cos(t)).toFixed(2)} ${(50 + r * Math.sin(t)).toFixed(2)}`;
}).join("");

/* ───────────── component ───────────── */
const Story = () => {
  const root = useRef(null);
  const b1 = useRef(null);
  const b2 = useRef(null);
  const b3 = useRef(null);
  const rose = useRef(null);
  const dot = useRef(null);

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
        const s3 = SplitText.create(b3.current.querySelectorAll(".story-eq"), {
          type: "chars",
          charsClass: "story-char",
        });

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

        /* the story: pinned, scrubbed */
        gsap.set([b2.current, b3.current], { autoAlpha: 0 });

        const path = rose.current;
        const total = path.getTotalLength();
        const tip = { p: 0 };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        /* beat 1 → beat 2 */
        tl.to(
          b1.current,
          { autoAlpha: 0, y: -60, duration: 1, ease: "power2.in" },
          1.2,
        )
          .set(b2.current, { autoAlpha: 1 }, 1.8)
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
            2,
          )
          /* words flash white, then settle back to their own color */
          .to(
            s2.words,
            { color: "#ffffff", scale: 0.94, duration: 0.2, stagger: 0.03 },
            4.6,
          )
          .to(
            s2.words,
            { color: (i) => finals[i], scale: 1, duration: 0.4, stagger: 0.03 },
            4.7,
          )

          /* beat 2 → beat 3 */
          .to(
            b2.current,
            { autoAlpha: 0, y: -60, duration: 1, ease: "power2.in" },
            7.4,
          )
          .set(b3.current, { autoAlpha: 1 }, 8);

        b3.current.querySelectorAll(".story-eq-row").forEach((row, i) => {
          const chars = s3.chars.filter((c) => row.contains(c));
          tl.from(
            row.querySelector(".about-tag"),
            { autoAlpha: 0, x: -20, duration: 0.5 },
            8.2 + i * 1.1,
          ).from(
            chars,
            {
              autoAlpha: 0,
              scale: 3,
              force3D: true,
              duration: 0.5,
              stagger: 0.02,
            },
            8.3 + i * 1.1,
          );
        });

        tl.from(path, { strokeDashoffset: 1, duration: 4 }, 8.4)
          .to(
            tip,
            {
              p: 1,
              duration: 4,
              onUpdate: () => {
                const pt = path.getPointAtLength(tip.p * total);
                dot.current.setAttribute("cx", pt.x);
                dot.current.setAttribute("cy", pt.y);
              },
            },
            8.4,
          )
          .from(".story-qed", { autoAlpha: 0, y: 20, duration: 0.6 }, 12.6)
          .to({}, { duration: 1 });

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

  return (
    <section id="story" ref={root}>
      <div className="story-grid" aria-hidden="true" />

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

        {/* 03 — proof */}
        <div className="story-beat story-beat--3" ref={b3}>
          <div className="story-eqs">
            <p className="about-tag">[ 03 / Proof ]</p>
            {EQUATIONS.map(({ tag, node }) => (
              <div key={tag} className="story-eq-row">
                <span className="about-tag">[ {tag} ]</span>
                <p className="story-eq">{node}</p>
              </div>
            ))}
            <p className="about-tag story-qed">[ Q.E.D. ] ∎</p>
          </div>

          <figure className="story-rose" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <g strokeWidth="0.3" opacity="0.35">
                <circle cx="50" cy="50" r="42" />
                <path d="M4 50h92M50 4v92" />
              </g>
              <path
                ref={rose}
                d={ROSE_D}
                pathLength="1"
                strokeDasharray="1"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <circle
                ref={dot}
                cx="92"
                cy="50"
                r="1.8"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            <figcaption className="about-tag">r = cos(5θ)</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Story;
