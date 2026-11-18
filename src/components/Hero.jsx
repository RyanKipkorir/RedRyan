import { useRef } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
import MetaBalls from "@/components/MetaBalls";

gsap.registerPlugin(ScrollToPlugin, ScrambleTextPlugin, useGSAP);

/* ───────────── edit me ───────────── */
const PROFILE = {
  handle: "@RedRedRyan",
  github: "https://github.com/RyanKipkorir",
  email: "ryan@ystudios.co.ke",
  location: "Nairobi, KE",
  year: new Date().getFullYear(),
};

const STATEMENT = "Defining is limiting, but here is what I do";

const SERVICES = [
  { n: "01", label: "UI/UX" },
  { n: "02", label: "Game Dev" },
  { n: "03", label: "Breathe AIR, Write Scripts" },
];

const ACTIONS = [
  { label: "My work", href: "#work", tone: "red" },
  { label: "Who is Red?", href: "#about", tone: "white" },
];

const RED = ["R", "E", "D"];
const RYAN = ["R", "Y", "A", "N"];

const SCRAMBLE_CHARS = "01<>/\\{}[]=+*#%&?ΣπΔ∫";

/* ───────────── little SVG pieces ───────────── */
const Burst = ({ className = "", style }) => {
  const spikes = 12;
  const points = Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 24;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <polygon points={points} fill="currentColor" />
    </svg>
  );
};

