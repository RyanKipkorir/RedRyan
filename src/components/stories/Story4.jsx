import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, reduceMotion, riseOnScroll, whenReady } from "./storyUtils";
import { STORY_FLOW } from "../../../constants/index.js";

/* wave grid, same maths as the original three.js demo, tuned for a section */
const SEPARATION = 70;
const AMOUNTX = 24;
const AMOUNTY = 18;

const Story4 = () => {
  const root = useRef(null);
  const canvas = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    const still = reduceMotion();

    /* ---------- red dots on black: the particle wave ---------- */
    const renderer = new THREE.WebGLRenderer({
      canvas: cv,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
    camera.position.set(0, 300, 1000);
    camera.lookAt(0, 0, 0);

    const count = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    let k = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++, k++) {
        positions[k * 3] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[k * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float size;
        uniform float uPixelRatio;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (1000.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
      `,
      transparent: true,
    });

    scene.add(new THREE.Points(geometry, material));

    const resize = () => {
      const w = el.clientWidth;
      const h = Math.max(el.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    /* writes the wave into the buffers for time t, then draws */
    let t = 0;
    const draw = () => {
      let n = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++, n++) {
          const a = Math.sin((ix + t) * 0.3);
          const b = Math.sin((iy + t) * 0.5);
          positions[n * 3 + 1] = (a + b) * 50;
          sizes[n] = (a + 1) * 2.5 + (b + 1) * 2.5;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
      renderer.render(scene, camera);
    };

    let raf = 0;
    const loop = () => {
      t += 0.1;
      draw();
      raf = requestAnimationFrame(loop);
    };

    /* only animate while the beat is on screen */
    const io = new IntersectionObserver(([entry]) => {
      if (still) return;
      if (entry.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);

    if (still) draw();

    /* ---------- copy: the kicker rises in on arrival ---------- */
    const ctx = gsap.context(() => {
      riseOnScroll(el, el.querySelectorAll(".story-rise"));
    }, el);

    /* ---------- the pin: created in page order, after the fonts load ---------- */
    const cancel = whenReady(() => {
      if (still) return;

      ctx.add(() => {
        const list = el.querySelector(".story-flow-list");
        const rows = gsap.utils.toArray("li", list);
        const travel = () => Math.max(0, list.scrollHeight - el.clientHeight);

        const light = () => {
          const box = el.getBoundingClientRect();
          const mid = box.top + box.height / 2;
          rows.forEach((li) => {
            const r = li.getBoundingClientRect();
            const d = Math.min(
              1,
              Math.abs(r.top + r.height / 2 - mid) / (box.height * 0.34),
            );
            gsap.set(li, { opacity: 0.2 + 0.8 * (1 - d), x: (1 - d) * 28 });
          });
        };

        gsap.fromTo(
          list,
          { y: 0 },
          {
            y: () => -travel(),
            ease: "none",
            onUpdate: light,
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: () => "+=" + travel(),
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefresh: light,
            },
          },
        );
        light();

        gsap.from(el.querySelectorAll(".story-line-in"), {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top top", once: true },
        });
      });
    });

    return () => {
      cancel();
      ctx.revert();
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="story-flow tone-dark" data-beat ref={root}>
      <canvas ref={canvas} className="story-particles" aria-hidden="true" />

      <div className="story-flow-stage">
        <p className="story-kicker story-flow-kicker story-rise">What I do</p>
        <ul className="story-flow-list">
          {STORY_FLOW.map((line) => (
            <li key={line}>
              <span className="story-line-in">{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Story4;
