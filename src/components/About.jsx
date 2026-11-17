import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import Picha from "../assets/pic.jpg";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

/* ───────────── edit me ───────────── */
const NAME = "Ryan Kipkorir";

const GREETING = ["H", "*", "l", "l", "o", ","];

const COLUMN_A = [
  "Mathematician by training, developer by habit. I studied pure mathematics and computer science at Multimedia University of Kenya, and I still treat every interface like a proof: start from the structure, then make it feel inevitable.",
  "I build trading platforms, dashboards and automation tools, and I prototype games in Unity when I need to think with my hands. Motion is where the two halves of my brain finally agree.",
];

const COLUMN_B = [
  "Lately I’ve been putting financial markets on a blockchain: co-founding NBX, a home for tokenized equities and bonds, and building frontend and game experiences with YStudios.",
  "Based in Nairobi. Always up for a conversation about interfaces, markets, or anything that moves.",
];

/* ───────────── SVG pieces ───────────── */
const Burst = ({ className = "" }) => {
  const spikes = 12;
  const points = Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 24;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points={points} fill="currentColor" />
    </svg>
  );
};

/* placeholder line-art portrait — swap for your own illustration */
const Portrait = () => <img src={Picha} className="about-portrait" />;

/* ───────────── component ───────────── */
const About = () => {
  const root = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Hero → About: content enters when the section scrolls into view (Duda slide pattern) */
        gsap
          .timeline({
            defaults: { ease: "power4" },
            scrollTrigger: { trigger: root.current, start: "top 55%" },
          })
          .from(".about-char", { yPercent: 115, duration: 2, stagger: 0.1 }, 0)
          .from(".about-intro", { x: -60, opacity: 0, duration: 1.6 }, 0.5)
          .from(".about-fullname", { x: -100, opacity: 0, duration: 2 }, 0.6)
          .from(
            ".about-col p",
            { x: 100, y: 50, opacity: 0, duration: 2, stagger: 0.15 },
            0.5,
          )
          .from(".about-portrait svg", { y: 100, opacity: 0, duration: 2 }, 0.7)
          .from(".about-top", { y: 200, duration: 3 }, 0.4);

        gsap.to(".about-star", {
          rotation: 360,
          duration: 16,
          repeat: -1,
          ease: "none",
        });

        /* parallax on the portrait */
        gsap.fromTo(
          ".about-portrait",
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  const goTop = contextSafe((e) => {
    e.preventDefault();
    gsap.to(window, {
      duration: 2,
      scrollTo: { y: "#hero" },
      ease: "power2.inOut",
    });
    gsap.to(".about-top-line", { scaleY: 1, duration: 0.6, ease: "power4" });
  });

  const lineIn = contextSafe(() =>
    gsap.to(".about-top-line", {
      scaleY: 3,
      transformOrigin: "bottom center",
      duration: 0.6,
      ease: "power4",
    }),
  );
  const lineOut = contextSafe(() =>
    gsap.to(".about-top-line", {
      scaleY: 1,
      transformOrigin: "bottom center",
      duration: 0.6,
      ease: "power4",
    }),
  );

  return (
    <section id="about" ref={root}>
      <div className="about-inner">
        <h2 className="about-greeting" aria-label="Hello,">
          {GREETING.map((ch, i) => (
            <span key={i} className="about-mask" aria-hidden="true">
              <span className="about-char">
                {ch === "*" ? <Burst className="about-star" /> : ch}
              </span>
            </span>
          ))}
        </h2>

        <div className="about-name">
          <p className="about-intro">my name is</p>
          <p className="about-fullname">{NAME}.</p>
        </div>

        <figure className="about-portrait">
          <Portrait />
        </figure>

        <div className="about-col about-col--a">
          {COLUMN_A.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>

        <div className="about-col about-col--b">
          {COLUMN_B.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>

        <a
          href="#hero"
          className="about-top"
          onClick={goTop}
          onMouseEnter={lineIn}
          onMouseLeave={lineOut}
        >
          Top ↑<span className="about-top-line" />
        </a>
      </div>
    </section>
  );
};

export default About;
