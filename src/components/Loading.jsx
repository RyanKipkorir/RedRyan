import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const CLONES = 12;

/* Simple loading page: one animation only, the stacked "LOADING" clones.
   The car / hill / pulsing text from the old version are gone. */
const Loading = () => {
  const bgRef = useRef(null);
  const wordRef = useRef(null);

  useLayoutEffect(() => {
    const bg = bgRef.current;
    const word = wordRef.current;
    if (!bg || !word) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      for (let i = 0; i < CLONES; i++) {
        const clone1 = word.cloneNode(true);
        const clone2 = word.cloneNode(true);
        clone1.setAttribute("aria-hidden", "true");
        clone2.setAttribute("aria-hidden", "true");
        bg.prepend(clone1);
        bg.prepend(clone2);

        gsap
          .timeline({
            repeat: -1,
            onRepeat: () => {
              bg.append(clone1);
              bg.append(clone2);
            },
          })
          .fromTo(
            [clone1, clone2],
            { position: "absolute", scaleY: 0.7 },
            {
              duration: 4,
              y: (j) => (j % 2 ? 200 : -200),
              scaleY: 1.2,
              ease: "power3",
            },
          )
          .play((i / CLONES) * 4);
      }
    }, bg);

    return () => {
      ctx.revert();
      bg.replaceChildren(); // remove the clones (StrictMode / unmount)
    };
  }, []);

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex h-dvh w-full items-center justify-center overflow-hidden bg-black"
    >
      <div className="relative">
        <div ref={bgRef} className="absolute inset-0" />
        <div
          ref={wordRef}
          className="relative bg-black pt-[5px] font-mono text-[55px] leading-[60px] font-bold text-red shadow-[0_0_15px_#000]"
        >
          LOADING
        </div>
      </div>
    </div>
  );
};

export default Loading;
