import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment Tracker • Scorpio",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
