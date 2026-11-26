import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(Draggable, InertiaPlugin, useGSAP);

const SKILLS = [
  { id: "unity", label: "Unity", src: "/images/skills/unity.png" },
  { id: "js", label: "JavaScript", src: "/images/skills/js.png" },
  { id: "rstudio", label: "R", src: "/images/skills/rstudio.png" },
  { id: "react", label: "React", src: "/images/skills/react.png" },
  { id: "csharp", label: "C#", src: "/images/skills/csharp.png" },
  { id: "figma", label: "Figma", src: "/images/skills/figma.png" },
  { id: "nextjs", label: "Next.js", src: "/images/skills/nextjs.png" },
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

      // Updates the highlighted skill
      const sync = (rot) => {
        if (!Number.isFinite(rot)) return;

        el.style.setProperty("--spin", `${rot}deg`);

        const idx = ((-Math.round(rot / STEP) % n) + n) % n;
        const skill = SKILLS[idx];
        if (!skill) return;

        items.forEach((item, i) =>
          item.classList.toggle("is-active", i === idx),
        );

        name.current.textContent = skill.label;
      };

      // Continuous automatic rotation
      const spin = gsap.to(el, {
        rotation: "+=360",
        duration: 50,
        ease: "none",
        repeat: -1,
        onUpdate() {
          sync(gsap.getProperty(el, "rotation"));
        },
      });

      // Drag interaction
      const [drag] = Draggable.create(el, {
        type: "rotation",
        inertia: true,
        snap: (end) => gsap.utils.snap(STEP, end),

        onPressInit() {
          spin.pause();
        },

        onDrag() {
          spin.progress((((this.rotation % 360) + 360) % 360) / 360);
          sync(this.rotation);
        },

        onThrowUpdate() {
          spin.progress((((this.rotation % 360) + 360) % 360) / 360);
          sync(this.rotation);
        },

        onThrowComplete() {
          spin.progress((((this.rotation % 360) + 360) % 360) / 360);

          // Resume automatic rotation smoothly
          spin.resume();

          gsap.fromTo(
            spin,
            { timeScale: 0 },
            {
              timeScale: 1,
              duration: 1,
              ease: "power1.in",
            },
          );
        },
      });

      sync(0);

      return () => {
        drag.kill();
        spin.kill();
      };
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
      </div>
    </div>
  );
};

export default Skills;
