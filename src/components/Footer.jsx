import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

/* same commands in both paths so MorphSVG can tween between them */
const DOWN = "M0 0C0 0 464 240 1139 240S2278 0 2278 0V683H0V0z";
const FLAT = "M0 0C0 0 464 0 1139 0S2278 0 2278 0V683H0V0z";

const Footer = () => {
  const root = useRef(null);
  const path = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const bounce = (self) => {
        // faster scrolling = a bigger, springier bounce
        const v = gsap.utils.clamp(
          0,
          0.6,
          Math.abs(self.getVelocity()) / 10000,
        );

        gsap.fromTo(
          path.current,
          { morphSVG: DOWN },
          {
            morphSVG: FLAT,
            duration: 2,
            ease: `elastic.out(${1 + v}, ${1 - v})`,
            overwrite: true,
          },
        );
      };

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        onEnter: bounce,
        onEnterBack: bounce,
      });
    });

    // reduced motion: just the flat edge
    mm.add("(prefers-reduced-motion: reduce)", () => {
      path.current.setAttribute("d", FLAT);
    });

    return () => mm.revert();
  }, []);

  return (
    <footer id="footer" ref={root}>
      <svg
        className="footer-wave"
        viewBox="0 0 2278 683"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={path} d={DOWN} />
      </svg>
      <div className="noisy" aria-hidden="true" />

      <div className="footer-inner">
        <div>
          <img
            src="/images/sculpture.png"
            className="size-24 lg:size-42  xl:size-48"
          />
          <p className="footer-copy">© {new Date().getFullYear()}</p>
        </div>
        <figure className="footer-quote">
          <blockquote>
            <p>
              “We are what we repeatedly do. Excellence, then, is not an act,
              but a habit.”
            </p>
          </blockquote>
          <figcaption>— Aristotle</figcaption>
        </figure>
      </div>
    </footer>
  );
};

export default Footer;
