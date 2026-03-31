import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Grades",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
