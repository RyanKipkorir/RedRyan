import { useId, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MOTION_QUERY } from "../lib/motion.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* drop your photo here */
const PHOTO = "/images/about.jpg";
/* extra viewport heights the finished scene stays pinned before the page moves on */
const HOLD = 0.5;
/* how far (in %) a pupil can travel */
const LOOK = 20;
/* full turns the plus makes while the scene is pinned */
const PLUS_TURNS = 3;

/* an eye: white almond, black pupil clipped to it */
const EYE = "M4 50Q50 2 96 50Q50 98 4 50Z";

const Eye = () => {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="about-eye-svg" viewBox="0 20 100 60" aria-hidden="true">
      <defs>
        <clipPath id={`eye-clip-${id}`}>
          <path d={EYE} />
        </clipPath>
      </defs>
      <g className="about-eye">
        <path d={EYE} fill="#ffffff" />
        <g clipPath={`url(#eye-clip-${id})`}>
          <circle
            className="about-pupil"
            cx="50"
            cy="50"
            r="20.91"
            fill="#000000"
          />
        </g>
      </g>
    </svg>
  );
};

const About = () => {
  const root = useRef(null);
  const track = useRef(null);
  const lines = useRef([]); // every .about-line (a single ref only kept the last one)
  const plus = useRef(null);
  const photo = useRef(null); // optional: only used if the photo figure is rendered

  useLayoutEffect(() => {
    const el = root.current;
    const row = track.current;
    const text = lines.current.filter(Boolean);
    const plusImg = plus.current;
    const frame = photo.current;
    /* the photo is optional now: it must not stop the animation from running */
    if (!el || !row || !text.length) return;

    const rand = (min, max) => gsap.utils.random(min, max);
    const mm = gsap.matchMedia();
    let split = null;

    mm.add(MOTION_QUERY, () => {
      const rises = gsap.utils.toArray(".about-rise", el);
      if (rises.length) {
        gsap.from(rises, {
          y: 32,
          opacity: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      split = SplitText.create(text, { type: "chars, words" });
      const words = split.words;
      const chars = split.chars;

      /* how far the row travels so its last item lands on screen */
      const distance = () => Math.max(0, row.offsetWidth - window.innerWidth);
      const pinLength = () => distance() + window.innerHeight * HOLD;

      /* 1. pin one full screen: the sentence slides across it,
            then the finished scene holds for a moment */
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + pinLength(),
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 3,
      });

      const slide = gsap.to(row, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + distance(),
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      /* 2. each letter springs out of place as it passes the centre */
      chars.forEach((char) => {
        gsap.from(char, {
          yPercent: () => rand(-200, 200),
          rotation: () => rand(-20, 20),
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: char,
            containerAnimation: slide,
            start: "left 100%",
            end: "left 30%",
            scrub: 1,
          },
        });
      });

      /* 3. the plus rolls the whole time you keep scrolling */
      if (plusImg) {
        gsap.to(plusImg, {
          rotation: -360 * PLUS_TURNS,
          transformOrigin: "50% 50%",
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => "+=" + pinLength(),
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      /* 4. the photo develops as it slides into view (only if it exists) */
      const img = frame?.querySelector("img");
      if (img) {
        gsap.from(img, {
          scale: 1.35,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            containerAnimation: slide,
            start: "left 95%",
            end: "left 55%",
            scrub: 1,
          },
        });
      }

      /* 5. the 3D word intro, plays once as the section arrives */
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 65%", once: true },
      });

      words.forEach((w) =>
        tl.from(
          w,
          {
            z: rand(-500, 300),
            opacity: 0,
            rotationY: rand(-40, 40),
            duration: 1.5,
            ease: "power3.out",
          },
          Math.random() * 1.5,
        ),
      );
      tl.from(
        text,
        {
          rotationY: 180,
          transformOrigin: "50% 75% 200",
          duration: 3,
          ease: "power2.out",
        },
        0,
      );

      tl.addLabel("pulse", ">");
      words.forEach((w) => {
        const z = rand(-50, 50);
        tl.to(w, { z, opacity: (z + 50) / 100, duration: 0.5 }, "pulse");
      });
      tl.to(text, { rotationY: 20, duration: 0.5 }, "pulse");

      tl.addLabel("pulse2", ">");
      words.forEach((w) => {
        const z = rand(-100, 100);
        tl.to(w, { z, opacity: (z + 100) / 200, duration: 0.5 }, "pulse2");
      });
      tl.to(text, { rotationX: -35, rotationY: 0, duration: 0.5 }, "pulse2");

      tl.addLabel("reset", ">");
      tl.to(words, { z: 0, opacity: 1, duration: 0.5 }, "reset");
      tl.to(text, { rotationX: 0, rotationY: 0, duration: 0.5 }, "reset");

      return () => {
        split?.revert();
        split = null;
      };
    });

    /* both eyes follow the cursor, only while the screen is showing */
    const eyes = Array.from(el.querySelectorAll(".about-eye"));
    const pupils = Array.from(el.querySelectorAll(".about-pupil"));
    let inView = false;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(el);

    const onMove = (e) => {
      if (!inView) return;
      eyes.forEach((eye, i) => {
        const r = eye.ownerSVGElement.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        const px = gsap.utils.clamp(
          -LOOK,
          LOOK,
          (x / (window.innerWidth / 2)) * LOOK,
        );
        const py = gsap.utils.clamp(
          -LOOK,
          LOOK,
          (y / (window.innerHeight / 2)) * LOOK,
        );

        gsap.to(pupils[i], {
          xPercent: px,
          yPercent: py,
          duration: 0.2,
          overwrite: "auto",
        });
        gsap.to(eye, {
          xPercent: px * 0.4,
          yPercent: py * 0.4,
          duration: 0.2,
          overwrite: "auto",
        });
      });
    };
    window.addEventListener("pointermove", onMove);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf([...eyes, ...pupils]);
      mm.revert();
    };
  }, []);

  return (
    <section id="about">
      <div className="about-stage" ref={root}>
        <div className="about-head">
          <p className="about-kicker about-rise">Hi, I’m Ryan</p>
          <h2 className="about-big about-rise">
            A <strong>Creative</strong> developer
          </h2>
        </div>

        <div className="about-track" ref={track}>
          <p
            className="about-line"
            ref={(n) => {
              lines.current[0] = n;
            }}
          >
            fascinated by the intersection of
          </p>

          <p
            className="about-line"
            ref={(n) => {
              lines.current[1] = n;
            }}
          >
            <strong>math</strong>,
            <img
              ref={plus}
              src="/images/plus.png"
              alt=""
              draggable={false}
              className="inline-block size-10"
            />
          </p>

          <p
            className="about-line"
            ref={(n) => {
              lines.current[2] = n;
            }}
          >
            <strong>motion</strong> and. <strong>visual storytelling</strong>
          </p>

          <div className="about-eyes" aria-hidden="true">
            <Eye />
            <Eye />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
