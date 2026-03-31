import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignment",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
