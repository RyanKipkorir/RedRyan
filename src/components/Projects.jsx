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
import Skills from "./Skills";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pad = (n) => String(n).padStart(2, "0");
const isExternal = (u) => u.startsWith("http");
const hostOf = (u) => {
  try {
    return new URL(u).host;
  } catch {
    return "your-site.com";
  }
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
  const pin = useRef(null);
  const track = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const el = root.current;
      const finale = el.querySelector(".fin");
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

      /* desktop: pinned horizontal scroll (CodePen pattern) */
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const distance = () =>
            Math.max(0, track.current.scrollWidth - window.innerWidth);

          const slide = gsap.to(track.current, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: () => "+=" + distance(),
              pin: pin.current,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(".work-progress-bar", { scaleX: self.progress });
                onVelocity(self);
              },
              onScrubComplete: settle,
            },
          });

          el.querySelectorAll(".work-panel").forEach((panel) => {
            const intro = panel.classList.contains("work-panel--intro");
            const mock = panel.querySelector(".proj-mock");

            /* text reveals as each panel slides in */
            gsap.from(panel.querySelectorAll(".proj-reveal"), {
              y: 60,
              opacity: 0,
              duration: 1.1,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: intro
                ? {
                    trigger: el,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                  }
                : {
                    trigger: panel,
                    containerAnimation: slide,
                    start: "left 80%",
                    toggleActions: "play none none reverse",
                  },
            });

            /* mockup drifts against the scroll (parallax) */
            if (mock) {
              gsap.fromTo(
                mock,
                { xPercent: 8 },
                {
                  xPercent: -8,
                  ease: "none",
                  scrollTrigger: {
                    trigger: panel,
                    containerAnimation: slide,
                    start: "left right",
                    end: "right left",
                    scrub: true,
                  },
                },
              );
            }
          });

          /* the finale: bands slide in as the last panel arrives, words and skills play when it's active */
          gsap.fromTo(
            bands,
            { xPercent: 0 },
            {
              xPercent: -50,
              ease: "none",
              scrollTrigger: {
                trigger: finale,
                containerAnimation: slide,
                start: "left right",
                end: "left left",
                scrub: true,
              },
            },
          );

          ScrollTrigger.create({
            trigger: finale,
            containerAnimation: slide,
            start: "left 60%",
            toggleClass: { targets: finale, className: "active" },
          });

          el.classList.add("fin-armed");
          return () => {
            el.classList.remove("fin-armed");
            settle();
          };
        },
      );

      /* mobile: normal scroll, simple reveals */
      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          el.querySelectorAll(".work-panel").forEach((panel) => {
            gsap.from(panel.querySelectorAll(".proj-reveal"), {
              y: 40,
              opacity: 0,
              duration: 1,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: { trigger: panel, start: "top 80%" },
            });
          });

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
                scrub: true,
                onUpdate: onVelocity,
                onLeave: settle,
                onLeaveBack: settle,
              },
            },
          );

          ScrollTrigger.create({
            trigger: finale,
            start: "top 70%",
            toggleClass: { targets: finale, className: "active" },
          });

          el.classList.add("fin-armed");
          return () => {
            el.classList.remove("fin-armed");
            settle();
          };
        },
      );

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
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
      <div className="work-pin" ref={pin}>
        <div className="work-track" ref={track}>
          {/* intro panel */}
          <div className="work-panel work-panel--intro">
            <h2 className="work-title">
              <span className="proj-reveal">Selected</span>
              <span className="work-title-outline proj-reveal">Work</span>
            </h2>
            <p className="work-sub proj-reveal">Things I’ve built</p>
            <p className="work-hint proj-reveal">Scroll →</p>
          </div>

          {/* project panels */}
          {PROJECTS.map((p, i) => (
            <article key={p.id} className="work-panel">
              <div className="proj-text">
                <p className="proj-meta proj-reveal">
                  <h3 className="proj-name proj-reveal">{p.name}</h3>
                </p>
                <span>{pad(i + 1)}</span>
                <p className="proj-blurb proj-reveal">{p.blurb}</p>
                <ul className="proj-tags proj-reveal">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <a
                  className="proj-visit proj-reveal"
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
            </article>
          ))}

          {/* finale: sliding color bands + outlined words, with the skills ring */}
          <div className="work-panel work-panel--outro fin">
            <div className="fin-bands" aria-hidden="true">
              {Array.from({ length: PROJECT_BAND_COUNT }, (_, i) => (
                <i key={i} className="fin-band" style={{ "--i": i }} />
              ))}
            </div>

            <div className="fin-copy">
              <h2
                className="fin-title"
                aria-label={PROJECT_FINALE_TITLE.join(" ")}
              >
                {PROJECT_FINALE_TITLE.map((w, i) => (
                  <span
                    key={i}
                    className="fin-word"
                    data-word={w}
                    style={{ "--i": i }}
                    aria-hidden="true"
                  >
                    {w}
                  </span>
                ))}
              </h2>
              <p className="work-sub proj-reveal">Tools I reach for</p>
              <a
                className="proj-visit proj-reveal"
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
              >
                More on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>

            <Skills className="proj-reveal" />
          </div>
        </div>

        <div className="work-progress" aria-hidden="true">
          <span className="work-progress-bar" />
        </div>
      </div>
    </section>
  );
};

export default Projects;
