import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent, AI-first pricing for schools and educators. Unlimited students, zero markup on AI costs.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
