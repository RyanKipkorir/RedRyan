import { useLayoutEffect, useRef, useState } from "react";
import {
  gsap,
  ScrollTrigger,
  pinPage,
  reduceMotion,
  riseOnScroll,
  whenReady,
} from "./storyUtils";
import Counter from "../Counter.jsx";
import Skills from "../Skills.jsx";
import { STORY_STARTED_YEAR, STORY_TOOLS } from "../../../constants/index.js";

const Story6 = () => {
  const root = useRef(null);
  const [showYears, setShowYears] = useState(false);

  const years = Math.max(1, new Date().getFullYear() - STORY_STARTED_YEAR);
  const yearsSize =
    typeof window !== "undefined" && window.innerWidth < 640 ? 96 : 160;

  useLayoutEffect(() => {
    const el = root.current;

    if (reduceMotion()) {
      setShowYears(true);
      return;
    }

    const ctx = gsap.context(() => {
      riseOnScroll(el, el.querySelectorAll(".story-rise"));

      /* the counter mounts when its block arrives, so its intro is seen */
      ScrollTrigger.create({
        trigger: el.querySelector(".story-years"),
        start: "top 85%",
        once: true,
        onEnter: () => setShowYears(true),
      });
    }, el);
    const cancelPin = whenReady(() => {
      ctx.add(() => pinPage(el));
    });

    return () => {
      cancelPin();
      ctx.revert();
    };
  }, []);

  return (
    <div
      className="story-beat story-beat--tools tone-dark"
      data-beat
      ref={root}
    >
      <div className="story-tools-lead">
        <p className="story-kicker story-rise">The toolbox</p>
        <h2 className="story-big story-rise">
          What I have been building with.
        </h2>

        <div className="story-years story-rise">
          <p className="story-kicker">For about</p>
          <div className="story-years-row">
            <div className="story-years-num" aria-label={`${years} years`}>
              {showYears && (
                <Counter
                  value={years}
                  fontSize={yearsSize}
                  fontWeight={600}
                  direction="auto"
                  duration={0.7}
                  bounce={0.2}
                  stagger={0.04}
                  fade={0.3}
                  gap={0}
                  decimals={0}
                  minDigits={2}
                  motionBlur
                  intro
                  tabular
                />
              )}
            </div>
            <p className="story-years-label">years</p>
          </div>
        </div>
      </div>

      <div className="story-side">
        <Skills className="story-rise" />
      </div>
    </div>
  );
};

export default Story6;
