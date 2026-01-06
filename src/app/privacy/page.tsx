import { Metadata } from "next";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Privacy Policy | Scorpio Student Data Protection",
  description: "Read how Scorpio protects student data, ensures COPPA/FERPA compliance, and secures educational records.",
};

export default function PrivacyPage() {
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
            <CardTitle className="text-3xl md:text-4xl font-extrabold">Privacy Policy</CardTitle>
            <CardDescription className="text-base mt-2">
              Last updated: December 29, 2025
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, and educational data related to assignments and tutoring sessions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to access, update, or delete your personal information. Contact us at rushil.mahadevu@gmail.com to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy, please contact us at rushil.mahadevu@gmail.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}