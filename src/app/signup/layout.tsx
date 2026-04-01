import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a Scorpio account to start mastering physics with verifiable AI tutoring.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
