import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Access",
  description: "Apply for institutional access to Scorpio's verifiable AI physics platform.",
};

export default function RequestAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
