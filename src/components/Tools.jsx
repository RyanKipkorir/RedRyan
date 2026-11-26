import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import ToolsDial from "./ToolsDial";
import Stan from "./Stan";
import HeroGrid from "./HeroGrid";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/* ───────────── Paintings after the dial: Napoleon (animated) -> Stan (last) ───────────── */
const PAINTINGS = [
  {
    id: "napoleon",
    kicker: "02 · The craft",
    title: "Napoleon Crossing the Alps",
    by: "Jacques-Louis David, 1801",
    text: "I build games, websites and animations, and I write film scripts.",
    src: "/images/napoleon.jpg",
    alt: "Napoleon Crossing the Alps by Jacques-Louis David",
  },
  {
    id: "stanczyk",
    kicker: "03 · The ban",
    title: "History repeats itself.",
    by: "Stańczyk by Jan Matejko, 1862",
    lines: [
      "Matejko painted the court jester sitting out a ball while the news of Smolensk’s fall sinks in. The music plays on. He is the only one in the room who understands what just happened.",
      "Different century, same room. On October 30 GitHub suspended my account while I was shipping an APK with a local AI and a self-custodial wallet. The party carried on and I sat it out, like the jester. The room changes, the jester’s chair doesn’t.",
    ],
  },
];

const WIDE = [
  [18, 78],
  [18, 228],
];
const NARROW = [
  [50, 72],
  [50, 228],
];

