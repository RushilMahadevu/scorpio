"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10 max-w-2xl w-full p-6">
        <Card className="bg-background/90 backdrop-blur-md border-primary/30 shadow-2xl">
          <CardHeader className="text-center pb-6 relative pt-16">
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
            <Logo size={48} className="mx-auto mb-4 drop-shadow-lg text-primary" />
            <CardTitle className="text-3xl md:text-4xl font-extrabold">Contact & Support</CardTitle>
            <CardDescription className="text-base mt-2">
              Need help with Scorpio? Get in touch with our support team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Technical Support
              </h3>
              <p className="text-sm text-muted-foreground">
                For technical issues, feature requests, or general inquiries about Scorpio.
              </p>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">rushil.mahadevu@gmail.com</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Response time: 1-2 business days
              </p>
            </div>

            {/* Getting Started */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                New to Scorpio? Check out our resources to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/about" className="flex-1">
                  <Button variant="outline" className="w-full cursor-pointer">Learn About Scorpio</Button>
                </Link>
                <Link href="/research" className="flex-1">
                  <Button variant="outline" className="w-full cursor-pointer">View Research</Button>
                </Link>
                <Link href="https://github.com/RushilMahadevu/scorpio" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full cursor-pointer">GitHub Repository</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}