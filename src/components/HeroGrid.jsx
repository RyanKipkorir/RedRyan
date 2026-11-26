import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/* A ceiling seen in perspective: the horizon sits on the bottom edge of the drawing, the
   vanishing point is its middle, and the lines fan out and spread toward the top.

   - rays   : straight lines from the vanishing point to points along (and past) the top edge
   - rows   : lines parallel to the horizon. A row at depth z sits 300 / z above the horizon, so
              they bunch up near the horizon and spread out toward the top, as in the reference. */
const W = 1000;
const H = 300;
const VP = { x: W / 2, y: H };

const RAYS = Array.from({ length: 21 }, (_, i) => VP.x + (i - 10) * 125);
const ROWS = Array.from({ length: 24 }, (_, i) => H - H / (1 + i * 0.5));

const HeroGrid = () => {
  const root = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const rays = root.current.querySelectorAll(".hero-grid-ray");
      const rows = root.current.querySelectorAll(".hero-grid-row");

      /* the lines draw themselves once the hero is on screen:
         rays run out of the vanishing point, rows open up from the middle */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 90%",
            once: true,
          },
        })
        .fromTo(
          rays,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration: 1.1,
            ease: "power2.out",
            stagger: { each: 0.04, from: "center" },
          },
          0,
        )
        .fromTo(
          rows,
          { drawSVG: "50% 50%" },
          {
            drawSVG: "0% 100%",
            duration: 0.9,
            ease: "power2.out",
            stagger: { each: 0.035, from: "end" },
          },
          0.25,
        );
    });

    return () => mm.revert();
  }, []);

  return (
    <svg
      ref={root}
      className="hero-grid"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {RAYS.map((x) => (
        <line
          key={x}
          className="hero-grid-ray"
          x1={VP.x}
          y1={VP.y}
          x2={x}
          y2={0}
        />
      ))}
      {ROWS.map((y, i) => (
        <line
          key={i}
          className="hero-grid-row"
          x1={-W}
          y1={y}
          x2={W * 2}
          y2={y}
        />
      ))}
    </svg>
  );
};

export default HeroGrid;
