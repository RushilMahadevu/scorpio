import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Scorpio account to access your physics courses and assignments.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
