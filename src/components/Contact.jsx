import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOPPLE = 66; // final lean (deg). Parallel leaning tiles never overlap at this angle.

const ICONS = {
  x: (
    <svg
      className="contact-q-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  github: (
    <svg
      className="contact-q-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  linkedin: (
    <svg
      className="contact-q-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  mail: (
    <svg
      className="contact-q-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
};

/* Order = where each tile lands after the cube turns 45°: top, right, left, bottom.
   `from` = where its icon slides in from, `nudge` = how its tile drifts apart.
   Swap the placeholder handles for your real ones. */
const SOCIALS = [
  {
    label: "X",
    href: "https://x.com/your-handle",
    icon: "x",
    from: { y: 10 },
    nudge: { x: -6, y: -6 },
  },
  {
    label: "GitHub",
    href: "https://github.com/redlitelighter",
    icon: "github",
    from: { x: -10 },
    nudge: { x: 6, y: -6 },
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/your-handle",
    icon: "linkedin",
    from: { x: 10 },
    nudge: { x: -6, y: 6 },
  },
  {
    label: "Email",
    href: "mailto:you@example.com",
    icon: "mail",
    from: { y: -10 },
    nudge: { x: 6, y: 6 },
  },
];

/* the plus cube: spins, splits into four tiles, icons slide in */
const buildCube = (wrap) => {
  const cube = wrap.querySelector(".contact-cube");
  const bar = {
    v: wrap.querySelector(".contact-plus-v"),
    h: wrap.querySelector(".contact-plus-h"),
  };
  const tiles = [...wrap.querySelectorAll(".contact-q")];
  const icons = tiles.map((t) => t.querySelector(".contact-q-icon"));

  SOCIALS.forEach((s, i) => gsap.set(icons[i], { opacity: 0, ...s.from }));

  const tl = gsap.timeline({ paused: true });

  tl.addLabel("first", 0)
    .to(
      cube,
      {
        rotation: 45,
        width: "100%",
        height: "100%",
        duration: 0.4,
        ease: "expo.out",
      },
      "first",
    )
    .to(bar.v, { height: 0, duration: 0.3, ease: "power1.in" }, "first")
    .to(bar.h, { width: 0, duration: 0.3, ease: "power1.in" }, "first")
    .set(cube, { backgroundColor: "transparent" }, 0.4)
    .addLabel("separate", 0.4);

  tiles.forEach((tile, i) => {
    tl.to(tile, { ...SOCIALS[i].nudge, duration: 0.15 }, "separate").to(
      icons[i],
      { opacity: 1, x: 0, y: 0, duration: 0.2 },
      "separate+=0.2",
    );
  });

  return tl;
};

const Contact = () => {
  const root = useRef(null);
  const scene = useRef(null);
  const ball = useRef(null);
  const cubeWrap = useRef(null);

  // fewer dominos on phones so the row fits
  const [count] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 6 : 10,
  );

  useLayoutEffect(() => {
    const tiles = [...scene.current.querySelectorAll(".contact-tile")];
    const b = ball.current;
    const wrap = cubeWrap.current;

    // distance the ball rolls before it touches the first domino
    const dist = () => tiles[0].offsetLeft - b.offsetWidth;
    // rolling without slipping: angle = distance / radius
    const roll = () => (dist() / (b.offsetWidth / 2)) * (180 / Math.PI);

    gsap.set(tiles, { transformOrigin: "100% 100%" }); // pivot on the bottom-right edge

    let cubeTl;
    const ctx = gsap.context(() => {
      cubeTl = buildCube(wrap);
    }, root);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* ---- scroll: the ball rolls, the dominos fall ---- */
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

      tl.fromTo(
        b,
        { x: 0, rotation: 0 },
        { x: dist, rotation: roll, duration: 4 },
        0,
      );

      tiles.forEach((tile, i) => {
        tl.to(
          tile,
          { rotation: TOPPLE, duration: 0.7, ease: "power2.in" },
          3.9 + i * 0.35,
        );
      });

      /* ---- plus cube: hover, tap, or keyboard focus ---- */
      const cube = wrap.querySelector(".contact-cube");

      const open = () => {
        wrap.classList.add("is-open");
        cubeTl.timeScale(1.6).play();
      };
      const close = () => {
        wrap.classList.remove("is-open");
        cubeTl.timeScale(1.8).reverse();
      };

      const onEnter = (e) => e.pointerType === "mouse" && open();
      const onLeave = (e) => e.pointerType === "mouse" && close();
      const onCubeClick = () => !wrap.classList.contains("is-open") && open(); // touch
      const onFocusOut = (e) => !wrap.contains(e.relatedTarget) && close();
      const onOutside = (e) =>
        wrap.classList.contains("is-open") &&
        !wrap.contains(e.target) &&
        close();

      wrap.addEventListener("pointerenter", onEnter);
      wrap.addEventListener("pointerleave", onLeave);
      wrap.addEventListener("focusin", open);
      wrap.addEventListener("focusout", onFocusOut);
      cube.addEventListener("click", onCubeClick);
      document.addEventListener("pointerdown", onOutside);

      return () => {
        wrap.removeEventListener("pointerenter", onEnter);
        wrap.removeEventListener("pointerleave", onLeave);
        wrap.removeEventListener("focusin", open);
        wrap.removeEventListener("focusout", onFocusOut);
        cube.removeEventListener("click", onCubeClick);
        document.removeEventListener("pointerdown", onOutside);
        wrap.classList.remove("is-open");
      };
    });

    // reduced motion: the finished scene, the cube already open, no pinning
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(b, { x: dist(), rotation: roll() });
      gsap.set(tiles, { rotation: TOPPLE });
      cubeTl.progress(1);
      wrap.classList.add("is-open");
    });

    // fonts change the layout height; re-measure once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [count]);

  return (
    <section id="contact" ref={root}>
      <div className="contact-inner">
        <div className="contact-top">
          <div className="contact-copy">
            <h2 className="contact-title">
              <span>Got work</span>
              <span>for me?</span>
            </h2>
            <p className="contact-sub">Hit me up for gigs and collaboration.</p>
          </div>

          <figure className="contact-photo">
            {/* put your photo at public/images/ryan.jpg (or change the src) */}
            <img
              src="/images/pic.jpg"
              alt="Ryan Kipkorir"
              width="800"
              height="1000"
              decoding="async"
              onLoad={() => ScrollTrigger.refresh()}
            />
          </figure>
        </div>

        <div className="contact-foot">
          <div className="contact-find">
            <p className="contact-hint" aria-hidden="true">
              ...
            </p>
          </div>
          <div
            className="contact-cube-wrap"
            ref={cubeWrap}
            role="group"
            aria-label="Social links"
          >
            <div className="contact-cube">
              <div className="contact-plus-v" aria-hidden="true" />
              <div className="contact-plus-h" aria-hidden="true" />

              <div className="contact-quad">
                {SOCIALS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    className="contact-q"
                    href={href}
                    aria-label={label}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                  >
                    <span className="contact-q-content">{ICONS[icon]}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="contact-scene" ref={scene} aria-hidden="true">
          <div className="contact-ball" ref={ball} />
          {Array.from({ length: count }, (_, i) => (
            <i key={i} className="contact-tile" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
