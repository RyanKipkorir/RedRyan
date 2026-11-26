import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  GITHUB,
  PROJECT_BAND_COUNT,
  PROJECT_FINALE_TITLE,
  PROJECT_LAB,
  PROJECTS,
  SECTION_IDS,
} from "../../constants/index.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ───────────── stack tuning ───────────── */
const MIN_TOP = 96; // a pinned card never sits closer to the top than this (clears the nav)
const TOP_BIAS = 0.6; // share of the spare viewport height placed above the card (room for the receding stack)
const MAX_DEPTH = 4; // cards further back than this all share the same "far away" look
const SCALE_STEP = 0.045; // each level behind the front card shrinks by this much
const BLUR_STEP = 1.4; // px of blur per level
const DIM_STEP = 0.1; // brightness lost per level
const FIN_OVERLAP = 100; // px of the stack still showing when the finale takes over

const pad = (n) => String(n).padStart(2, "0");
const isExternal = (u) => u.startsWith("http");
const hostOf = (u) => {
  try {
    return new URL(u).host;
  } catch {
    return "your-site.com";
  }
};

/* how a card looks when `depth` cards sit on top of it */
const look = (depth, peek) => {
  const d = Math.min(depth, MAX_DEPTH);
  return {
    scale: 1 - d * SCALE_STEP,
    y: -d * peek,
    filter: `blur(${(d * BLUR_STEP).toFixed(2)}px) brightness(${(1 - d * DIM_STEP).toFixed(2)})`,
  };
};

/* ───────────── lab icons ───────────── */
const Cube = () => (
  <svg
    className="proj-icon"
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="50,8 88,29 88,71 50,92 12,71 12,29" />
    <path d="M50 50v42M50 50L12 29M50 50l38-21" />
  </svg>
);

