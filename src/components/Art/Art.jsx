import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/* ════════════════════════════════════════════════════════════════════
   ART: the moving parts that live inside the Tools grid cells.
   Every piece fills its parent (the cell must be position: relative),
   sizes itself to that cell, pauses while off screen, and holds still
   under prefers-reduced-motion.  Hover = faster, click = from the top.

   <Pattern />   rotated bands of one word, red + blue inks that multiply
   <Random />    the same letters, spiralling, gridded, scattered, reformed
   <Question />  a few masked lines of type that rise in once

   Adding a piece later: build it here, add it to ART, then use
   <Art piece="name" /> or import it by name.
   ════════════════════════════════════════════════════════════════════ */

/* ───────────── helpers ───────────── */

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* a piece only plays while it is on screen (Random moves hundreds of letters) */
const playWhileVisible = (el, tl) => {
  tl.pause();
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? tl.play() : tl.pause()),
    { threshold: 0.05 },
  );
  io.observe(el);
  return () => io.disconnect();
};

/* hover speeds the timeline up, click plays it again from the top */
const useTempo = () => {
  const tl = useRef(null);
  const handlers = {
    onClick: () => tl.current?.restart(),
    onPointerEnter: () =>
      tl.current &&
      gsap.to(tl.current, { timeScale: 2.5, duration: 0.5, overwrite: true }),
    onPointerLeave: () =>
      tl.current &&
      gsap.to(tl.current, { timeScale: 1, duration: 0.5, overwrite: true }),
  };
  return [tl, handlers];
};

const Chars = ({ text }) => (
  <>
    {[...text].map((c, i) => (
      <span className="art-char" key={i}>
        {c}
      </span>
    ))}
  </>
);

/* ════════════════════════ PATTERN ════════════════════════
   Port of the "adolescents" poster. Rows of one word, rotated; each row
   holds a red and a blue copy offset by a hair, so they multiply into a
   darker third colour where they overlap.
   word      what the rows say
   rows      how many rows (more = covers a taller or narrower cell)
   repeat    how many times the word repeats inside one row
   captions  optional [[line1, line2], ...] set small along the bottom   */

/* one row is 0.76em tall, its mask is 0.89em: shift by the ratio */
const BAND_SHIFT = -85.4;

export const Pattern = ({
  word = "Pattern",
  rows = 14,
  repeat = 2,
  captions = [],
  className = "",
}) => {
  const root = useRef(null);
  const [tempo, handlers] = useTempo();
  const text = Array(repeat).fill(word).join("\u00a0");

  useLayoutEffect(() => {
    const el = root.current;
    if (reduceMotion()) return;

    const q = gsap.utils.selector(el);
    let stop;

    const ctx = gsap.context(() => {
      const names = q(".art-pattern__names");

      /* intro: every row slides in from alternating sides */
      const intro = gsap.timeline({
        defaults: { duration: 2, ease: "power4" },
      });
      intro.from(names, {
        xPercent: (i) => (i % 2 ? -110 : 110),
        stagger: 0.15,
      });
      if (captions.length) {
        intro.from(
          q(".art-pattern__caption span"),
          { yPercent: 130, stagger: 0.1 },
          2,
        );
      }

      /* loop: the rows climb one place, the last row types itself back in,
         and two blue rows glitch the other way */
      const loop = gsap.timeline({ repeat: -1 });
      loop
        .to(names, { yPercent: BAND_SHIFT, duration: 5, ease: "none" })
        .from(
          q(".art-pattern__band--end .art-pattern__name--red .art-char"),
          { yPercent: 130, duration: 3, ease: "power4", stagger: 0.05 },
          1,
        )
        .from(
          q(".art-pattern__band--end .art-pattern__name--blue .art-char"),
          { yPercent: 130, duration: 3, ease: "power4", stagger: 0.05 },
          1.3,
        );
      if (rows > 5) {
        loop
          .from(
            q('[data-row="4"] .art-pattern__name--blue .art-char'),
            {
              yPercent: -130,
              duration: 2,
              ease: "power4.inOut",
              stagger: -0.05,
            },
            0,
          )
          .to(
            q('[data-row="5"] .art-pattern__name--blue .art-char'),
            {
              yPercent: 130,
              duration: 2,
              ease: "power4.inOut",
              stagger: -0.05,
            },
            0,
          );
      }

      const master = gsap.timeline({ delay: 0.4 });
      master.add(intro).add(loop, 0);

      tempo.current = master;
      stop = playWhileVisible(el, master);
    }, el);

    return () => {
      stop?.();
      ctx.revert();
      tempo.current = null;
    };
  }, [word, rows, repeat, captions.length]);

  return (
    <div
      ref={root}
      className={`art art-pattern ${className}`.trim()}
      role="img"
      aria-label={word}
      {...handlers}
    >
      <div className="art-pattern__content" aria-hidden="true">
        {Array.from({ length: rows }, (_, r) => (
          <div
            key={r}
            className={`art-pattern__band${
              r === rows - 1 ? " art-pattern__band--end" : ""
            }`}
            data-row={r}
          >
            <span className="art-pattern__names">
              <span className="art-pattern__name art-pattern__name--red">
                <Chars text={text} />
              </span>
              <span className="art-pattern__name art-pattern__name--blue">
                <Chars text={text} />
              </span>
            </span>
          </div>
        ))}
      </div>

      {captions.map(([a, b], i) => (
        <p
          key={i}
          className="art-pattern__caption"
          style={{ left: `${3.5 + (i * 92) / captions.length}%` }}
          aria-hidden="true"
        >
          <span>{a}</span>
          <span>{b}</span>
        </p>
      ))}
    </div>
  );
};

