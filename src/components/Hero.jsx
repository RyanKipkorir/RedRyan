import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
import { ArrowBigRight } from "lucide-react";
import {
  HERO_ACTIONS,
  HERO_PROFILE,
  HERO_RED_LETTERS,
  HERO_RYAN_LETTERS,
  HERO_SCRAMBLE_CHARS,
  HERO_STATEMENT,
  SECTION_IDS,
} from "../../constants/index.js";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrambleTextPlugin, useGSAP);

/* drop your image here */
const HERO_IMAGE = "/images/hero-left.png";
/* drop your video here */
const HERO_VIDEO = "/videos/output.mp4";
/* true: the video scrubs with the scroll and ends with School.
   false: it just plays on a loop behind everything. */
const SCRUB = true;

/* three down chevrons, fading in toward the bottom */
const DownArrows = ({ className = "" }) => (
  <svg
    className={className}
    width="96"
    height="240"
    viewBox="0 0 40 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 8l14 14L34 8" opacity="0.3" />
    <path d="M6 38l14 14L34 38" opacity="0.65" />
    <path d="M6 68l14 14L34 68" />
  </svg>
);

const Word = ({ letters = [] }) => (
  <div className="hero-word" aria-hidden="true">
    {letters.map((ch, i) => (
      <span key={i} className="hero-letter">
        {ch}
      </span>
    ))}
  </div>
);

const Hero = () => {
  const root = useRef(null);
  const bg = useRef(null);
  const video = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".hero-reveal", { autoAlpha: 0 });

        /* intro: the video fades up, the letters come toward you out of the distance */
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(
            video.current,
            { opacity: 0, duration: 2.4, ease: "power2.out" },
            0,
          )
          .from(
            ".hero-letter",
            {
              z: -1400,
              opacity: 0,
              duration: 2,
              ease: "power3.out",
              stagger: 0.15,
            },
            0.2,
          )
          .from(
            ".left-quart, .right-arrow",
            { opacity: 0, duration: 1.6, ease: "power2.out", stagger: 0.2 },
            0.6,
          )
          .from(
            ".hero-btn",
            {
              y: 40,
              opacity: 0,
              duration: 1,
              stagger: 0.12,
              clearProps: "transform,opacity",
            },
            2.2,
          )
          .to(".hero-meta", { autoAlpha: 1, duration: 1 }, 1.2)
          .to(".hero-statement", { autoAlpha: 1, duration: 0.01 }, 1.2)
          .to(
            ".hero-statement-text",
            {
              duration: 2.6,
              ease: "none",
              scrambleText: {
                text: HERO_STATEMENT,
                chars: HERO_SCRAMBLE_CHARS,
                revealDelay: 0.4,
                speed: 0.5,
              },
            },
            1.2,
          );

        /* scroll: image drifts up, arrows drift down */
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to(".left-quart", { y: -200, ease: "none" }, 0)
          .to(".right-arrow", { y: 200, ease: "none" }, 0);
      });
    },
    { scope: root },
  );

  /* the video follows the scroll from the top of Hero to the end of School.
     Progress is measured live, so About's and School's pins can't throw it off. */
  useEffect(() => {
    const v = video.current;
    if (!v) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      v.pause();
      return;
    }
    if (!SCRUB) return;

    const last = () =>
      document.getElementById("school") ||
      document.getElementById("about") ||
      root.current;

    const progress = () => {
      const total =
        last().getBoundingClientRect().bottom +
        window.scrollY -
        window.innerHeight;
      return total > 0 ? gsap.utils.clamp(0, 1, window.scrollY / total) : 0;
    };

    const update = () => {
      if (!v.duration) return;
      gsap.to(v, {
        currentTime: progress() * v.duration,
        duration: 0.4,
        ease: "power3",
        overwrite: "auto",
      });
    };

    if (v.readyState >= 1) update();
    else v.addEventListener("loadedmetadata", update, { once: true });

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      v.removeEventListener("loadedmetadata", update);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      gsap.killTweensOf(v, "currentTime");
    };
  }, []);

  /* the backdrop is fixed, so it only shows while Hero, About or School is on screen */
  useEffect(() => {
    const targets = [
      root.current,
      document.getElementById("about"),
      document.getElementById("school"),
    ].filter(Boolean);
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) =>
        en.isIntersecting ? seen.add(en.target) : seen.delete(en.target),
      );
      if (bg.current)
        bg.current.style.visibility = seen.size ? "visible" : "hidden";
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const goTo = contextSafe((e, id) => {
    e.preventDefault();
    gsap.to(window, {
      duration: 2,
      scrollTo: { y: id },
      ease: "power2.inOut",
    });
  });

  return (
    <>
      {/* fixed backdrop: the wireframe terrain + grain */}
      <div className="hero-bg" ref={bg}>
        <video
          ref={video}
          className="hero-video"
          src={HERO_VIDEO}
          muted
          playsInline
          preload="auto"
          autoPlay={!SCRUB}
          loop={!SCRUB}
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="noisy hero-noise" />
      </div>

      <section id={SECTION_IDS.home} ref={root}>
        <img
          src={HERO_IMAGE}
          alt=""
          className="left-quart"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <DownArrows className="right-arrow" />

        <div className="hero-inner">
          <h1 className="sr-only">Red Ryan — UI/UX, game dev and scripts</h1>

          <div className="hero-main">
            <div className="hero-rows">
              <Word letters={HERO_RED_LETTERS} />
              <Word letters={HERO_RYAN_LETTERS} />
            </div>

            <p className="hero-statement hero-reveal">
              <span className="hero-statement-text">
                Defining is limiting, but here is what I do
              </span>
            </p>

            <div className="hero-cta">
              {HERO_ACTIONS.map(({ label, href, tone }) => (
                <a
                  key={href}
                  href={href}
                  className={`hero-btn hero-btn--${tone}`}
                  onClick={(e) => goTo(e, href)}
                >
                  <span>{label}</span>
                  <span aria-hidden="true">
                    <ArrowBigRight />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="hero-meta hero-reveal">
            <span className="hero-small">{HERO_PROFILE.location}</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
