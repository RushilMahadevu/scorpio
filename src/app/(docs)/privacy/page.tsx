import { Metadata } from "next";
import { Shield, Lock, Eye, Users, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn what Scorpio collects, how AI providers process information, and how to request export or deletion.",
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: "Information Collection",
      content: "We collect information you provide directly to us: account details (name, email), profile settings, and educational data generated during tutoring sessions (chat logs, mathematical inputs, and assignments)."
    },
    {
      icon: Users,
      title: "How We Use Data",
      content: "Account information and learning records are used to provide classroom, tutoring, and grading features. School records must not be used for unrelated research or model training without an appropriate separate agreement."
    },
    {
      icon: Shield,
      title: "Sharing & Disclosure",
      content: "Scorpio does not sell student data. Firebase/Google Cloud hosts account and learning records. When an AI feature is used, its relevant text is processed by Google’s AI services. Polar processes billing events; email delivery providers process notification details. Authorized educators can access records within their permitted classroom or network scope. Text masking reduces some identifiers but does not guarantee anonymization."
    },
    {
      icon: Lock,
      title: "Technical Security",
      content: "We implement industry-standard encryption for data at rest and in transit. All educational records are protected via Firebase Security Rules and granular role-based access control (RBAC)."
    },
    {
      icon: CheckCircle2,
      title: "Compliance Standards",
      content: "School deployment requires review of student ages, provider terms, school authorization, and applicable data-protection agreements. Scorpio does not claim a blanket FERPA or COPPA certification. Student AI use must not begin until the provider arrangement permits the intended age group."
    }
  ];

  return (
    <div className="max-w-4xl w-full space-y-12 pb-20">
      {/* Header */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20">
            Privacy & Trust
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
          Protecting the <span className="text-primary">Next Generation</span> of Learners.
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          At Scorpio, we believe that education requires trust. Our privacy framework is designed to keep student data secure while enabling advanced AI learning.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground italic bg-muted/30 w-fit px-4 py-1.5 rounded-full border border-border/40">
          <FileText className="h-4 w-4" />
          Last updated: November 7, 2026
        </div>
      </section>

      <hr className="border-border/40" />

      {/* Grid Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg">{section.title}</h3>
            </div>
            <Card className="bg-card/40 border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </section>

      {/* Rights Section */}
      <section className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Your Data Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Under various global regulations, you have the right to access, export, or request the deletion of your personal information. Signed-in users may request an export or delete their account in settings. Teacher accounts with active classes or network ownership require a supported handoff first. Deletion covers account profiles, submissions, uploaded work, notebooks, tutoring sessions, practice history, and portfolios. Billing/security records and provider backups may follow separate retention schedules; contact us to establish a school-specific retention and deletion agreement before onboarding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <a href="mailto:rushil@scorpioedu.org">Request Data Export</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="mailto:rushil@scorpioedu.org">Privacy Inquiry</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}