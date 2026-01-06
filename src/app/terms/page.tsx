import { Metadata } from "next";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Terms of Service | Scorpio Educational Platform",
  description: "Terms and conditions for using the Scorpio AI learning platform for schools, teachers, and students.",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10 max-w-4xl w-full p-6">
        <Card className="bg-background/90 backdrop-blur-md border-primary/30 shadow-2xl">
          <CardHeader className="text-center pb-6 relative pt-16">
            <BackButton
              className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </BackButton>
            <Logo size={48} className="mx-auto mb-4 drop-shadow-lg text-primary" />
            <CardTitle className="text-3xl md:text-4xl font-extrabold">Terms of Service</CardTitle>
            <CardDescription className="text-base mt-2">
              Last updated: December 29, 2025
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Scorpio, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. Use License</h2>
              <p className="text-muted-foreground">
                Permission is granted to temporarily use Scorpio for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. User Responsibilities</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Prohibited Uses</h2>
              <p className="text-muted-foreground">
                You may not use Scorpio for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Content</h2>
              <p className="text-muted-foreground">
                Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. You are responsible for content that you post.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no event shall Scorpio or its suppliers be liable for any damages arising out of the use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">8. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms shall be interpreted and governed by the laws of your jurisdiction, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">9. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">10. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at rushil.mahadevu@gmail.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}