import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(Draggable, InertiaPlugin, useGSAP);

/* ───────────── edit me ─────────────
   drop the logos in /public/images/skills/ (svg or png).
   Until a file exists, the label shows instead.                                */
const SKILLS = [
  { id: "unity", label: "Unity", src: "/images/skills/unity.svg" },
  { id: "js", label: "JavaScript", src: "/images/skills/js.svg" },
  { id: "r", label: "R", src: "/images/skills/r.svg" },
  { id: "react", label: "React", src: "/images/skills/react.svg" },
  { id: "csharp", label: "C#", src: "/images/skills/csharp.svg" },
  { id: "figma", label: "Figma", src: "/images/skills/figma.svg" },
  { id: "nextjs", label: "Next.js", src: "/images/skills/nextjs.svg" },
];

const STEP = 360 / SKILLS.length;

const Skills = ({ className = "" }) => {
  const ring = useRef(null);
  const name = useRef(null);

  useGSAP(
    () => {
      const el = ring.current;
      const items = gsap.utils.toArray(".skills-item", el);
      const n = SKILLS.length;

      // keep the logos upright while the ring turns, and highlight the one at the top
      const sync = (rot) => {
        el.style.setProperty("--spin", `${rot}deg`);
        const idx = ((-Math.round(rot / STEP) % n) + n) % n;
        items.forEach((item, i) =>
          item.classList.toggle("is-active", i === idx),
        );
        name.current.textContent = SKILLS[idx].label;
      };

      const [drag] = Draggable.create(el, {
        type: "rotation",
        inertia: true,
        snap: (end) => gsap.utils.snap(STEP, end),
        onDrag() {
          sync(this.rotation);
        },
        onThrowUpdate() {
          sync(this.rotation);
        },
      });

      sync(0);
      return () => drag.kill();
    },
    { scope: ring },
  );

  return (
    <div className={`skills ${className}`} role="group" aria-label="Skills">
      <div className="skills-ring" ref={ring}>
        <svg className="skills-path" viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="196" />
        </svg>

        {SKILLS.map(({ id, label, src }, i) => (
          <div
            key={id}
            className="skills-item"
            style={{ "--a": `${STEP * i}deg`, "--i": i }}
          >
            <div className="skills-badge" title={label}>
              <div className="skills-face">
                <span className="skills-fallback">{label}</span>
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="skills-center" aria-hidden="true">
        <p className="skills-name" ref={name}>
          {SKILLS[0].label}
        </p>
        <p className="skills-hint">[ Drag to spin ]</p>
      </div>

      <ul className="sr-only">
        {SKILLS.map(({ id, label }) => (
          <li key={id}>{label}</li>
        ))}
      </ul>
    </div>
  );
};

export default Skills;
