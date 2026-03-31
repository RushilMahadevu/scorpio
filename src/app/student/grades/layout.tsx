import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Grades",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
