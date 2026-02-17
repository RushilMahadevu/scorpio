import { Metadata } from "next";
import { FileText, Gavel, UserCheck, Ban, Scale, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Terms of Service | Scorpio Educational Platform",
  description: "Terms and conditions for using the Scorpio AI learning platform for schools, teachers, and students.",
};

export default function TermsPage() {
  const terms = [
    {
      icon: UserCheck,
      title: "Acceptance of Terms",
      content: "By accessing and using Scorpio, you agree to be bound by these Terms of Service. If you are a minor, you represent that you have received parental or guardian consent to use the platform."
    },
    {
      icon: Scale,
      title: "Educational License",
      content: "Scorpio grants you a limited, non-exclusive, non-transferable license to use the platform for educational and research purposes. Commercial redistribution of our AI architecture or content is strictly prohibited."
    },
    {
      icon: Ban,
      title: "Prohibited Conduct",
      content: "Users may not attempt to reverse-engineer the 4-layer constraint system, bypass pedagogical safeguards (DAR elimination), or use automated tools to harvest content from the platform."
    },
    {
      icon: ShieldAlert,
      title: "Academic Integrity",
      content: "Scorpio is a tutoring aid, not a solution generator. Utilizing the platform to bypass institutional academic integrity policies is a violation of these terms and may result in account termination."
    }
  ];

  return (
    <div className="max-w-4xl w-full space-y-12 pb-20">
      {/* Header */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20">
            Legal Framework
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
          Terms of <span className="text-primary">Service</span>.
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Establishing a clear understanding for the responsible use of AI in physics education.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground italic bg-muted/30 w-fit px-4 py-1.5 rounded-full border border-border/40">
           <Gavel className="h-4 w-4" />
           Effective Date: February 16, 2026
        </div>
      </section>

      <hr className="border-border/40" />

      {/* Main Terms Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {terms.map((term, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <term.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg">{term.title}</h3>
            </div>
            <Card className="bg-card/40 border-border/50">
              <CardContent className="pt-6">
                 <p className="text-sm text-muted-foreground leading-relaxed">
                    {term.content}
                 </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </section>

      {/* Limitations of Liability */}
      <section className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
        <div className="flex items-start gap-4 mb-6">
           <AlertTriangle className="h-6 w-6 text-primary mt-1" />
           <h2 className="text-2xl font-bold">Limitations & Disclaimers</h2>
        </div>
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
           <p>
             <strong>AI Accuracy:</strong> While Scorpio utilizes a sophisticated constraint architecture, Large Language Models may still produce errors. Users are encouraged to verify critical physics derivations with standard textbooks.
           </p>
           <p>
             <strong>Platform Availability:</strong> We strive for 99.9% uptime, but Scorpio is provided "as is" without warranties of any kind regarding uninterrupted service during maintenance or third-party API outages.
           </p>
           <p>
              <strong>Termination:</strong> We reserve the right to suspend or terminate access to any user who violates these terms, specifically targeting those who attempt to disrupt the pedagogical integrity of the AI tutor.
           </p>
        </div>
        <div className="mt-10 pt-8 border-t border-primary/10 text-center">
            <p className="text-xs text-muted-foreground italic">
               Questions about our terms? Contact us <a href="mailto:rushil.mahadevu@gmail.com" className="text-primary hover:underline">here</a>
            </p>
        </div>
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
  );
}
