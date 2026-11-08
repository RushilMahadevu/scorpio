import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export function AuthPageNav({ backToLogin = false }: { backToLogin?: boolean }) {
  return (
    <nav aria-label="Account navigation" className="absolute inset-x-4 top-4 z-20 flex items-center justify-between gap-2 sm:inset-x-6 sm:top-6">
      <Button asChild variant="outline">
        <Link href={backToLogin ? "/login" : "/"}>
          <ArrowLeft />
          {backToLogin ? "Back to Login" : "Back to Home"}
        </Link>
      </Button>
      <ModeToggle />
    </nav>
  );
}
