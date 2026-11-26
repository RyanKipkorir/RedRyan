import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* the lines that fly toward you, one after another — edit freely */
const LINES = [
  { kicker: "School", text: "Multimedia University of Kenya" },
  { kicker: "Degree", text: "BSc Mathematics & Computer Science" },
  { kicker: "Focus", text: "Pure Mathematics" },
  { kicker: "Years", text: "2021 — 2025" },
];

/* viewport heights of scroll each line gets */
const PER_LINE = 0.8;

const School = () => {
  const stage = useRef(null);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const splits = [];
      const lines = gsap.utils.toArray(".school-line", el);

      /* one pinned screen; the video reaches its last frame as the pin lets go */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * LINES.length * PER_LINE,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 2,
        },
      });

      lines.forEach((line, i) => {
        const split = SplitText.create(line.querySelector(".school-text"), {
          type: "words",
          wordsClass: "school-word",
        });
        splits.push(split);

        const parts = [line.querySelector(".school-kicker"), ...split.words];
        const at = i * 2;

        /* comes toward you out of the distance */
        tl.fromTo(
          parts,
          { z: -1800, opacity: 0 },
          {
            z: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            stagger: 0.08,
          },
          at,
        );

        /* the last one stays; the others fly past you */
        if (i < lines.length - 1) {
          tl.to(
            parts,
            {
              z: 800,
              opacity: 0,
              duration: 0.6,
              ease: "power2.in",
              stagger: 0.04,
            },
            at + 1.7,
          );
        }
      });

      /* hold the last line while the video finishes */
      tl.to({}, { duration: 0.8 });

      return () => {
        splits.forEach((s) => s.revert());
      };
    });

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
    <section id="school">
      <div className="school-stage" ref={stage}>
        <h2 className="sr-only">School</h2>
        {LINES.map(({ kicker, text }) => (
          <div className="school-line" key={kicker}>
            <p className="school-kicker">{kicker}</p>
            <p className="school-text">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default School;
