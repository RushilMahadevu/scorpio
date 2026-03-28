import { Metadata } from "next";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "About Scorpio | AI-Powered Physics Tutoring Vision",
  description: "Learn about the mission behind Scorpio: replacing traditional LMS frustration with AI-powered Socratic tutoring that helps physics students truly understand.",
};

export default function AboutPage() {
  return <AboutClient />;
}
