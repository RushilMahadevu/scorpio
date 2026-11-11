"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/landing/site-header";

export const HomeChatbot = dynamic(
  () => import("@/components/landing-chatbot").then((m) => m.LandingChatbot),
  { ssr: false }
);

export function HomeScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = document.querySelectorAll("#home-page [data-scroll-reveal]");
    const viewportHeight = window.innerHeight;
    const offscreen = Array.from(elements).filter((element) =>
      !element.hasAttribute("data-revealed") && element.getBoundingClientRect().top >= viewportHeight
    );
    const observer = new IntersectionObserver((entries) => {
      for (const { isIntersecting, target } of entries) {
        if (isIntersecting) {
          target.removeAttribute("data-reveal-pending");
          target.setAttribute("data-revealed", "");
          observer.unobserve(target);
        }
      }
    });

    for (const element of offscreen) {
      element.setAttribute("data-reveal-pending", "");
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      for (const element of offscreen) element.removeAttribute("data-reveal-pending");
    };
  }, []);

  return null;
}

const HOME_SECTIONS = ["home", "partners", "features", "solution", "problem", "efficacy", "pricing-teaser", "faq", "cta"];

export function HomeHeader() {
  const [activeNav, setActiveNav] = useState("home");

  useEffect(() => {
    let frame: number;
    const updateActiveSection = () => {
      const activeSection = HOME_SECTIONS.find((id) => {
        const bounds = document.getElementById(id)?.getBoundingClientRect();
        return bounds && bounds.top <= 100 && bounds.bottom > 100;
      });
      if (activeSection) setActiveNav(activeSection);
    };

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <SiteHeader activeSection={activeNav} />;
}
