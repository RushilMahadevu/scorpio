import { Metadata } from "next";
import { Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy | Scorpio Student Data Protection",
  description: "Read how Scorpio protects student data, ensures COPPA/FERPA compliance, and secures educational records.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl w-full">
         <div className="flex items-center gap-4 mb-8 border-b border-border/40 pb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
                 <Shield size={32} className="text-primary" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Privacy Policy</h1>
                <p className="text-muted-foreground mt-1">
                    Last updated: December 29, 2025
                </p>
            </div>
        </div>

      <div className="space-y-8">
        <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">1</span> 
                Information We Collect
            </h2>
            <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, and educational data related to assignments and tutoring sessions.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">2</span>
                How We Use Your Information
            </h2>
             <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">3</span>
                Information Sharing
            </h2>
             <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">4</span>
                Data Security
            </h2>
             <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">5</span>
                Your Rights
            </h2>
             <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    You have the right to access, update, or delete your personal information. Contact us at <a href="mailto:rushil.mahadevu@gmail.com" className="text-primary hover:underline">rushil.mahadevu@gmail.com</a> to exercise these rights.
                    </p>
                </CardContent>
            </Card>
        </section>

        <section>
             <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">6</span>
                Contact Us
            </h2>
            <Card className="bg-card/50">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about this privacy policy, please contact us at <a href="mailto:rushil.mahadevu@gmail.com" className="text-primary hover:underline">rushil.mahadevu@gmail.com</a>.
                    </p>
                </CardContent>
            </Card>
        </section>
      </div>
    </div>
  );
}