/* ════════════════════════ RANDOM ════════════════════════
   Port of the "modulofont" piece. One word repeated into hundreds of
   letters that all start stacked in the centre, then: spiral out,
   snap to a grid, scatter, spiral again, spin the whole field, and
   fall back into the word. Everything is measured from the cell, and
   the scatter is re-rolled on every loop.
   word     the letters
   count    how many letters in total (more = denser, heavier)           */

export const Random = ({ word = "Random", count = 360, className = "" }) => {
  const root = useRef(null);
  const [tempo, handlers] = useTempo();
  const total = Math.max(count, word.length);

  useLayoutEffect(() => {
    const el = root.current;
    const len = word.length;
    let ctx;
    let stop;
    let timer;
    let last = [0, 0];

    const build = () => {
      stop?.();
      ctx?.revert();
      tempo.current = null;

      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      last = [w, h];

      ctx = gsap.context(() => {
        const field = el.querySelector(".art-random__field");
        const chars = Array.from(el.querySelectorAll(".art-random__char"));
        const seeds = chars.slice(0, len); /* the first word stays visible */
        const rest = chars.slice(len);
        const n = chars.length;

        /* a tidy grid for this cell, and a font that fits it */
        const cols = Math.max(6, Math.round(Math.sqrt((n * w) / h)));
        const rows = Math.ceil(n / cols);
        const cw = w / cols;
        const ch = h / rows;
        const fs = Math.max(9, Math.min(cw / 0.62, ch) * 0.92);
        const R = Math.min(w, h) * 0.46;
        el.style.setProperty("--art-fs", `${fs}px`);

        const wordX = (i) => ((i % len) - (len - 1) / 2) * fs * 0.62;
        const gridX = (i) => (i % cols) * cw - w / 2 + cw / 2;
        const gridY = (i) => Math.floor(i / cols) * ch - h / 2 + ch / 2;
        const ringX = (grow) => (i) =>
          ((i / n) * R * grow + 6) * Math.cos(i * 5);
        const ringY = (grow) => (i) =>
          ((i / n) * R * grow + 6) * Math.sin(i * 5);
        const reach = (i) => (0.4 + i / n) * w;

        /* resting state: the word, in a line, in the middle */
        gsap.set(seeds, { x: wordX, y: 0, opacity: 1 });
        gsap.set(rest, { x: wordX, y: 0, opacity: 0 });

        if (reduceMotion()) return;

        const tl = gsap.timeline({
          repeat: -1,
          repeatRefresh: true /* new scatter every loop */,
          delay: 0.6,
        });

        tl.set(field, { opacity: 1, rotation: 0 })
          .set(chars, { opacity: 0 })
          /* 1. spiral out from the word */
          .to(chars, {
            opacity: 1,
            x: ringX(1),
            y: ringY(1),
            scale: (i) => 0.6 + (i / n) * 0.8,
            ease: "elastic.out(1.2,0.5)",
            duration: 3,
            stagger: 0.005,
          })
          /* 2. snap to the grid: the word repeats into stripes */
          .to(
            chars,
            {
              x: gridX,
              y: gridY,
              scale: (i) => 1 + (i / n) * 0.4,
              ease: "power2",
              duration: 3,
              stagger: -0.01,
            },
            "-=0.5",
          )
          /* 3. scatter, spinning */
          .to(
            chars,
            {
              x: (i) => gridX(i) + gsap.utils.random(-reach(i), reach(i), 5),
              y: (i) =>
                gridY(i) +
                gsap.utils.random(-reach(i) * 0.6, reach(i) * 0.6, 5),
              rotate: "+=360",
              ease: "power1.inOut",
              duration: 3,
              stagger: 0.005,
            },
            "+=1",
          )
          /* 4. a wider spiral */
          .to(
            chars,
            {
              x: ringX(1.2),
              y: ringY(1.2),
              scale: (i) => 0.6 + (i / n) * 0.8,
              ease: "power4.out",
              duration: 3,
              stagger: 0.005,
            },
            "+=0.1",
          )
          /* 5. the whole field turns once */
          .to(field, {
            rotation: 360,
            ease: "power2.in",
            duration: 6,
            onComplete: () => gsap.set(rest, { opacity: 0 }),
          })
          /* 6. every letter falls back into the word */
          .to(
            chars,
            {
              x: wordX,
              y: 0,
              scale: 1,
              ease: "elastic",
              duration: 3,
              stagger: 0.005,
            },
            "-=5.5",
          )
          /* 7. hold, then fade for the next loop */
          .to(field, { opacity: 0, duration: 1 }, "+=2");

        tempo.current = tl;
        stop = playWhileVisible(el, tl);
      }, el);
    };

    build();

    /* rebuild when the cell changes size (the maths is in pixels) */
    const ro = new ResizeObserver(() => {
      if (
        Math.abs(el.clientWidth - last[0]) < 24 &&
        Math.abs(el.clientHeight - last[1]) < 24
      ) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(build, 250);
    });
    ro.observe(el);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      stop?.();
      ctx?.revert();
      tempo.current = null;
    };
  }, [word, total]);

  return (
    <div
      ref={root}
      className={`art art-random ${className}`.trim()}
      role="img"
      aria-label={word}
      {...handlers}
    >
      <div className="art-random__field" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`art-random__char${i < word.length ? " is-seed" : ""}`}
          >
            {word[i % word.length]}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════ QUESTION ════════════════════════
   A few lines of display type, each in its own mask, rising in once
   when the cell scrolls into view.
   lines   one string per line                                          */

export const Question = ({
  lines = ["Have you", "noticed", "the"],
  className = "",
}) => {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (reduceMotion()) return;

    let io;
    const ctx = gsap.context(() => {
      const rise = gsap.from(
        el.querySelectorAll(".art-question__line > span"),
        {
          yPercent: 115,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.12,
          paused: true,
        },
      );

      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          rise.play();
          io.disconnect();
        },
        { threshold: 0.3 },
      );
      io.observe(el);
    }, el);

    return () => {
      io?.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <p ref={root} className={`art-question ${className}`.trim()}>
      {lines.map((line, i) => (
        <span className="art-question__line" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </p>
  );
};

/* ───────────── registry ───────────── */

export const ART = { pattern: Pattern, random: Random };

const Art = ({ piece = "pattern", ...props }) => {
  const Piece = ART[piece];
  return Piece ? <Piece {...props} /> : null;
};

export default Art;
