import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/* ───────────── edit me ─────────────
   Save each painting in /public/images/art/ and point `src` at it.
   Until the file exists the box stays a red square with the title in it. */
const PAINTINGS = [
  {
    id: "accolade",
    kicker: "01 · Tools",
    title: "The Accolade",
    by: "Edmund Blair Leighton, 1901",
    text: "Every craft is knighted by its tools.",
    src: "/images/art/accolade.jpg",
    alt: "The Accolade by Edmund Blair Leighton: a knight being dubbed",
  },
  {
    id: "napoleon",
    kicker: "02 · The craft",
    title: "Napoleon Crossing the Alps",
    by: "Jacques-Louis David, 1801",
    text: "I build games, websites and animations, and I write film scripts.",
    src: "/images/art/napoleon.jpg",
    alt: "Napoleon Crossing the Alps by Jacques-Louis David",
  },
  {
    id: "stanczyk",
    kicker: "03 · The ban",
    title: "Stańczyk",
    by: "Jan Matejko, 1862",
    text: "GitHub banned my account. Stańczyk sat out the party too.",
    src: "/images/art/stanczyk.jpg",
    alt: "Stańczyk by Jan Matejko: a court jester brooding during a ball",
  },
];

/* where each box sits: [x in % of the width, y on a 0-300 scale where 100 = one screen] */
const WIDE = [
  [24, 50],
  [74, 150],
  [26, 250],
];
const NARROW = [
  [36, 50],
  [64, 150],
  [36, 250],
];

const Paintings = () => {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    const svg = el.querySelector(".paintings-svg");
    const route = el.querySelector(".paintings-route");
    const segs = [...el.querySelectorAll(".paintings-seg")];
    const head = el.querySelector(".paintings-head");
    const points = [...el.querySelectorAll(".paintings-point")];
    const boxes = points.map((p) => p.querySelector(".paintings-box"));
    const letters = points.map((p) => p.querySelector(".paintings-letter"));
    const imgs = points.map((p) => p.querySelector(".paintings-img"));
    const fallbacks = points.map((p) => p.querySelector(".paintings-fallback"));
    const caps = points.map((p) => p.querySelector(".paintings-cap"));

    let pts = [];

    const narrow = () => window.matchMedia("(max-width: 767px)").matches;
    const frame = () => {
      const w = Math.min(window.innerWidth * (narrow() ? 0.58 : 0.3), 360);
      return { w, h: w * 1.25 };
    };

    /* put the boxes and the straight line segments where they belong, in pixels */
    const place = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const spots = narrow() ? NARROW : WIDE;

      pts = spots.map(([x, y]) => [(W * x) / 100, (H * y) / 300]);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

      const seg = (a, b) => `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
      route.setAttribute("d", `M${pts.map((p) => p.join(" ")).join(" L")}`);
      segs[0].setAttribute("d", seg(pts[0], pts[1]));
      segs[1].setAttribute("d", seg(pts[1], pts[2]));

      points.forEach((f, i) => {
        f.style.left = `${spots[i][0]}%`;
        f.style.top = `${(spots[i][1] / 300) * 100}%`;
      });

      const { w, h } = frame();
      el.style.setProperty("--frame-w", `${w}px`);
      el.style.setProperty("--frame-h", `${h}px`);
    };

    place();
    ScrollTrigger.addEventListener("refreshInit", place);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(imgs, { scale: 1.15 });
      gsap.set(caps, { y: 24 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top 15%", // box 1 is just below the middle of the screen
          end: "bottom 85%", // box 3 is just above it
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      /* a box grows into its painting */
      const morph = (i, at) => {
        tl.to(
          boxes[i],
          {
            width: () => frame().w,
            height: () => frame().h,
            duration: 10,
            ease: "power2.inOut",
          },
          at,
        )
          .to(letters[i], { opacity: 0, duration: 4 }, at)
          .to([imgs[i], fallbacks[i]], { opacity: 1, duration: 8 }, at + 2)
          .to(imgs[i], { scale: 1, duration: 10 }, at + 2)
          .to(caps[i], { opacity: 1, y: 0, duration: 8 }, at + 4);
      };

      /* a straight red line runs from one box to the next, with a dot at its tip */
      const run = (k, at, length) => {
        tl.fromTo(
          segs[k],
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: length },
          at,
        )
          .set(head, { opacity: 1, x: () => pts[k][0], y: () => pts[k][1] }, at)
          .to(
            head,
            {
              x: () => pts[k + 1][0],
              y: () => pts[k + 1][1],
              duration: length,
            },
            at,
          );
      };

      morph(0, 0);
      run(0, 8, 36);
      morph(1, 42);
      run(1, 50, 36);
      morph(2, 84);
    });

    // reduced motion: everything already open and drawn
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const { w, h } = frame();
      gsap.set(boxes, { width: w, height: h });
      gsap.set(letters, { opacity: 0 });
      gsap.set([...imgs, ...fallbacks, ...caps], { opacity: 1 });
      gsap.set(segs, { drawSVG: "100%" });
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", place);
      mm.revert();
    };
  }, []);

  return (
    <section id="paintings" ref={root} aria-label="Three paintings">
      <svg className="paintings-svg" aria-hidden="true">
        <path className="paintings-route" />
        <path className="paintings-seg" />
        <path className="paintings-seg" />
      </svg>
      <span className="paintings-head" aria-hidden="true" />

      {PAINTINGS.map((p, i) => (
        <figure
          key={p.id}
          className="paintings-point"
          data-side={i % 2 ? "left" : "right"}
        >
          <div className="paintings-box">
            <span className="paintings-letter" aria-hidden="true">
              {i + 1}
            </span>
            <span className="paintings-fallback" aria-hidden="true">
              {p.title}
            </span>
            <img
              className="paintings-img"
              src={p.src}
              alt={p.alt}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <figcaption className="paintings-cap">
            <span className="paintings-kicker">{p.kicker}</span>
            <strong>{p.title}</strong>
            <span className="paintings-by">{p.by}</span>
            <p>{p.text}</p>
          </figcaption>
        </figure>
      ))}
    </section>
  );
};

export default Paintings;
