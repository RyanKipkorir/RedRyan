import React from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Story from "./components/Story";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  return (
    <main>
      <Navbar />
      <Hero />
      <Story />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
};

export default App;
