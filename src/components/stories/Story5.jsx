import { useLayoutEffect, useRef } from "react";
import {
  gsap,
  pinPage,
  reduceMotion,
  riseOnScroll,
  whenReady,
} from "./storyUtils";
import Stan from "../Stan";

const Story5 = () => {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (reduceMotion()) return;

    const ctx = gsap.context(() => {
      riseOnScroll(el, el.querySelectorAll(".story-rise"));
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
    <div className="story-beat story-beat--stan tone-dark" data-beat ref={root}>
      <h2 className="story-big story-rise">History has a sense of humour</h2>
      <figure className="story-stan-frame story-rise">
        <Stan />
      </figure>
    </div>
  );
};

export default Story5;
