import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import FlipCard from "./FlipCard";
import Counter from "./Counter";

gsap.registerPlugin(ScrambleTextPlugin);

/* ───────────── edit me ───────────── */
// Jan Matejko, "Stańczyk" (1862), National Museum in Warsaw. Public domain.
// Tip: save it to /public/images/stanczyk.jpg and point IMAGE there instead of hotlinking.
const IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Jan_Matejko,_Sta%C5%84czyk.jpg?width=1200";

// October 30th, 2026 at 18:00 East Africa Time (UTC+3)
const SUSPENDED_AT = new Date("2026-10-30T18:00:00+03:00");
const SUSPENDED_LABEL = "Oct 30, 2026 · 18:00 EAT";

const daysSince = () =>
  Math.max(0, Math.floor((Date.now() - SUSPENDED_AT.getTime()) / 86400000));

const SCRAMBLE_CHARS = "01<>/\\{}[]=+*#%&?";

/* ───────────── component ───────────── */
const Stan = ({ className = "" }) => {
  const [days, setDays] = useState(daysSince);
  const [flipped, setFlipped] = useState(false);
  const word = useRef(null);

  // live: re-checked every minute, rolls over at 18:00 EAT
  useEffect(() => {
    const id = setInterval(() => setDays(daysSince()), 60000);
    return () => clearInterval(id);
  }, []);

  // Smolensk <-> his GitHub account, scrambled, every time the card flips
  const onFlipChange = (isFlipped) => {
    setFlipped(isFlipped);

    const text = isFlipped ? "his GitHub account" : "Smolensk";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      word.current.textContent = text;
      return;
    }
    gsap.to(word.current, {
      duration: 1.2,
      overwrite: true,
      scrambleText: {
        text,
        chars: SCRAMBLE_CHARS,
        speed: 0.6,
        revealDelay: 0.1,
      },
    });
  };

  const size =
    typeof window !== "undefined" && window.innerWidth < 480 ? 260 : 320;
  const counterSize = size < 300 ? 92 : 110;

  return (
    <div className={`stan ${className}`}>
      <FlipCard
        front={
          <img
            className="stan-img"
            src={IMAGE}
            alt="Stańczyk, a painting by Jan Matejko, 1862"
            draggable={false}
          />
        }
        back={
          <div
            className="stan-back"
            role="timer"
            aria-label={`${days} days since GitHub suspended the account`}
          >
            <p className="stan-tag">
              <span className="story-live" aria-hidden="true" /> [ Days
              suspended from GitHub ]
            </p>

            {/* mounts on flip, so its intro animation plays when you see it */}
            <div className="stan-num">
              {flipped && (
                <Counter
                  value={days}
                  fontSize={counterSize}
                  fontWeight={600}
                  direction="auto"
                  duration={0.7}
                  bounce={0.2}
                  stagger={0.04}
                  fade={0.3}
                  gap={0}
                  decimals={0}
                  minDigits={3}
                  motionBlur
                  intro
                  tabular
                />
              )}
            </div>

            <p className="stan-since">since {SUSPENDED_LABEL}</p>
          </div>
        }
        axis="y"
        flipOnClick
        draggable
        dragDistance={0}
        tilt
        tiltMax={12}
        glare
        glareOpacity={0.22}
        hoverScale={1.03}
        perspective={1100}
        stiffness={170}
        damping={20}
        width={size}
        height={size}
        radius={22}
        background="#111314"
        color="#f5f5f5"
        shadow
        shadowColor="#ff0000"
        shadowOpacity={0.45}
        onFlipChange={onFlipChange}
      />

      <p className="stan-title">
        {" "}
        Stańczyk at the ball of Queen Bona,
        <br /> in the face of the loss of{" "}
        <span ref={word} className="stan-scramble ">
          Smolensk
        </span>
      </p>

      {/* bottom right: the sentence + credit */}
      <p className="stan-credit">
        <small>
          Painting by{" "}
          <a
            href="https://en.wikipedia.org/wiki/Jan_Matejko"
            target="_blank"
            rel="noreferrer"
          >
            Jan Matejko
          </a>
          , 1862 ·{" "}
        </small>
      </p>
    </div>
  );
};

export default Stan;
