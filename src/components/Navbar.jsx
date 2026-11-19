import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import { navLinks, NAV_ANIMATION, NAV_FOOT } from "../../constants/index.js";

/* jump to a section. A section pinned by ScrollTrigger is measured by its
   pin-spacer, which stays where the section started. */
const goTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const spot = el.parentElement?.classList.contains("pin-spacer")
    ? el.parentElement
    : el;
  window.scrollTo({
    top: spot.getBoundingClientRect().top + window.scrollY,
    behavior: "instant",
  });
};

const Navbar = () => {
  const bar = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    const REDUCED = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const html = document.documentElement;

    const burger = bar.current.querySelector("[data-burger]");
    const label = burger.querySelector("[data-name]");
    const wordOpen = burger.querySelector("[data-word-open]");
    const wordClose = burger.querySelector("[data-word-close]");
    const lines = [...burger.querySelectorAll("[data-line]")];

    const menu = menuRef.current;
    const list = menu.querySelector("[data-links]");
    const links = [...menu.querySelectorAll("[data-link]")];
    const masks = links.map((l) => l.querySelector(".menu-mask"));
    const words = links.map((l) => l.querySelector("[data-rise]"));
    const arrows = links.map((l) => l.querySelector(".menu-arrow"));
    const paths = arrows.map((a) => a.querySelector("path"));
    const foot = menu.querySelector("[data-foot]");

    const off = [];
    const on = (target, type, fn) => {
      target.addEventListener(type, fn);
      off.push(() => target.removeEventListener(type, fn));
    };

    /* the arrows draw themselves: a dash as long as the line, pushed out of sight */
    const ARROW = paths[0].getTotalLength();
    gsap.set(paths, { strokeDasharray: ARROW, strokeDashoffset: ARROW });
    gsap.set(wordClose, { yPercent: 100 });
    menu.inert = true;

    /* the circle: its radius is a number, its centre the middle of the button */
    const reveal = { r: 0 };
    let centre = { x: 0, y: 0, far: 0 };
    const measure = () => {
      const b = burger.getBoundingClientRect();
      const x = b.left + b.width / 2;
      const y = b.top + b.height / 2;
      centre = {
        x,
        y,
        far:
          Math.hypot(
            Math.max(x, innerWidth - x),
            Math.max(y, innerHeight - y),
          ) + 2,
      };
    };
    const draw = () => {
      menu.style.clipPath = `circle(${reveal.r.toFixed(1)}px at ${centre.x.toFixed(1)}px ${centre.y.toFixed(1)}px)`;
    };
    measure();
    if (!REDUCED) draw();

    let open = false;
    let tl = null;
    let here = null;

    /* opened with the keyboard? only then does focus move into the menu */
    let keys = false;
    on(burger, "pointerdown", () => (keys = false));
    on(burger, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") keys = true;
    });

    /* the button: white or red, lines crossed or apart, Menu or Close */
    const setButton = (isOpen) => {
      burger.classList.toggle("is-open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      label.textContent = isOpen ? "Close the menu" : "Open the menu";
      const [a, b] = lines;
      gsap.killTweensOf([a, b, wordOpen, wordClose]);

      if (REDUCED) {
        gsap.set(a, { y: isOpen ? 5 : 0, rotation: isOpen ? 45 : 0 });
        gsap.set(b, { y: isOpen ? -5 : 0, rotation: isOpen ? -45 : 0 });
        gsap.set(wordOpen, { yPercent: isOpen ? -100 : 0 });
        gsap.set(wordClose, { yPercent: isOpen ? 0 : 100 });
        return;
      }

      gsap.to(wordOpen, {
        yPercent: isOpen ? -100 : 0,
        duration: 0.5,
        ease: "power3.inOut",
      });
      gsap.to(wordClose, {
        yPercent: isOpen ? 0 : 100,
        duration: 0.5,
        ease: "power3.inOut",
      });

      /* the lines meet in the middle, then cross; back again, they straighten, then part */
      const t = gsap.timeline();
      if (isOpen) {
        t.to([a, b], {
          y: (i) => (i ? -5 : 5),
          duration: 0.18,
          ease: "power2.in",
        }).to([a, b], {
          rotation: (i) => (i ? -45 : 45),
          duration: 0.45,
          ease: "back.out(2.4)",
        });
      } else {
        t.to([a, b], { rotation: 0, duration: 0.2, ease: "power2.in" }).to(
          [a, b],
          { y: 0, duration: 0.45, ease: "back.out(2.4)" },
        );
      }
    };

    /* a link pointed at (mouse) or reached (keyboard): the others fade, it moves right, its arrow draws */
    const point = (link) => {
      if (here === link) return;
      here = link;
      list.classList.add("is-pointing");
      links.forEach((l, i) => {
        const hit = l === link;
        l.classList.toggle("is-here", hit);
        if (REDUCED) return;
        gsap.to(masks[i], {
          x: hit ? NAV_ANIMATION.nudge : 0,
          duration: hit ? 0.55 : 0.45,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(arrows[i], {
          x: hit ? NAV_ANIMATION.nudge : 0,
          opacity: hit ? 1 : 0,
          duration: hit ? 0.55 : 0.3,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(paths[i], {
          strokeDashoffset: hit ? 0 : ARROW,
          duration: hit ? 0.6 : 0.3,
          ease: hit ? "power2.out" : "power2.in",
          overwrite: "auto",
        });
      });
      if (REDUCED) {
        arrows.forEach((a, i) =>
          gsap.set([a, paths[i]], {
            opacity: links[i] === link ? 1 : 0,
            strokeDashoffset: 0,
          }),
        );
      }
    };

    const unpoint = () => {
      if (!here) return;
      here = null;
      list.classList.remove("is-pointing");
      links.forEach((l, i) => {
        l.classList.remove("is-here");
        gsap.to(masks[i], {
          x: 0,
          duration: 0.45,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(arrows[i], {
          x: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(paths[i], {
          strokeDashoffset: ARROW,
          duration: 0.3,
          ease: "power2.in",
          overwrite: "auto",
        });
      });
    };

    const openMenu = () => {
      if (open) return;
      open = true;
      tl?.kill();
      measure();
      menu.inert = false;
      menu.classList.add("is-open");
      html.classList.add("is-locked");
      setButton(true);

      /* at the end the circle is measured again, in case the window changed size meanwhile */
      tl = gsap.timeline({
        onComplete: () => {
          if (open && !REDUCED) {
            measure();
            reveal.r = centre.far;
            draw();
          }
        },
      });

      if (REDUCED) {
        tl.fromTo(
          menu,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power1.out" },
        )
          .set(words, { yPercent: 0, rotation: 0 }, 0)
          .set(foot, { opacity: 1 }, 0);
      } else {
        tl.to(reveal, {
          r: centre.far,
          duration: NAV_ANIMATION.open,
          ease: "power3.inOut",
          onUpdate: draw,
        })
          .fromTo(
            words,
            {
              yPercent: 118,
              rotation: NAV_ANIMATION.tilt,
              transformOrigin: "0% 100%",
            },
            {
              yPercent: 0,
              rotation: 0,
              duration: NAV_ANIMATION.rise[0],
              ease: "power4.out",
              stagger: NAV_ANIMATION.rise[1],
            },
            NAV_ANIMATION.open * 0.38,
          )
          .fromTo(
            foot,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
            NAV_ANIMATION.open * 0.7,
          );
      }

      if (keys) {
        tl.call(
          () => open && links[0].focus({ preventScroll: true }),
          null,
          REDUCED ? 0.05 : NAV_ANIMATION.open * 0.5,
        );
      }
    };

    const closeMenu = () => {
      if (!open) return;
      open = false;
      tl?.kill();
      measure();
      unpoint();
      setButton(false);
      const hadFocus = menu.contains(document.activeElement);

      tl = gsap.timeline({
        onComplete: () => {
          menu.classList.remove("is-open");
          menu.inert = true;
          html.classList.remove("is-locked");
        },
      });

      if (REDUCED) {
        tl.to(menu, { opacity: 0, duration: 0.25, ease: "power1.in" });
      } else {
        tl.to(words, {
          yPercent: -118,
          rotation: -NAV_ANIMATION.tilt / 2,
          duration: 0.45,
          ease: "power3.in",
          stagger: { each: 0.04, from: "end" },
        })
          .to(foot, { opacity: 0, y: -8, duration: 0.3, ease: "power2.in" }, 0)
          .to(
            reveal,
            {
              r: 0,
              duration: NAV_ANIMATION.close,
              ease: "power3.inOut",
              onUpdate: draw,
            },
            0.18,
          );
      }

      if (hadFocus) burger.focus({ preventScroll: true });
    };

    on(burger, "click", () => (open ? closeMenu() : openMenu()));

    links.forEach((l) => {
      on(l, "pointerenter", (e) => e.pointerType === "mouse" && point(l));
      on(l, "focus", () => l.matches(":focus-visible") && point(l));
      /* go to the section (the menu hides the jump), then close */
      on(l, "click", (e) => {
        e.preventDefault();
        goTo(l.getAttribute("href").slice(1));
        closeMenu();
      });
    });
    on(list, "pointerleave", (e) => e.pointerType === "mouse" && unpoint());
    on(menu, "focusout", (e) => !list.contains(e.relatedTarget) && unpoint());

    /* Esc closes; Tab goes round inside the open menu and its button */
    on(window, "keydown", (e) => {
      if (!open) return;
      if (e.key === "Escape") return closeMenu();
      if (e.key !== "Tab") return;
      const stops = [burger, ...menu.querySelectorAll("a")];
      const i = stops.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        stops[stops.length - 1].focus();
      } else if (!e.shiftKey && i === stops.length - 1) {
        e.preventDefault();
        stops[0].focus();
      }
    });

    /* a new window size: the circle keeps covering the page */
    on(window, "resize", () => {
      measure();
      if (REDUCED) return;
      if (open && !(tl && tl.isActive())) reveal.r = centre.far;
      draw();
    });

    /* the button arrives */
    if (!REDUCED) {
      gsap.from(burger, {
        autoAlpha: 0,
        scale: 0.6,
        duration: 0.8,
        ease: "back.out(2)",
        delay: 0.15,
        clearProps: "transform",
      });
    }

    return () => {
      off.forEach((fn) => fn());
      tl?.kill();
      const targets = [
        burger,
        ...lines,
        wordOpen,
        wordClose,
        ...words,
        ...masks,
        ...arrows,
        ...paths,
        foot,
      ];
      gsap.killTweensOf([...targets, menu, reveal]);
      gsap.set(targets, { clearProps: "all" });
      menu.style.clipPath = "";
      menu.classList.remove("is-open");
      menu.inert = true;
      burger.classList.remove("is-open");
      html.classList.remove("is-locked");
    };
  }, []);

  return (
    <>
      <header id="nav" ref={bar}>
        <div className="nav-inner">
          <a href={`#${navLinks[0].id}`} className="nav-logo">
            <img src="/images/logo.png" alt="logo" />
            <p>Red</p>
          </a>

          <button
            className="nav-burger"
            type="button"
            aria-expanded="false"
            aria-controls="menu"
            data-burger
          >
            <span className="nav-words" aria-hidden="true">
              <span className="nav-word" data-word-open>
                Menu
              </span>
              <span className="nav-word" data-word-close>
                Close
              </span>
            </span>
            <span className="sr-only" data-name>
              Open the menu
            </span>
            <span className="nav-icon" aria-hidden="true">
              <i data-line />
              <i data-line />
            </span>
          </button>
        </div>
      </header>

      <nav id="menu" ref={menuRef} aria-label="Main">
        <div className="menu-inner">
          <ul className="menu-links" data-links>
            {navLinks.map(({ id, title }) => (
              <li key={id}>
                <a className="menu-link" href={`#${id}`} data-link>
                  <span className="menu-mask">
                    <span className="menu-word" data-rise>
                      {title}
                    </span>
                  </span>
                  <svg
                    className="menu-arrow"
                    viewBox="0 0 40 24"
                    aria-hidden="true"
                  >
                    <path d="M2 12h34M26 3l10 9-10 9" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          <div className="menu-foot" data-foot>
            {NAV_FOOT.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
