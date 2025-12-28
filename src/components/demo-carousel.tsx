import { Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const demoSlides = [
  { src: "/demos/processed/ai-tutor-chat.mp4", title: "AI Tutor", desc: "Conversational tutor with reasoning." },
  { src: "/demos/processed/assignment-creation-teacher.mp4", title: "Assignments", desc: "Teachers build assignments." },
  { src: "/demos/processed/student-submission-math-file.mp4", title: "Submission", desc: "Students submit work easily." },
  { src: "/demos/processed/navigation-assistant.mp4", title: "Assistant", desc: "Smart guided navigation." }
];

// Progress bar durations in seconds for each slide
const slideDurations = [12, 41, 25, 36];

export function DemoCarousel() {
  const [index, setIndex] = useState(0);
  const total = demoSlides.length;
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const prevVideoRef = useRef<HTMLVideoElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);

  const next = () => setIndex(i => (i + 1) % total);
  const prev = () => setIndex(i => (i - 1 + total) % total);

  const getSlide = (o: number) => demoSlides[(index + o + total) % total];

  // Control video playback based on current index
  useEffect(() => {
    // Pause all videos first
    prevVideoRef.current?.pause();
    currentVideoRef.current?.pause();
    nextVideoRef.current?.pause();

    // Play only the current video
    currentVideoRef.current?.play();
  }, [index]);

  // Play current video on mount
  useEffect(() => {
    currentVideoRef.current?.play();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      prevVideoRef.current?.pause();
      currentVideoRef.current?.pause();
      nextVideoRef.current?.pause();
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-play and progress bar animation with per-slide timing, pause on hover
  // Progress bar timer logic: start on slide change and when hover ends
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    progressRef.current = 0;
    setProgress(0);
    let currentStep = 0;
    const duration = slideDurations[index] * 1000; // ms
    const intervalMs = 50;
    const steps = duration / intervalMs;

    function startTimer(fromStep: number) {
      currentStep = fromStep;
      timerRef.current = setInterval(() => {
        currentStep++;
        const percent = Math.min((currentStep / steps) * 100, 100);
        setProgress(percent);
        progressRef.current = percent;
        if (percent >= 100) {
          clearInterval(timerRef.current!);
          next();
        }
      }, intervalMs);
    }

    if (!isHovered) {
      startTimer(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index]);

  // Pause/resume timer on hover without resetting progress
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isHovered) {
      // Resume timer from current progress
      const duration = slideDurations[index] * 1000; // ms
      const intervalMs = 50;
      const steps = duration / intervalMs;
      let currentStep = Math.floor((progressRef.current / 100) * steps);
      timerRef.current = setInterval(() => {
        currentStep++;
        const percent = Math.min((currentStep / steps) * 100, 100);
        setProgress(percent);
        progressRef.current = percent;
        if (percent >= 100) {
          clearInterval(timerRef.current!);
          next();
        }
      }, intervalMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered]);

  // Pause/resume video on hover
  useEffect(() => {
    const video = currentVideoRef.current;
    if (!video) return;
    if (isHovered) {
      video.pause();
    } else {
      video.play();
    }
  }, [isHovered, index]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      <div
        className="relative w-full h-[540px] flex items-center justify-center overflow-visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* Left arrow */}
        <button
          onClick={prev}
          className="absolute left-4 z-30 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Track */}
        <div className="relative w-full flex items-center justify-center">

          {/* Previous preview */}
          <div className="absolute left-0 -translate-x-1/4 z-10 scale-[0.9] opacity-70 blur-[2px] hover:blur-0 transition-all">
            <video
              ref={prevVideoRef}
              src={getSlide(-1).src}
              autoPlay
              loop
              muted
              playsInline
              className="rounded-2xl border w-[720px] h-[540px] object-cover"
            />
          </div>

          {/* Active */}
          <div className="z-20">
            <video
              ref={currentVideoRef}
              src={getSlide(0).src}
              autoPlay
              loop
              muted
              playsInline
              className="rounded-2xl border shadow-2xl w-[900px] h-[540px] object-cover"
            />
            {/* Progress bar */}
            <div className="w-full bg-black/20 dark:bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden relative">
              <div
                className={`h-1.5 bg-black dark:bg-white rounded-full transition-all ${isHovered ? 'opacity-60 blur-[2px]' : ''}`}
                style={{
                  width: `${progress}%`,
                  transition: `width ${slideDurations[index]}s linear`
                }}
              />
              {isHovered && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                  <Pause className="h-3 w-3 text-black dark:text-white opacity-70" />
                </span>
              )}
            </div>
          </div>

          {/* Next preview */}
          <div className="absolute right-0 translate-x-1/4 z-10 scale-[0.9] opacity-70 blur-[2px] hover:blur-0 transition-all">
            <video
              ref={nextVideoRef}
              src={getSlide(1).src}
              autoPlay
              loop
              muted
              playsInline
              className="rounded-2xl border w-[720px] h-[540px] object-cover"
            />
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          className="absolute right-4 z-30 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="text-center mt-6 max-w-2xl">
        <h3 className="text-xl font-bold">{getSlide(0).title}</h3>
        <p className="text-muted-foreground">{getSlide(0).desc}</p>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center space-x-2 mt-4">
        {demoSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index
                ? "bg-white shadow-lg scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Subtle guidance */}
      <div className="mt-3 text-[11px] text-black/40 dark:text-white/40 select-none italic text-center tracking-wide">
        Hover to pause &middot; Use arrows or keyboard to navigate
      </div>
    </div>
  );
}
