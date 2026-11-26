import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTACT_SOCIALS } from "../../constants";
import { MOTION_QUERY } from "../lib/motion.js";

gsap.registerPlugin(ScrollTrigger);

const TOPPLE = 66;

const Contact = () => {
  const root = useRef(null);
  const scene = useRef(null);
  const ball = useRef(null);

  const [count] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 3 : 5,
  );

  useLayoutEffect(() => {
    const el = root.current;
    const sc = scene.current;
    const b = ball.current;
    if (!el || !sc || !b) return;

    const tiles = [...sc.querySelectorAll(".contact-tile")];
    if (tiles.length === 0) return;

    const dist = () => tiles[0].offsetLeft - b.offsetWidth;
    const roll = () => (dist() / (b.offsetWidth / 2)) * (180 / Math.PI);

    gsap.set(tiles, { transformOrigin: "100% 100%" });

    const mm = gsap.matchMedia();

    mm.add(MOTION_QUERY, () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Red ball rolls across the track without slipping
      tl.fromTo(
        b,
        { x: 0, rotation: 0 },
        { x: dist, rotation: roll, duration: 4 },
        0,
      );

      // 2. Chain topple with a subtle impact settle on each tile
      tiles.forEach((tile, i) => {
        const hitAt = 3.9 + i * 0.35;
        tl.to(
          tile,
          { rotation: TOPPLE, duration: 0.55, ease: "power2.in" },
          hitAt,
        )
          .to(
            tile,
            {
              borderColor: "#ff0000",
              duration: 0.15,
              ease: "none",
            },
            hitAt + 0.35,
          )
          .to(
            tile,
            { rotation: TOPPLE - 2, duration: 0.15, ease: "power1.out" },
            hitAt + 0.55,
          );
      });
    });

    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
    };
  }, [count]);

  return (
    <section id="contact" ref={root} aria-labelledby="contact-heading">
      <div className="contact-inner">
        <div className="contact-top">
          <div className="contact-copy">
            <h2 id="contact-heading" className="contact-title">
              <span>Got work</span>
              <span>for me?</span>
            </h2>
            <p className="contact-sub">
              Hit me up for gigs, games, web builds, and collaboration.
            </p>
          </div>
        </div>

        <div className="contact-scene" ref={scene} aria-hidden="true">
          <div className="contact-ball" ref={ball} />
          {Array.from({ length: count }, (_, i) => (
            <i key={i} className="contact-tile" />
          ))}
        </div>

        <p className="contact-hint" aria-hidden="true">
          Keep scrolling to trigger the chain.
        </p>

        <ul className="contact-socials">
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
                  className="contact-link__icon"
                />
                <span className="contact-link__label">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Contact;
