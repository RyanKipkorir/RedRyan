import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import About from "./components/About";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import School from "./components/School";
import Tools from "./components/Tools";
gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <School />

      <Projects />
      <Tools />
      <Contact />
      <Footer />
    </main>
  );
};

export default App;
