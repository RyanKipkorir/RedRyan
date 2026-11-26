import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ToolsDial from "./ToolsDial";
import Stan from "./Stan";
import { Pattern, Random } from "./Art/Art";

gsap.registerPlugin(ScrollTrigger);

/* what the marquee says, flowing to the right */
const WHAT_I_DO = ["Websites", "Games", "Films", "Motion Design", "UI/UX"];

const NAPOLEON = {
  kicker: "02 · The craft",
  title: "Napoleon Crossing the Alps",
  by: "Jacques-Louis David, 1801",
  text: "I build games, websites and animations, and I write film scripts.",
  src: "/images/napoleon.jpg",
  alt: "Napoleon Crossing the Alps by Jacques-Louis David",
};

const STANCZYK = {
  kicker: "03 · The ban",
  title: "History repeats itself.",
  by: "Stańczyk by Jan Matejko, 1862",
  paragraphs: [
    "Matejko painted the court jester sitting out a ball while the news of Smolensk’s fall sinks in. The music plays on. He is the only one in the room who understands what just happened.",
    "Different century, same room. On October 30 GitHub suspended my account while I was shipping an APK with a local AI and a self-custodial wallet. The party carried on and I sat it out, like the jester. The room changes, the jester’s chair doesn’t.",
  ],
};

const ArrowUpRight = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

/* one full pass of the marquee; two of them side by side make the loop seamless */
const MarqueeGroup = () => (
  <div className="bento-marquee__group">
    {WHAT_I_DO.map((item) => (
      <span key={item} className="bento-marquee__item">
        {item}
        <i className="bento-sep" />
      </span>
    ))}
  </div>
);