const Tools = () => {
  const sectionRef = useRef(null);
  const paintingsRef = useRef(null);

  useLayoutEffect(() => {
    const el = paintingsRef.current;
    if (!el) return;

    const svg = el.querySelector(".paintings-svg");
    const route = el.querySelector(".paintings-route");
    const seg = el.querySelector(".paintings-seg");
    const head = el.querySelector(".paintings-head");
    const points = [...el.querySelectorAll(".paintings-point")];
    const boxes = points.map((p) => p.querySelector(".paintings-box"));
    const letters = points.map((p) => p.querySelector(".paintings-letter"));
    const imgs = points.map((p) => p.querySelector(".paintings-img"));
    const fallbacks = points.map((p) => p.querySelector(".paintings-fallback"));
    const caps = points.map((p) => p.querySelector(".paintings-cap"));
    const napoleonCard = el.querySelector(".napoleon-simple");

    let pts = [];

    const narrow = () => window.matchMedia("(max-width: 1023px)").matches;
    const frame = () => {
      const w = Math.min(window.innerWidth * (narrow() ? 0.56 : 0.24), 320);
      return { w, h: w * 1.25 };
    };

    const place = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const spots = narrow() ? NARROW : WIDE;

      pts = spots.map(([x, y]) => [(W * x) / 100, (H * y) / 300]);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

      route.setAttribute("d", `M${pts.map((p) => p.join(" ")).join(" L")}`);
      seg.setAttribute(
        "d",
        `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`,
      );

      points.forEach((f, i) => {
        f.style.left = `${spots[i][0]}%`;
        f.style.top = `${(spots[i][1] / 300) * 100}%`;
      });

      const f = frame();
      el.style.setProperty("--frame-w", `${f.w}px`);
      el.style.setProperty("--frame-h", `${f.h}px`);
    };

    place();
    ScrollTrigger.addEventListener("refreshInit", place);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      sectionRef.current
        ?.querySelectorAll("[data-parallax]")
        .forEach((scene) => {
          const layers = scene.querySelectorAll("[data-parallax-speed]");
          const pTl = gsap.timeline({
            scrollTrigger: {
              trigger: scene,
              start: "clamp(top bottom)",
              end: "clamp(bottom top)",
              scrub: true,
            },
          });

          layers.forEach((layer) => {
            const shift = (1 - parseFloat(layer.dataset.parallaxSpeed)) * 50;
            pTl.fromTo(
              layer,
              { yPercent: -shift },
              { yPercent: shift, ease: "none" },
              0,
            );
          });
        });

      gsap.set(imgs.filter(Boolean), { scale: 1.15 });
      gsap.set(caps.filter(Boolean), { y: 24 });
      gsap.set(napoleonCard, { autoAlpha: 0, y: 36, scale: 0.97 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top 25%",
          end: "bottom 85%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      /* 02 · Napoleon animates in */
      tl.to(
        napoleonCard,
        { autoAlpha: 1, y: 0, scale: 1, duration: 12, ease: "power2.out" },
        0,
      )
        /* Path draws from Napoleon down to Stan (last) */
        .fromTo(seg, { drawSVG: "0%" }, { drawSVG: "100%", duration: 36 }, 14)
        .set(head, { opacity: 1, x: () => pts[0][0], y: () => pts[0][1] }, 14)
        .to(
          head,
          {
            x: () => pts[1][0],
            y: () => pts[1][1],
            duration: 36,
          },
          14,
        )
        /* 03 · Stan opens last */
        .to(
          boxes[1],
          {
            width: () => frame().w,
            height: () => frame().h,
            duration: 10,
            ease: "power2.inOut",
          },
          50,
        )
        .to(letters[1], { opacity: 0, duration: 4 }, 50)
        .to([imgs[1], fallbacks[1]], { opacity: 1, duration: 8 }, 52)
        .to(imgs[1], { scale: 1, duration: 10 }, 52)
        .to(caps[1], { opacity: 1, y: 0, duration: 8 }, 54);
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      points.forEach((p, i) => {
        if (!imgs[i]) return;
        const { w, h } = frame();
        gsap.set(boxes[i], { width: w, height: h });
        gsap.set(letters[i], { opacity: 0 });
      });
      gsap.set([...imgs, ...fallbacks, ...caps].filter(Boolean), {
        opacity: 1,
      });
      gsap.set(napoleonCard, { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(seg, { drawSVG: "100%" });
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", place);
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tools"
      className="tools"
      aria-labelledby="tools-title"
    >
      <div className="w-full tone-red ">
        <h1>Tools</h1>
      </div>
      <div className="paintings-world">
        <ToolsDial />

        <section id="paintings" ref={paintingsRef} aria-label="Paintings">
          <svg className="paintings-svg" aria-hidden="true">
            <path className="paintings-route" />
            <path className="paintings-seg" />
          </svg>
          <span className="paintings-head" aria-hidden="true" />

          {PAINTINGS.map((p, i) => {
            const isNapoleon = p.id === "napoleon";
            const isStanczyk = p.id === "stanczyk";

            return (
              <figure
                key={p.id}
                className={`paintings-point paintings-point--${p.id}`}
                data-side="right"
              >
                <div className={`paintings-box paintings-box--${p.id}`}>
                  <span className="paintings-letter" aria-hidden="true">
                    {i + 1}
                  </span>

                  {!isNapoleon && (
                    <span className="paintings-fallback" aria-hidden="true">
                      {p.title}
                    </span>
                  )}

                  {isStanczyk && (
                    <div className="paintings-img paintings-img--stan">
                      <Stan />
                    </div>
                  )}
                </div>

                {isNapoleon && (
                  <div className="napoleon-simple">
                    <div className="napoleon-simple__copy">
                      <span className="paintings-kicker">{p.kicker}</span>
                      <h3 className="napoleon-heading">{p.title}</h3>
                      <span className="paintings-by">{p.by}</span>
                      <p className="napoleon-lead">{p.text}</p>
                    </div>
                    <div className="napoleon-simple__media">
                      <img
                        src={p.src}
                        alt={p.alt}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}

                {!isNapoleon && (
                  <figcaption className="paintings-cap paintings-cap--feature">
                    <div className="paintings-copy">
                      <span className="paintings-kicker">{p.kicker}</span>
                      <strong>{p.title}</strong>
                      <span className="paintings-by">{p.by}</span>
                      {p.lines ? (
                        p.lines.map((line) => <p key={line}>{line}</p>)
                      ) : (
                        <p>{p.text}</p>
                      )}
                    </div>
                  </figcaption>
                )}
              </figure>
            );
          })}
        </section>
      </div>
    </section>
  );
};

export default Tools;