const Rose = () => {
  const d = Array.from({ length: 181 }, (_, i) => {
    const t = (i * Math.PI) / 180;
    const r = Math.cos(5 * t) * 42;
    return `${i ? "L" : "M"}${(50 + r * Math.cos(t)).toFixed(2)} ${(50 + r * Math.sin(t)).toFixed(2)}`;
  }).join("");

  return (
    <svg
      className="proj-icon proj-icon--spin"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
};

const Chain = () => (
  <svg
    className="proj-icon"
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="36" width="24" height="28" />
    <rect x="38" y="36" width="24" height="28" />
    <rect x="72" y="36" width="24" height="28" />
    <path d="M28 50h10M62 50h10" />
  </svg>
);

const LAB_ICONS = [<Cube key="c" />, <Rose key="r" />, <Chain key="h" />];

/* ───────────── component ───────────── */
const Projects = () => {
  const root = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const el = root.current;
      if (!el) return;

      const cards = gsap.utils.toArray(".proj-card", el);
      const inners = cards.map((c) => c.querySelector(".proj-card-inner"));
      const finale = el.querySelector("#tools");
      const bands = el.querySelector(".fin-bands");

      /* finale effect: the bands skew with scroll velocity and trail a streak of the next color */
      gsap.set(bands, { "--posv": 0 });
      const skewTo = gsap.quickTo(bands, "skewX", {
        duration: 0.5,
        ease: "power3",
      });
      const streakTo = gsap.quickTo(bands, "--posv", {
        duration: 0.5,
        ease: "power3",
      });

      const onVelocity = (self) => {
        const v = self.getVelocity() / 1400;
        skewTo(gsap.utils.clamp(-18, 18, v * 5));
        streakTo(gsap.utils.clamp(0, 1, Math.abs(v) / 1.7));
      };
      const settle = () => {
        skewTo(0);
        streakTo(0);
      };

      /* text reveal for the intro and the finale */
      const reveal = (selector, trigger, start = "top 80%") => {
        const targets = gsap.utils.toArray(selector, el);
        if (!targets.length) return;
        gsap.from(targets, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger,
            start,
            toggleActions: "play none none reverse",
          },
        });
      };

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          tall: "(min-height: 600px)",
          wide: "(min-width: 1024px)",
        },
        (ctx) => {
          const { motion, tall, wide } = ctx.conditions;
          if (!motion) return;

          reveal(".work-intro .proj-reveal", ".work-intro");
          reveal(".fin .proj-reveal", finale, "top 60%");

          /* ── stacked cards (CodePen pattern) ── */
          const tallest = () => Math.max(...cards.map((c) => c.offsetHeight));
          const stackTop = () =>
            Math.max(
              MIN_TOP,
              Math.round((window.innerHeight - tallest()) * TOP_BIAS),
            );
          const canStack =
            tall &&
            cards.length > 1 &&
            tallest() <= window.innerHeight - MIN_TOP - 24;

          if (canStack) {
            const peek = wide ? 22 : 14;
            gsap.set(inners, { transformOrigin: "50% 0%" });

            /* 1. every card pins at the same spot until the finale arrives */
            cards.forEach((card) => {
              ScrollTrigger.create({
                trigger: card,
                pin: true,
                pinSpacing: false,
                start: () => "top " + stackTop(),
                endTrigger: finale,
                end: () => "top " + (stackTop() + FIN_OVERLAP),
              });
            });

            /* 2. each card steps back one level while the next card slides over it */
            cards.forEach((_, i) => {
              for (let d = 1; d <= MAX_DEPTH && i + d < cards.length; d++) {
                gsap.fromTo(inners[i], look(d - 1, peek), {
                  ...look(d, peek),
                  ease: "none",
                  immediateRender: false,
                  scrollTrigger: {
                    trigger: cards[i + d],
                    start: () => "top " + (stackTop() + tallest()),
                    end: () => "top " + stackTop(),
                    scrub: true,
                  },
                });
              }
            });
          } else {
            /* card doesn't fit the viewport: normal scroll, simple reveal */
            cards.forEach((card, i) => {
              gsap.from(inners[i], {
                y: 40,
                opacity: 0,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
              });
            });
          }

          /* ── finale: bands slide across, words play when it's active ── */
          gsap.fromTo(
            bands,
            { xPercent: 0 },
            {
              xPercent: -50,
              ease: "none",
              scrollTrigger: {
                trigger: finale,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                onUpdate: onVelocity,
                onLeave: settle,
                onLeaveBack: settle,
                onScrubComplete: settle,
              },
            },
          );

          ScrollTrigger.create({
            trigger: finale,
            start: "top 60%",
            toggleClass: { targets: finale, className: "active" },
          });

          el.classList.add("fin-armed");
          return () => {
            el.classList.remove("fin-armed");
            settle();
          };
        },
      );

      let cancelled = false;
      document.fonts?.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });

      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { scope: root },
  );

  /* hover: scroll the screenshot inside the browser frame */
  const peek = contextSafe((e, on) => {
    const frame = e.currentTarget.querySelector(".proj-shot");
    const img = frame?.querySelector("img");
    if (!img || img.style.display === "none" || !img.naturalHeight) return;

    const dist = Math.max(0, img.offsetHeight - frame.offsetHeight);
    gsap.to(img, {
      y: on ? -dist : 0,
      duration: on ? Math.min(7, 1.5 + dist / 400) : 0.8,
      ease: on ? "power1.inOut" : "power3.out",
      overwrite: true,
    });
  });

  return (
    <section id={SECTION_IDS.projects} ref={root}>
      {/* intro */}
      <div className="work-intro">
        <h2 className="work-title">
          <span className="proj-reveal">Selected</span>
          <span className="work-title-outline proj-reveal">Work</span>
        </h2>
        <p className="work-sub proj-reveal">Things I’ve built</p>
        <p className="work-hint proj-reveal">Scroll ↓</p>
      </div>

      {/* stacked project cards */}
      <div className="work-stack">
        {PROJECTS.map((p, i) => (
          <article key={p.id} className="proj-card">
            <div className="proj-card-inner">
              <div className="proj-meta">
                <span>{pad(i + 1)}</span>
                <span>/ {pad(PROJECTS.length)}</span>
              </div>

              <div className="proj-card-body">
                <div className="proj-text">
                  <h3 className="proj-name">{p.name}</h3>
                  <p className="proj-blurb">{p.blurb}</p>
                  <ul className="proj-tags">
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <a
                    className="proj-visit"
                    href={p.url}
                    target={isExternal(p.url) ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    Visit <span aria-hidden="true">↗</span>
                  </a>
                </div>

                {p.lab ? (
                  <div className="proj-mock">
                    <div className="proj-frame">
                      <div className="proj-bar">
                        <span className="proj-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="proj-url">~/lab</span>
                      </div>
                      <div className="proj-lab">
                        {PROJECT_LAB.map((item, k) => (
                          <a
                            key={item.title}
                            className="proj-tile"
                            href={GITHUB}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {LAB_ICONS[k]}
                            <span>
                              <strong>{item.title}</strong>
                              <small>{item.text}</small>
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <a
                    className="proj-mock"
                    href={p.url}
                    target={isExternal(p.url) ? "_blank" : undefined}
                    rel="noreferrer"
                    tabIndex={-1}
                    aria-hidden="true"
                    onMouseEnter={(e) => peek(e, true)}
                    onMouseLeave={(e) => peek(e, false)}
                  >
                    <div className="proj-frame">
                      <div className="proj-bar">
                        <span className="proj-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="proj-url">{hostOf(p.url)}</span>
                      </div>
                      <div className="proj-shot">
                        <img
                          src={p.image}
                          alt=""
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Projects;
