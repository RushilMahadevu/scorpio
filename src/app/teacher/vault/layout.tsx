import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Vault Controls",
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
