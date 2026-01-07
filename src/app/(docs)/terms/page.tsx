import { Metadata } from "next";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service | Scorpio Educational Platform",
  description: "Terms and conditions for using the Scorpio AI learning platform for schools, teachers, and students.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl w-full">
         <div className="flex items-center gap-4 mb-8 border-b border-border/40 pb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
                 <FileText size={32} className="text-primary" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Terms of Service</h1>
                <p className="text-muted-foreground mt-1">
                    Last updated: December 29, 2025
                </p>
            </div>
        </div>

      <div className="space-y-8">
        <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">1</span> 
                Acceptance of Terms
            </h2>
            <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Scorpio, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">2</span>
                Use License
            </h2>
            <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    Permission is granted to temporarily use Scorpio for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">3</span>
                User Responsibilities
            </h2>
            <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">4</span>
                Prohibited Uses
            </h2>
             <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    You may not use Scorpio for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">5</span>
                Content
            </h2>
             <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. You are responsible for content that you post.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">6</span>
                Termination
            </h2>
             <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">7</span>
               Limitation of Liability
            </h2>
             <Card className="bg-card/50">
                 <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    In no event shall Scorpio or its suppliers be liable for any damages arising out of the use or inability to use the service.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">8</span>
                Governing Law
            </h2>
            <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    These terms shall be interpreted and governed by the laws of your jurisdiction, without regard to its conflict of law provisions.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">9</span>
                Changes to Terms
            </h2>
            <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">10</span>
                Contact Information
            </h2>
            <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms, please contact us at <a href="mailto:rushil.mahadevu@gmail.com" className="text-primary hover:underline">rushil.mahadevu@gmail.com</a>.
                    </p>
                </CardContent>
            </Card>
        </section>
      </div>
    </div>
  );
}
