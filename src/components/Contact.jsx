import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTACT_SOCIALS } from "../../constants";
import { whenReady } from "./stories/storyUtils";

gsap.registerPlugin(ScrollTrigger);

/* swap the placeholder handles for your real ones */
const TOPPLE = 66; // final lean (deg). Parallel leaning tiles never overlap at this angle.

const Contact = () => {
  const root = useRef(null);
  const scene = useRef(null);
  const ball = useRef(null);

  // fewer dominos on phones so the row fits
  const [count] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 6 : 10,
  );

  useLayoutEffect(() => {
    let mm;
    const cancel = whenReady(() => {
      const tiles = [...scene.current.querySelectorAll(".contact-tile")];
      const b = ball.current;

      // distance the ball rolls before it touches the first domino
      const dist = () => tiles[0].offsetLeft - b.offsetWidth;
      // rolling without slipping: angle = distance / radius
      const roll = () => (dist() / (b.offsetWidth / 2)) * (180 / Math.PI);

      gsap.set(tiles, { transformOrigin: "100% 100%" }); // pivot on the bottom-right edge

      mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1. the red ball rolls in
        tl.fromTo(
          b,
          { x: 0, rotation: 0 },
          { x: dist, rotation: roll, duration: 4 },
          0,
        );

        // 2. it clips the first domino, which sets off the chain
        tiles.forEach((tile, i) => {
          tl.to(
            tile,
            { rotation: TOPPLE, duration: 0.7, ease: "power2.in" },
            3.9 + i * 0.35,
          );
        });
      });

      // reduced motion: show the finished scene, no pinning
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(b, { x: dist(), rotation: roll() });
        gsap.set(tiles, { rotation: TOPPLE });
      });

      ScrollTrigger.refresh();
    });

    return () => {
      cancel();
      mm?.revert();
    };
  }, [count]);

  return (
    <section id="contact" ref={root}>
      <div className="contact-inner">
        <h2 className="contact-title">
          <span>Got work</span>
          <span>for me?</span>
        </h2>

        <p className="contact-sub">Hit me up for gigs and collaboration.</p>

        <div className="contact-scene" ref={scene} aria-hidden="true">
          <div className="contact-ball" ref={ball} />
          {Array.from({ length: count }, (_, i) => (
            <i key={i} className="contact-tile" />
          ))}
        </div>

        <p className="contact-hint" aria-hidden="true">
          Keep scrolling.
        </p>

        <ul className=" flex-row">
          {CONTACT_SOCIALS.map(({ label, href, icon }) => (
            <li key={label}>
              <a
                className="contact-link"
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={label}
              >
                <img
                  src={icon}
                  alt=""
                  width="48"
                  height="48"
                  className="size-12 object-contain"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Contact;
