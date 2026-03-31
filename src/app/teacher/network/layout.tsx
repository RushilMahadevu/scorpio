import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
