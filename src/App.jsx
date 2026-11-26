import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import About from "./components/About";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import School from "./components/School";
import Tools from "./components/Tools";
gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startedAt = performance.now();
    let finished = false;
    let minimumTimer;

    const finishLoading = () => {
      if (finished) return;
      finished = true;

      const remaining = Math.max(0, 800 - (performance.now() - startedAt));
      minimumTimer = window.setTimeout(() => setIsLoading(false), remaining);
    };

    if (document.readyState === "complete") {
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading, { once: true });
    }

    const fallbackTimer = window.setTimeout(finishLoading, 12000);

    return () => {
      window.removeEventListener("load", finishLoading);
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(minimumTimer);
    };
  }, []);

  return (
    <>
      <main aria-hidden={isLoading}>
        <Navbar />
        <Hero />
        <About />
        <School />
        <Projects />
        <Tools />
        <Contact />
        <Footer />
      </main>
      {isLoading && (
        <div className="loading-screen" role="status" aria-label="Loading site">
          <Loading />
        </div>
      )}
    </>
  );
};

export default App;