const Blob = ({ className = "", style }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 100 100"
    aria-hidden="true"
  >
    <path
      d="M52 6c22 0 42 17 42 42 0 28-20 46-46 46C22 94 6 76 6 52 6 26 28 6 52 6z"
      fill="currentColor"
    />
    <path
      d="M38 38l24 24M62 38L38 62"
      stroke="#000"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

/* wireframe sphere — meridians are re-drawn every frame so it spins in "3D" */
const Sphere = () => (
  <svg
    className="hero-sphere"
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <circle cx="50" cy="50" r="40" />
    <ellipse cx="50" cy="50" rx="40" ry="11" />
    <ellipse cx="50" cy="28" rx="33" ry="8" />
    <ellipse cx="50" cy="72" rx="33" ry="8" />
    <ellipse className="hero-meridian" cx="50" cy="50" rx="40" ry="40" />
    <ellipse className="hero-meridian" cx="50" cy="50" rx="34" ry="40" />
    <ellipse className="hero-meridian" cx="50" cy="50" rx="20" ry="40" />
  </svg>
);

const Word = ({ letters = {} }) => (
  <div className="hero-word" aria-hidden="true">
    {letters.map((ch, i) => (
      <span key={i} className="hero-letter">
        {ch}
      </span>
    ))}
  </div>
);

/* ───────────── component ───────────── */
const Hero = () => {
  const root = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = (sel) => root.current.querySelectorAll(sel);

        gsap.set(".hero-reveal", { autoAlpha: 0 });

        /* 1 ── letters spell out + scramble text + buttons + balls fade in */
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(
          ".hero-balls",
          { opacity: 0, duration: 2.4, ease: "power2.out" },
          0,
        )
          .from(
            ".hero-letter",
            {
              opacity: 0,
              scale: 0,
              xPercent: -60,
              rotation: () => gsap.utils.random(-30, 30),
              duration: 1.6,
              ease: "back.out(2)",
              stagger: 0.2,
            },
            0.2,
          )
          .from(
            ".hero-glyph",
            { scale: 0, duration: 1.2, ease: "back.out(3)", stagger: 0.2 },
            1.4,
          )
          .from(
            ".hero-btn",
            {
              y: 40,
              opacity: 0,
              duration: 1,
              stagger: 0.12,
              clearProps: "transform,opacity",
            },
            2.6,
          )
          .to(
            ".hero-meta, .hero-vertical, .hero-scroll",
            { autoAlpha: 1, duration: 1, stagger: 0.15 },
            1.2,
          )
          .to(".hero-statement", { autoAlpha: 1, duration: 0.01 }, 1.2)
          .to(
            ".hero-statement-text",
            {
              duration: 2.6,
              ease: "none",
              scrambleText: {
                text: STATEMENT,
                chars: SCRAMBLE_CHARS,
                revealDelay: 0.4,
                speed: 0.5,
              },
            },
            1.2,
          );

        SERVICES.forEach(({ label }, i) => {
          const at = 1.8 + i * 0.4;
          tl.to(
            `.hero-list li:nth-child(${i + 1})`,
            { autoAlpha: 1, duration: 0.01 },
            at,
          ).to(
            `.hero-list li:nth-child(${i + 1}) .hero-list-text`,
            {
              duration: 1.6,
              ease: "none",
              scrambleText: {
                text: label,
                chars: SCRAMBLE_CHARS,
                revealDelay: 0.2,
                speed: 0.6,
              },
            },
            at,
          );
        });

        /* 2 ── ambient: spinning glyph + sphere */
        gsap.to(".hero-spin", {
          rotation: 360,
          duration: 14,
          repeat: -1,
          ease: "none",
        });

        const meridians = q(".hero-meridian");
        const orbit = { a: 0 };
        gsap.to(orbit, {
          a: Math.PI,
          duration: 9,
          repeat: -1,
          ease: "none",
          onUpdate: () =>
            meridians.forEach((el, i) =>
              el.setAttribute(
                "rx",
                (Math.abs(Math.cos(orbit.a + (i * Math.PI) / 3)) * 40).toFixed(
                  2,
                ),
              ),
            ),
        });
      });
    },
    { scope: root },
  );

  const goTo = contextSafe((e, id) => {
    e.preventDefault();
    gsap.to(window, {
      duration: 2,
      scrollTo: { y: id },
      ease: "power2.inOut",
    });
  });

  const lineIn = contextSafe(() =>
    gsap.to(".hero-scroll-line", { y: 26, duration: 0.6, ease: "power4" }),
  );
  const lineOut = contextSafe(() =>
    gsap.to(".hero-scroll-line", { y: 0, duration: 0.6, ease: "power4" }),
  );

  const rescramble = contextSafe((e, label) => {
    const el = e.currentTarget.querySelector(".hero-list-text");
    gsap.to(el, {
      duration: 0.9,
      overwrite: true,
      scrambleText: { text: label, chars: SCRAMBLE_CHARS, speed: 0.8 },
    });
  });

  return (
    <section id="hero" ref={root}>
      {/* right side — MetaBalls */}
      <div className="hero-balls" aria-hidden="true">
        <MetaBalls
          color="#ff0000"
          cursorBallColor="#ff0000"
          cursorBallSize={2}
          ballCount={18}
          animationSize={30}
          enableMouseInteraction={true}
          enableTransparency={true}
          hoverSmoothness={0.05}
          clumpFactor={1}
          speed={0.3}
        />
      </div>

      <div className="hero-inner">
        <h1 className="sr-only">Red Ryan — UI/UX, game dev and scripts</h1>

        <div className="hero-main">
          <div className="hero-rows">
            <div className="hero-row hero-row--red">
              <Word letters={RED} />
            </div>

            <div className="hero-row hero-row--ryan">
              <Word letters={RYAN} />
            </div>
            <p className="hero-aside hero-statement hero-reveal">
              <span className="hero-statement-text">
                Defining is limiting, but here is what I do
              </span>
            </p>
          </div>

          {/* two equal-width buttons */}
          <div className="hero-cta">
            {ACTIONS.map(({ label, href, tone }) => (
              <a
                key={href}
                href={href}
                className={`hero-btn hero-btn--${tone}`}
                onClick={(e) => goTo(e, href)}
              >
                <span>{label}</span>
                <span aria-hidden="true">↘</span>
              </a>
            ))}
          </div>
        </div>

        {/* bottom right */}
        <div className="hero-meta hero-reveal">
          <div className="hero-meta-group">
            <span className="hero-small">{PROFILE.location}</span>
            <Sphere />
          </div>
        </div>
      </div>

      <div className="noisy hero-noise" />
    </section>
  );
};

export default Hero;
