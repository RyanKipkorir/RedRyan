import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TOOLS = [
  {
    id: "unity",
    name: "Unity",
    mono: "U",
    src: "/images/skills/unity.png",
    title: "Where the worlds get built.",
    text: "Scenes, physics and gameplay loops. Unity is where my games live, and where I wire real wallets into them with the Thirdweb SDK.",
  },
  {
    id: "csharp",
    name: "C#",
    mono: "C#",
    src: "/images/skills/csharp.png",
    title: "The language under every game.",
    text: "Movement, state machines, save data and wallet calls in my Unity projects are all C#. Typed, fast and predictable.",
  },
  {
    id: "js",
    name: "JavaScript",
    mono: "JS",
    src: "/images/skills/js.png",
    title: "The web’s native tongue.",
    text: "Scroll logic, canvas and SVG work, and the glue between APIs, wallets and the browser. If it runs on a page, it starts here.",
  },
  {
    id: "react",
    name: "React",
    mono: "Re",
    src: "/images/skills/react.png",
    title: "Interfaces as small, honest parts.",
    text: "Trading screens, dashboards and landing pages are built from components. Quick to iterate on, easy to hand over.",
  },
  {
    id: "nextjs",
    name: "Next.js",
    mono: "N",
    src: "/images/skills/nextjs.png",
    title: "From prototype to production.",
    text: "The App Router, server rendering and API routes carry my standalone apps and the analytics dashboard I keep on Vercel.",
  },
  {
    id: "gsap",
    name: "GSAP",
    mono: "Gs",
    src: "/images/skills/gsap.png",
    title: "Motion on a timeline.",
    text: "ScrollTrigger, Flip, Draggable and SVG drawing drive almost every animation on this site. If it moves, it’s scripted.",
  },
  {
    id: "figma",
    name: "Figma",
    mono: "Fi",
    src: "/images/skills/figma.png",
    title: "Draw it before you build it.",
    text: "Layouts, type and motion ideas start as frames. I design the screen first so the code has nothing left to guess.",
  },
  {
    id: "r",
    name: "R",
    mono: "R",
    src: "/images/skills/r.png",
    title: "Where numbers show their shape.",
    text: "Statistics, simulation and plots from my pure mathematics side. I like to see the data before I trust it.",
  },
];

const ACCOLADE = {
  src: "/images/accolade.jpg",
  alt: "The Accolade by Edmund Blair Leighton: a knight being dubbed",
};

const STEP = 24;
const INTRO = 3;
const HOLD = 1.4;
const MOVE = 0.6;
const OUTRO = 1;
const VH_PER_UNIT = 0.42;
const T0 = 0.4;

const N = TOOLS.length;

