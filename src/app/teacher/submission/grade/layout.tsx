import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grade Submission",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
