import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutor",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
