import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";

/* forked from Blake Bowen's shape overlays: https://codepen.io/osublake/pen/BYwgBg
   Each path is a wave built from POINTS control points that move on their own random delay.
   One wipe = the layers rise from the bottom and cover the screen, `onCovered` runs while
   nothing can be seen, then the layers keep going up and uncover the page. */
const POINTS = 10;
const POINT_DELAY_MAX = 0.3; // how far apart the points of one wave start
const PATH_DELAY = 0.25; // gap between one layer and the next
const DURATION = 0.9; // seconds one point takes

/* colors: back layer first, front layer last (it is the one that ends up on top) */
const ShapeOverlay = forwardRef(({ colors = ["#ffffff", "#ff0000"] }, ref) => {
  const svg = useRef(null);
  const api = useRef({ play: () => {} });

  useImperativeHandle(
    ref,
    () => ({ play: (onCovered) => api.current.play(onCovered) }),
    [],
  );

  useLayoutEffect(() => {
    const paths = [...svg.current.querySelectorAll("path")];
    const count = paths.length;
    const all = paths.map(() => Array(POINTS).fill(100));

    let opened = true; // true + every point at 100 = nothing visible
    let busy = false;
    let alive = true;
    let tl;

    const render = () => {
      paths.forEach((path, i) => {
        const pts = all[i];
        let d = opened ? `M 0 0 V ${pts[0]} C` : `M 0 ${pts[0]} C`;

        for (let j = 0; j < POINTS - 1; j++) {
          const p = ((j + 1) / (POINTS - 1)) * 100;
          const cp = p - ((1 / (POINTS - 1)) * 100) / 2;
          d += ` ${cp} ${pts[j]} ${cp} ${pts[j + 1]} ${p} ${pts[j + 1]}`;
        }

        d += opened ? " V 100 H 0" : " V 0 H 0";
        path.setAttribute("d", d);
      });
    };

    /* open = the layers rise from the bottom; closed = they leave through the top */
    const sweep = (open) =>
      new Promise((resolve) => {
        opened = open;
        all.forEach((pts) => pts.fill(100));
        render();

        tl?.kill();
        tl = gsap.timeline({
          onUpdate: render,
          onComplete: resolve,
          defaults: { ease: "power2.inOut", duration: DURATION },
        });

        const delays = Array.from(
          { length: POINTS },
          () => Math.random() * POINT_DELAY_MAX,
        );

        all.forEach((pts, i) => {
          const pathDelay = PATH_DELAY * (open ? i : count - i - 1);
          for (let j = 0; j < POINTS; j++) {
            tl.to(pts, { [j]: 0 }, delays[j] + pathDelay);
          }
        });
      });

    api.current.play = async (onCovered) => {
      if (busy) return;
      busy = true;
      svg.current.style.visibility = "visible";

      await sweep(true); // cover
      if (!alive) return;
      onCovered?.();
      await new Promise((r) => gsap.delayedCall(0.15, r));
      if (!alive) return;

      await sweep(false); // uncover
      if (!alive) return;

      opened = true;
      all.forEach((pts) => pts.fill(100));
      render();
      svg.current.style.visibility = "hidden";
      busy = false;
    };

    render();

    return () => {
      alive = false;
      tl?.kill();
    };
  }, []);

  return (
    <svg
      ref={svg}
      className="shape-overlays"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {colors.map((fill, i) => (
        <path key={i} fill={fill} />
      ))}
    </svg>
  );
});

export default ShapeOverlay;