const ToolsDial = () => {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = root.current;
        const stage = el.querySelector(".dial-stage");
        const wheel = el.querySelector(".dial-wheel");
        const accolade = el.querySelector(".dial-accolade");
        const ring = el.querySelector(".dial-ring");
        const ticks = el.querySelector(".dial-ticks");
        const items = gsap.utils.toArray(".dial-item", el);
        const slides = gsap.utils.toArray(".dial-slide", el);
        const steps = gsap.utils.toArray(".dial-step", el);
        const rig = gsap.utils.toArray(
          ".dial-line, .dial-pin, .dial-needle",
          el,
        );
        const center = el.querySelector(".dial-center");
        const hint = el.querySelector(".dial-hint");
        const dock = el.querySelector(".dial-dock");
        const nextName = el.querySelector(".dial-next-name");

        const narrow = () => window.matchMedia("(max-width: 1023px)").matches;
        const dockedR = () => stage.clientHeight * (narrow() ? 0.28 : 0.69);
        const middleR = () =>
          Math.min(stage.clientWidth * 0.3, stage.clientHeight * 0.34);

        const block = HOLD + MOVE;
        const DOCK = T0 + INTRO;
        const holdAt = (k) => DOCK + k * block;

        let active = -2;
        const sync = () => {
          const x = (tl.time() - DOCK) / block;
          const idx =
            x < -0.2 ? -1 : Math.min(N - 1, Math.max(0, Math.floor(x + 0.15)));
          if (idx === active) return;
          active = idx;

          items.forEach((it, i) => it.classList.toggle("is-active", i === idx));
          steps.forEach((s, i) => {
            s.classList.toggle("is-current", i === idx);
            s.classList.toggle("is-past", i < idx);
          });
          if (nextName) {
            nextName.textContent =
              idx < 0
                ? TOOLS[0].name
                : idx < N - 1
                  ? TOOLS[idx + 1].name
                  : "Napoleon Crossing the Alps";
          }
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: sync,
        });

        /* 1 · ring travels from middle of screen and docks on the left */
        tl.fromTo(
          wheel,
          {
            x: () => stage.clientWidth / 2 - wheel.offsetLeft,
            y: () => stage.clientHeight / 2 - wheel.offsetTop,
            "--r": () => middleR() + "px",
            "--k": 0,
          },
          {
            x: 0,
            y: 0,
            "--r": () => dockedR() + "px",
            "--k": 1,
            duration: INTRO,
            ease: "power3.inOut",
          },
          T0,
        );
        tl.fromTo(
          ring,
          { rotation: -90 },
          { rotation: 0, duration: INTRO, ease: "power3.inOut" },
          T0,
        );

        /* Accolade sits in the middle of the dial on mobile (and left of the dial on desktop),
           then disappears cleanly as the tools dial moves left */
        tl.fromTo(
          accolade,
          { autoAlpha: 0, x: 24 },
          { autoAlpha: 1, x: 0, duration: 0.9, ease: "power2.out" },
          DOCK - 0.8,
        );

        tl.to([center, hint], { autoAlpha: 0, duration: 0.8 }, T0 + 0.1);
        tl.fromTo(
          [ticks, ...rig],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.9 },
          DOCK - 0.9,
        );
        if (dock) {
          tl.fromTo(
            dock,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
            DOCK - 0.7,
          );
        }

        /* 2 · one tool per scroll step */
        slides.forEach((slide, k) => {
          tl.fromTo(
            slide,
            { autoAlpha: 0, y: 40 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              immediateRender: false,
            },
            holdAt(k) - 0.5,
          );

          const leave = holdAt(k) + HOLD;
          tl.to(
            slide,
            { autoAlpha: 0, y: -40, duration: 0.35, ease: "power2.in" },
            leave,
          );

          if (k < N - 1) {
            tl.to(
              ring,
              {
                rotation: -(k + 1) * STEP,
                duration: MOVE,
                ease: "power2.inOut",
              },
              leave,
            );
          }
        });

        /* 3 · dial moves left and Accolade disappears with it */
        const out = holdAt(N - 1) + HOLD;
        tl.to(
          wheel,
          {
            x: () => -dockedR() * 1.6,
            autoAlpha: 0,
            duration: OUTRO,
            ease: "power2.in",
          },
          out,
        );
        tl.to(
          accolade,
          {
            x: () => (narrow() ? -120 : -180),
            autoAlpha: 0,
            duration: OUTRO * 0.75,
            ease: "power2.in",
          },
          out,
        );
        if (dock) tl.to(dock, { autoAlpha: 0, duration: 0.6 }, out);
        tl.to({}, { duration: 0.3 }, out + OUTRO);

        ScrollTrigger.create({
          animation: tl,
          trigger: el,
          start: "top top",
          end: () =>
            "+=" + Math.round(tl.duration() * VH_PER_UNIT * window.innerHeight),
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        });

        sync();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="dial" aria-label="The tools I use">
      <div className="dial-stage">
        <figure className="dial-accolade" aria-hidden="true">
          <img
            src={ACCOLADE.src}
            alt={ACCOLADE.alt}
            loading="eager"
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </figure>

        <div className="dial-wheel" style={{ "--n": N }} aria-hidden="true">
          <span className="dial-orbit" />
          <span className="dial-orbit dial-orbit--inner" />
          <span className="dial-line" />
          <span className="dial-pin" />

          <div className="dial-ring">
            <div className="dial-ticks">
              {Array.from({ length: 60 }, (_, j) => (
                <i
                  key={j}
                  className={`dial-tick${j % 4 === 0 ? " dial-tick--major" : ""}`}
                  style={{ "--j": j }}
                />
              ))}
            </div>

            {TOOLS.map((t, i) => (
              <div key={t.id} className="dial-item" style={{ "--i": i }}>
                <div className="dial-face">
                  <span className="dial-mono">{t.mono}</span>
                  <img
                    src={t.src}
                    alt=""
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <span className="dial-needle" />

          <div className="dial-center">
            <strong className="dial-center-quote">
              Every craft is knighted by its tools.
            </strong>
          </div>
        </div>

        <p className="dial-hint">Scroll through the tools</p>

        <div className="dial-copy">
          {TOOLS.map((t) => (
            <article key={t.id} className="dial-slide">
              <div className="dial-meta">
                <span className="dial-chip">{t.name}</span>
              </div>
              <h3 className="dial-title">{t.title}</h3>
              <p className="dial-text">{t.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsDial;
