import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing • Scorpio",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
