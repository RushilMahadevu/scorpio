import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uploads",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
