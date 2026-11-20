import { useLayoutEffect, useRef } from "react";
import {
  gsap,
  SplitText,
  reduceMotion,
  rand,
  riseOnScroll,
  whenReady,
} from "./storyUtils";
import EyeArt from "../Art/EyeArt";

const Story2 = () => {
  const root = useRef(null);
  const line = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    const text = line.current;

    const ctx = gsap.context(() => {
      riseOnScroll(el, el.querySelectorAll(".story-rise"));
    }, el);

    if (reduceMotion()) return () => ctx.revert();

    let split = null;

    const cancel = whenReady(() => {
      ctx.add(() => {
        split = SplitText.create(text, { type: "chars, words" });
        const words = split.words;
        const chars = split.chars;

        /* 1. the sentence slides across a pinned screen */
        const slide = gsap.to(text, {
          xPercent: -100,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            pin: true,
            start: "top top",
            end: () => "+=" + text.offsetWidth,
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

        /* 3. the 3D word intro, plays once as the section arrives */
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
      });
    });

    return () => {
      cancel();
      ctx.revert();
      split?.revert();
    };
  }, []);

  return (
    <div className="story-hscroll tone-red" data-beat ref={root}>
      <div className="story-hscroll-head">
        <p className="story-kicker story-rise">Hi, I’m Ryan</p>
        <h2 className="story-big story-rise">A Creative developer</h2>
      </div>

      <p className="story-hscroll-text" ref={line}>
        , fascinated by the intersection of <strong>math</strong>,{" "}
        <strong>motion</strong> and <strong>visual storytelling</strong>.
        <EyeArt />
      </p>
    </div>
  );
};

export default Story2;
