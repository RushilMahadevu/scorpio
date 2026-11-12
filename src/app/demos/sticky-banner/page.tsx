import StickyBannerDemo from "@/components/sticky-banner-demo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Sticky Banner Demo",
  description: "Aceternity UI Sticky Banner component demo",
};

export default function StickyBannerDemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-4">
        <Link
          href="/demos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Demos
        </Link>
        <div className="border border-border rounded-2xl overflow-hidden shadow-2xl bg-card">
          <StickyBannerDemo />
        </div>
      </div>
    </div>
  );
}
