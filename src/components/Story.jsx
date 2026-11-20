import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, reduceMotion } from "./stories/storyUtils.js";

import EyeArt from "./Art/EyeArt.jsx";
import ShapeOverlay from "./ShapeOverlay";
import Story1 from "./stories/Story1.jsx";
import Story2 from "./stories/Story2.jsx";
import Story3 from "./stories/Story3.jsx";
import Story4 from "./stories/Story4.jsx";
import StorySwap from "./stories/StorySwap.jsx";
import Story5 from "./stories/Story5.jsx";
import Story6 from "./stories/Story6.jsx";
import { SECTION_IDS } from "../../constants/index.js";

const Story = () => {
  const root = useRef(null);
  const wipe = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;

    const ctx = gsap.context(() => {
      /* the plus: fixed at the right edge while you move through the beats (desktop only) */
      if (!reduceMotion()) {
        const mq = window.matchMedia("(min-width: 1024px)");
        if (mq.matches) {
          const beats = el.querySelectorAll("[data-beat]");
          const plusBox = el.querySelector(".story-plus");
          const plusSvg = el.querySelector(".story-plus-svg");

          gsap
            .timeline({
              scrollTrigger: {
                scrub: 1,
                trigger: beats[1],
                start: "top center",
                endTrigger: beats[beats.length - 1],
                end: "bottom 50%",
                onToggle: (self) =>
                  gsap.to(plusBox, {
                    autoAlpha: self.isActive ? 1 : 0,
                    duration: 0.4,
                    overwrite: true,
                  }),
              },
            })
            .to(plusSvg, { rotateZ: 900, ease: "none" });
        }
      }
    }, el);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  return (
    <section id={SECTION_IDS.about} ref={root}>
      <ShapeOverlay ref={wipe} colors={["#000000", "#ff0000"]} />

      <div className="story-plus" aria-hidden="true">
        <svg className="story-plus-svg" viewBox="0 0 100 100">
          <path d="M38 4H62V38H96V62H62V96H38V62H4V38H38Z" />
        </svg>
      </div>

      <Story1 wipe={wipe} />
      <Story2 />

      <Story3 />
      <Story4 />
      <StorySwap />
      <Story5 />
      <Story6 />
    </section>
  );
};

export default Story;
