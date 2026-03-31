import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equation Vault",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
