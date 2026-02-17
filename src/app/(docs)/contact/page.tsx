import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle, Github, HelpCircle, Send, Globe, Layout } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Scorpio AI Learning Platform",
  description: "Get in touch with the Scorpio team. We're here to help schools and educators transform physics education with AI.",
};

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Technical Support",
      description: "For platform bugs, account issues, or deployment questions.",
      value: "rushil.mahadevu@gmail.com",
      action: "Send Email",
      href: "mailto:rushil.mahadevu@gmail.com"
    },
    {
      icon: Github,
      title: "Open Source",
      description: "Submit issues, feature requests, or contributions directly on GitHub.",
      value: "RushilMahadevu/scorpio",
      action: "Open GitHub",
      href: "https://github.com/RushilMahadevu/scorpio/issues"
    },
    {
      icon: Layout,
      title: "Research Inquiries",
      description: "Questions regarding our 4-layer constraint architecture or data.",
      value: "View Whitepaper",
      action: "Read Research",
      href: "/research"
    }
  ];

  return (
    <div className="max-w-4xl w-full space-y-12 pb-20">
      {/* Header */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20">
            Support Center
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
          How can we <span className="text-primary">help you</span>?
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Whether you're an educator deploying Scorpio in your classroom or a developer exploring our architecture, we're here to support you.
        </p>
      </section>

      <hr className="border-border/40" />

      {/* Contact Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactMethods.map((method, i) => (
          <Card key={i} className="bg-card/40 border-border/50 flex flex-col h-full hover:border-primary/20 transition-all group">
            <CardHeader className="flex-1">
              <div className="p-2.5 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <method.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{method.title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-2">
                {method.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
               <div className="text-xs font-mono text-muted-foreground mb-4 truncate italic">
                  {method.value}
               </div>
               <Button size="sm" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all" asChild>
                  <a href={method.href} target={method.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    {method.action}
                    <Send className="h-3 w-3" />
                  </a>
               </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* FAQ/Self-Service Section */}
      <section className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Frequently Asked</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-medium">
          <div className="space-y-2">
             <h3 className="text-sm font-bold text-foreground">Is Scorpio open source?</h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
                Yes! Scorpio is licensed under the MIT license and is available for community contributions on GitHub.
             </p>
          </div>
          <div className="space-y-2">
             <h3 className="text-sm font-bold text-foreground">How do I reset my password?</h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
                Password resets are handled securely through Firebase Auth. Click "Forgot Password" on the login screen.
             </p>
          </div>
          <div className="space-y-2">
             <h3 className="text-sm font-bold text-foreground">Can I use this in my school?</h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
                Scorpio is built for scale. Contact us for priority setup or documentation on self-hosting your own instance.
             </p>
          </div>
          <div className="space-y-2">
             <h3 className="text-sm font-bold text-foreground">What AI models are supported?</h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
                We currently optimize for Gemini 2.5 Flash, but our constraint architecture is model-agnostic.
             </p>
          </div>
        </div>
      </section>
    </div>
  );
}