const Tools = () => {
  const sectionRef = useRef(null);
  const bentoRef = useRef(null);
  const stanRef = useRef(null);

  useLayoutEffect(() => {
    const root = sectionRef.current;
    const bentoEl = bentoRef.current;
    const stanEl = stanRef.current;
    if (!root || !bentoEl || !stanEl) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const napoleon = bentoEl.querySelector(".bento-card--napoleon");
      const napoleonImg = bentoEl.querySelector(".bento-napoleon__img");
      const napoleonText = gsap.utils.toArray(".bento-reveal", napoleon);
      const marqueeCard = bentoEl.querySelector(".bento-card--marquee");
      const track = bentoEl.querySelector(".bento-marquee__track");
      const artCards = gsap.utils.toArray(
        ".bento-card--pattern, .bento-card--random",
        bentoEl,
      );

      /* ── the marquee: flows to the right on its own, eases down on hover,
            and rests while it is off screen ── */
      const drift = gsap.fromTo(
        track,
        { xPercent: -50 },
        { xPercent: 0, duration: 24, ease: "none", repeat: -1 },
      );
      const slow = () =>
        gsap.to(drift, { timeScale: 0.2, duration: 0.5, overwrite: true });
      const normal = () =>
        gsap.to(drift, { timeScale: 1, duration: 0.5, overwrite: true });
      marqueeCard.addEventListener("pointerenter", slow);
      marqueeCard.addEventListener("pointerleave", normal);

      ScrollTrigger.create({
        trigger: marqueeCard,
        onToggle: (self) => (self.isActive ? drift.play() : drift.pause()),
      });

      /* ── the rise: the dial has faded out and let go, then the full-width
            bento climbs up from the bottom edge of the screen like a curtain.
            Napoleon first, then the marquee, then Pattern and Random ── */
      const closed = "inset(100% 0% 0% 0% round 24px)";
      const open = "inset(0% 0% 0% 0% round 24px)";
      const cards = [napoleon, marqueeCard, ...artCards];

      gsap.set(cards, { clipPath: closed, y: 120 });
      gsap.set(napoleonImg, { scale: 1.25 });
      gsap.set(napoleonText, { autoAlpha: 0, y: 26 });

      gsap
        .timeline({
          defaults: { ease: "power4.out" },
          scrollTrigger: {
            trigger: bentoEl,
            start: "top 88%",
            once: true,
          },
        })
        .to(
          napoleon,
          { clipPath: open, y: 0, duration: 1.3, clearProps: "clipPath" },
          0,
        )
        .to(napoleonImg, { scale: 1, duration: 1.8 }, 0)
        .to(
          marqueeCard,
          { clipPath: open, y: 0, duration: 1.2, clearProps: "clipPath" },
          0.2,
        )
        .to(
          artCards,
          {
            clipPath: open,
            y: 0,
            duration: 1.2,
            stagger: 0.14,
            clearProps: "clipPath",
          },
          0.4,
        )
        .to(
          napoleonText,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
          },
          0.8,
        );

      /* ── Stan: two halves, exposed a little earlier ── */
      const stanHalf = stanEl.querySelector(".stan-split__media");
      const stanCopy = stanEl.querySelector(".stan-split__copy");

      gsap.from([stanHalf, stanCopy], {
        opacity: 0,
        y: 28,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: stanEl,
          start: "top 85%",
          once: true,
        },
      });

      return () => {
        marqueeCard.removeEventListener("pointerenter", slow);
        marqueeCard.removeEventListener("pointerleave", normal);
      };
    });

    /* reduced motion: nothing is hidden, the marquee stands still,
       and Art.jsx already holds its own pieces still */

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tools"
      className="tools"
      aria-labelledby="tools-heading"
    >
      <div className="tools-banner tone-red">
        <h2 id="tools-heading" className="tools-banner__title">
          Tools
        </h2>
      </div>

      <div className="paintings-world">
        {/* 01 · the dial, one screen tall, pinned while the tools turn */}
        <ToolsDial />

        {/* 02 · Napoleon: the full-width bento that rises once the dial is gone.
            Napoleon on the right, what I do flowing across the top left,
            Pattern and Random underneath */}
        <section
          ref={bentoRef}
          className="bento-wrap min-h-screen"
          aria-label={NAPOLEON.title}
        >
          <div className="bento">
            <article className="bento-card bento-card--napoleon">
              <img
                className="bento-napoleon__img"
                src={NAPOLEON.src}
                alt={NAPOLEON.alt}
                loading="lazy"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="bento-napoleon__shade" aria-hidden="true" />

              <div className="bento-card__top bento-reveal">
                <span className="bento-label">{NAPOLEON.kicker}</span>
                <span className="bento-arrow">
                  <ArrowUpRight />
                </span>
              </div>

              <div className="bento-napoleon__copy">
                <h3 className="bento-napoleon__title bento-reveal">
                  {NAPOLEON.title}
                </h3>
                <p className="bento-napoleon__text bento-reveal">
                  {NAPOLEON.text}
                </p>
                <span className="bento-pill bento-reveal">{NAPOLEON.by}</span>
              </div>
            </article>

            <article className="bento-card bento-card--marquee">
              <div className="bento-card__top">
                <span className="bento-label">What I do</span>
                <span className="bento-arrow">
                  <ArrowUpRight />
                </span>
              </div>

              <ul className="sr-only">
                {WHAT_I_DO.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="bento-marquee" aria-hidden="true">
                <div className="bento-marquee__track">
                  <MarqueeGroup />
                  <MarqueeGroup />
                </div>
              </div>
            </article>

            <article className="bento-card bento-card--pattern">
              <Pattern word="Pattern" rows={16} />
              <span className="bento-tag">Pattern</span>
            </article>

            <article className="bento-card bento-card--random">
              <Random word="Random" />
              <span className="bento-tag">Random</span>
            </article>
          </div>
        </section>

        {/* 03 · Stańczyk split into two halves: Stan on the left, history on the right */}
        <section
          ref={stanRef}
          className="stan-split-wrap min-h-screen"
          aria-label={STANCZYK.title}
        >
          <div className="stan-split">
            <div className="stan-split__media">
              <Stan />
            </div>

            <div className="stan-split__copy">
              <span className="craft-kicker">{STANCZYK.kicker}</span>
              <h3 className="stan-split__heading">{STANCZYK.title}</h3>
              <p className="stan-split__by">{STANCZYK.by}</p>
              {STANCZYK.paragraphs.map((p) => (
                <p key={p} className="stan-split__text">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Tools;
