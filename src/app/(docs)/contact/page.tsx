import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Scorpio AI Learning Platform",
  description: "Get in touch with the Scorpio team. We're here to help schools and educators transform physics education with AI.",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl w-full">
         <div className="flex items-center gap-4 mb-8 border-b border-border/40 pb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
                 <Mail size={32} className="text-primary" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Contact & Support</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Need help with Scorpio? We're here for you.
                </p>
            </div>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                         <MessageCircle className="h-5 w-5" />
                         Technical Support
                    </CardTitle>
                    <CardDescription>
                         For bugs, feature requests, or general platform inquiries.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-sm text-foreground/80">
                        Our team typically responds within 1-2 business days. For urgent issues affecting active classes, please tag your subject line with [URGENT].
                     </p>
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <a href="mailto:rushil.mahadevu@gmail.com" className="text-sm font-medium hover:underline hover:text-primary transition-colors">
                            rushil.mahadevu@gmail.com
                        </a>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Card>
                     <CardHeader>
                         <CardTitle className="text-lg">For Developers</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Found a bug or want to contribute? Check our GitHub repository.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <a href="https://github.com/RushilMahadevu/scorpio/issues" target="_blank" rel="noopener noreferrer">
                                Open an Issue
                            </a>
                        </Button>
                     </CardContent>
                 </Card>
                 <Card>
                     <CardHeader>
                         <CardTitle className="text-lg">General Inquiry</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Questions about our research or methodology?
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/research">
                                Read Research
                            </Link>
                        </Button>
                     </CardContent>
                 </Card>
            </div>
        </div>
    </div>
  );
}
