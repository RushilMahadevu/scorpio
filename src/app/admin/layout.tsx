import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Scorpio Platform Administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
