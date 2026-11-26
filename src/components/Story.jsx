import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, reduceMotion } from "./stories/storyUtils.js";
import ShapeOverlay from "./ShapeOverlay";
import Story1 from "./stories/Story1.jsx";
import Quiz1 from "./stories/Quiz1.jsx";
import Story2 from "./stories/Story2.jsx";
import Quiz2 from "./stories/Quiz2.jsx";
import Story3 from "./stories/Story3.jsx";
import Story4 from "./stories/Story4.jsx";
import StorySwap from "./stories/StorySwap.jsx";
import Quiz3 from "./stories/Quiz3.jsx";
import Story5 from "./stories/Story5.jsx";
import Story6 from "./stories/Story6.jsx";
import { SECTION_IDS } from "../../constants/index.js";

const STAGES = [
  { id: "story1", label: "01. Intro" },
  { id: "quiz1", label: "02. 1 + 1 = ?" },
  { id: "story2", label: "03. MMU Math" },
  { id: "quiz2", label: "04. What is E?" },
  { id: "path", label: "05. Perspective" },
  { id: "quiz3", label: "06. Prime 83" },
  { id: "story5", label: "07. Technologies" },
  { id: "story6", label: "08. Toolbox" },
];

const Story = () => {
  const root = useRef(null);
  const wipe = useRef(null);
  const stageContainerRef = useRef(null);

  // Story interactive states
  const [currentStage, setCurrentStage] = useState("story1");
  const [quiz1Answer, setQuiz1Answer] = useState("2");
  const [quiz2Path, setQuiz2Path] = useState("einstein"); // 'einstein' | 'euler' | 'plain'
  const [unlockedStages, setUnlockedStages] = useState(["story1"]);

  const unlockStage = (stageId) => {
    setUnlockedStages((prev) => (prev.includes(stageId) ? prev : [...prev, stageId]));
  };

  const transitionTo = (nextStage) => {
    unlockStage(nextStage);

    if (reduceMotion() || !stageContainerRef.current) {
      setCurrentStage(nextStage);
      return;
    }

    // GSAP smooth scene transition
    const el = stageContainerRef.current;
    gsap.to(el, {
      opacity: 0,
      y: -20,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        setCurrentStage(nextStage);
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
        );
      },
    });
  };

  // Handlers for story progression
  const handleStartQuiz1 = () => {
    transitionTo("quiz1");
  };

  const handleQuiz1Answer = (answer) => {
    setQuiz1Answer(answer);
    transitionTo("story2");
  };

  const handleProceedToQuiz2 = () => {
    transitionTo("quiz2");
  };

  const handleQuiz2SelectPath = (path) => {
    setQuiz2Path(path);
    transitionTo(path); // 'einstein' | 'euler' | 'plain'
  };

  const handleProceedToQuiz3 = () => {
    transitionTo("quiz3");
  };

  const handleQuiz3Solved = () => {
    transitionTo("story5");
  };

  const handleProceedToToolbox = () => {
    transitionTo("story6");
  };

  // Refresh ScrollTrigger when stage changes
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [currentStage]);

  // Determine stage index for progress bar
  const getStageIndex = () => {
    if (currentStage === "story1") return 0;
    if (currentStage === "quiz1") return 1;
    if (currentStage === "story2") return 2;
    if (currentStage === "quiz2") return 3;
    if (["einstein", "euler", "plain", "story3", "story4", "storyswap"].includes(currentStage))
      return 4;
    if (currentStage === "quiz3") return 5;
    if (currentStage === "story5") return 6;
    if (currentStage === "story6") return 7;
    return 0;
  };

  const activeStageIdx = getStageIndex();

  return (
    <section
      id={SECTION_IDS.about}
      ref={root}
      className="relative min-h-dvh w-full bg-black text-white"
    >
      <ShapeOverlay ref={wipe} colors={["#000000", "#ff0000"]} />

      {/* Floating HUD: Interactive Story Progress Tracker */}
      <div className="sticky top-0 z-30 flex w-full flex-col border-b border-neutral-900 bg-black/90 backdrop-blur-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-red">
            <span className="size-2 rounded-full bg-red animate-pulse" />
            <span className="hidden sm:inline">THE MATHEMATICS OF RED //</span>
            <span className="text-white">CHAPTER {activeStageIdx + 1} OF 8</span>
          </div>

          {/* Breadcrumb Steps */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {STAGES.map((s, idx) => {
              const isUnlocked =
                unlockedStages.includes(s.id) ||
                (s.id === "path" &&
                  (unlockedStages.includes("einstein") ||
                    unlockedStages.includes("euler") ||
                    unlockedStages.includes("plain")));
              const isActive = idx === activeStageIdx;

              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (s.id === "path") transitionTo(quiz2Path);
                    else transitionTo(s.id);
                  }}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] md:text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "border border-red bg-red text-black shadow-[0_0_15px_rgba(255,0,0,0.6)]"
                      : isUnlocked
                      ? "border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-red hover:text-white cursor-pointer"
                      : "opacity-30 border border-transparent text-neutral-600 cursor-not-allowed"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Linear progress line */}
        <div className="h-[2px] w-full bg-neutral-900">
          <div
            className="h-full bg-red transition-all duration-500"
            style={{ width: `${((activeStageIdx + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Active Stage Screen Container */}
      <div ref={stageContainerRef} className="w-full">
        {currentStage === "story1" && (
          <Story1 onNext={handleStartQuiz1} wipe={wipe} />
        )}

        {currentStage === "quiz1" && (
          <Quiz1
            initialSelected={quiz1Answer}
            onAnswerSelected={handleQuiz1Answer}
          />
        )}

        {currentStage === "story2" && (
          <Story2
            selectedAnswer={quiz1Answer}
            onProceedToQuiz2={handleProceedToQuiz2}
          />
        )}

        {currentStage === "quiz2" && (
          <Quiz2 onSelectPath={handleQuiz2SelectPath} />
        )}

        {(currentStage === "einstein" || currentStage === "story3") && (
          <Story3
            onProceedToQuiz3={handleProceedToQuiz3}
            onSwitchPath={handleQuiz2SelectPath}
          />
        )}

        {(currentStage === "euler" || currentStage === "story4") && (
          <Story4
            onProceedToQuiz3={handleProceedToQuiz3}
            onSwitchPath={handleQuiz2SelectPath}
          />
        )}

        {(currentStage === "plain" || currentStage === "storyswap") && (
          <StorySwap
            onProceedToQuiz3={handleProceedToQuiz3}
            onSwitchPath={handleQuiz2SelectPath}
          />
        )}

        {currentStage === "quiz3" && (
          <Quiz3 onSolved={handleQuiz3Solved} />
        )}

        {currentStage === "story5" && (
          <Story5 onProceedToToolbox={handleProceedToToolbox} />
        )}

        {currentStage === "story6" && (
          <div className="flex flex-col">
            <Story6 />
            <div className="flex justify-center bg-black pb-16">
              <button
                type="button"
                onClick={() => transitionTo("story1")}
                className="rounded-full border border-neutral-800 bg-neutral-950 px-6 py-2.5 font-mono text-xs font-bold text-neutral-400 hover:border-red hover:text-red transition-colors cursor-pointer"
              >
                ↺ REPLAY MATHEMATICAL STORY FROM START
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Story;