"use client";

import { useLayoutEffect, useRef } from "react";
import { Logo } from "@/components/ui/logo";
import styles from "./loading-screen.module.css";

const SESSION_KEY = "scorpio_splash_shown";

export function LoadingScreen() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || window.location.hash || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }

    dialog.showModal();
    return () => dialog.close();
  }, []);

  function finishIntro() {
    dialogRef.current?.close();
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // The page is already available if storage became inaccessible.
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Scorpio intro"
      className={`${styles.splash} fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-background text-foreground backdrop:bg-transparent open:grid open:place-items-center`}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) finishIntro();
      }}
      onCancel={(event) => {
        event.preventDefault();
        finishIntro();
      }}
    >
      <div
        aria-hidden="true"
        className={`${styles.grid} pointer-events-none absolute inset-0`}
      />

      <div className="relative flex flex-col items-center gap-8 sm:gap-10" aria-hidden="true">
        <div className="relative grid place-items-center">
          <span className={`${styles.ring} absolute inset-0 rounded-full border border-foreground/25`} />
          <Logo size={90} strokeWidth={3} className={styles.logo}>
            <circle className={styles.compass} cx="12" cy="12" r="10" pathLength={1} />
            <path className={styles.needle} d="M16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88Z" pathLength={1} />
          </Logo>
        </div>

        <div className="text-center">
          <div className="flex font-inter text-5xl font-black leading-none tracking-tighter sm:text-6xl">
            {"Scorpio".split("").map((letter, index) => (
              <span
                key={index}
                className={styles.letter}
                style={{ animationDelay: `${400 + index * 30}ms` }}
              >
                {letter}
              </span>
            ))}
          </div>
          <p className={`${styles.caption} mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground`}>
            Physics LMS
          </p>
        </div>
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-border/50">
        <div className={`${styles.progress} h-full origin-left bg-primary`} />
      </div>

      <button
        type="button"
        className="absolute right-4 top-4 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:right-6 sm:top-6"
        onClick={finishIntro}
      >
        Skip intro
      </button>
    </dialog>
  );
}
