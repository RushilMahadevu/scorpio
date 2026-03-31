import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Submissions",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
