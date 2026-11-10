"use client";

import * as React from "react";
import {
  User,
  LogOut,
  SlidersHorizontal as SettingsIcon,
  Palette,
  Info,
  RotateCcwKey,
  Mails,
  Shield,
  FileText,
  Mail,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { AppearancePreferences, ThemeModeControl } from "@/components/appearance-settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import {
  logout,
  resetPassword,
  changeEmail,
  deleteFullAccount,
  updateUserProfile,
} from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CompassLogo } from "@/components/ui/compass-logo";

function ToggleSwitch({
  checked,
  onCheckedChange,
  id,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function SettingsDialog() {
  const { user, role, profile } = useAuth();
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [emailChangeOpen, setEmailChangeOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertType, setAlertType] = React.useState<"success" | "error">("success");

  const handleAutoRedirectChange = async (checked: boolean) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, {
        preferences: {
          ...profile?.preferences,
          autoRedirectPortal: checked,
        },
      });
      setAlertMessage("Account settings updated.");
      setAlertType("success");
      setTimeout(() => setAlertMessage(""), 3000);
    } catch (error) {
      console.error("Error updating preferences:", error);
      setAlertMessage("Failed to update settings.");
      setAlertType("error");
    }
  };

  const handleAssignmentEmailsChange = async (checked: boolean) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, {
        preferences: {
          ...profile?.preferences,
          disableAssignmentEmails: checked,
        },
      });
      setAlertMessage("Account settings updated.");
      setAlertType("success");
      setTimeout(() => setAlertMessage(""), 3000);
    } catch (error) {
      console.error("Error updating preferences:", error);
      setAlertMessage("Failed to update settings.");
      setAlertType("error");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    setOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setAlertMessage("Deleting account and data...");
      setAlertType("success");

      await deleteFullAccount(user.uid, role || "student");

      setAlertMessage("Account deleted successfully. Goodbye.");
      toast.success("Account deleted successfully.");
      setTimeout(() => {
        router.push("/signup");
        setOpen(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setAlertMessage(`Failed to delete account: ${error.message}`);
      setAlertType("error");
      toast.error(`Failed to delete account: ${error.message}`);
    }
  };

  const getInitials = (name: string | null | undefined, email?: string | null) => {
    if (name && typeof name === "string" && name.trim()) {
      return name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email && typeof email === "string" && email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      setAlertMessage("Password reset email sent! Check your inbox.");
      setAlertType("success");
      setTimeout(() => setAlertMessage(""), 5000);
    } catch (error) {
      setAlertMessage("Failed to send password reset email.");
      setAlertType("error");
      setTimeout(() => setAlertMessage(""), 5000);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail.trim()) return;
    try {
      await changeEmail(newEmail);
      setAlertMessage("Email updated successfully!");
      setAlertType("success");
      setEmailChangeOpen(false);
      setNewEmail("");
      setTimeout(() => setAlertMessage(""), 5000);
    } catch (error) {
      setAlertMessage("Failed to update email. Please try again.");
      setAlertType("error");
      setTimeout(() => setAlertMessage(""), 5000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Open settings"
        >
          <SettingsIcon className="size-4.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Manage your profile, visual preferences, and workspace settings.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="account" className="flex flex-col min-h-0 flex-1">
          <div className="px-6 pt-3 pb-2 border-b border-border/30 bg-muted/20">
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/60 rounded-xl">
              <TabsTrigger
                value="account"
                className="flex items-center gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs cursor-pointer"
              >
                <User className="size-3.5" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs cursor-pointer"
              >
                <Palette className="size-3.5" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="flex items-center gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs cursor-pointer"
              >
                <Info className="size-3.5" />
                <span>About</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto px-6 py-5 max-h-[calc(85vh-160px)] space-y-6">
            {alertMessage && (
              <Alert
                className={cn(
                  "border rounded-xl text-xs py-2.5",
                  alertType === "error"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                <AlertDescription>{alertMessage}</AlertDescription>
              </Alert>
            )}

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6 m-0 outline-none">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/20">
                <Avatar className="size-14 border border-border/50 shadow-xs">
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                    {getInitials(user?.displayName, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-foreground truncate">
                      {user?.displayName || "User"}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {role || "User"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Workspace Preferences
                </h4>
                <div className="divide-y divide-border/40 rounded-xl border border-border/40 bg-card/40 overflow-hidden">
                  {role !== "student" && (
                    <div className="flex items-center justify-between p-4 gap-4">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="auto-redirect-toggle"
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          Auto-Portal Redirect
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Skip the landing page and jump directly to your portal upon sign-in.
                        </p>
                      </div>
                      <ToggleSwitch
                        id="auto-redirect-toggle"
                        checked={profile?.preferences?.autoRedirectPortal ?? true}
                        onCheckedChange={handleAutoRedirectChange}
                        ariaLabel="Toggle Auto-Portal Redirect"
                      />
                    </div>
                  )}

                  {role === "teacher" && (
                    <div className="flex items-center justify-between p-4 gap-4">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="assignment-emails-toggle"
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          Disable Assignment Emails
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Mute email notifications sent to students when new assignments are created.
                        </p>
                      </div>
                      <ToggleSwitch
                        id="assignment-emails-toggle"
                        checked={profile?.preferences?.disableAssignmentEmails ?? true}
                        onCheckedChange={handleAssignmentEmailsChange}
                        ariaLabel="Toggle Assignment Emails"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Security & Access */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Security
                </h4>
                <div className="divide-y divide-border/40 rounded-xl border border-border/40 bg-card/40 overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Password</p>
                      <p className="text-xs text-muted-foreground">
                        Send a secure reset link to your email.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePasswordReset}
                      className="rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <RotateCcwKey className="size-3.5 mr-1.5" />
                      Reset Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Email Address</p>
                      <p className="text-xs text-muted-foreground">
                        Update the email associated with your account.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEmailChangeOpen(true)}
                      className="rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <Mails className="size-3.5 mr-1.5" />
                      Change Email
                    </Button>
                  </div>
                </div>
              </div>

              {/* Session & Danger Zone */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-center h-10 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </Button>

                <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-destructive">Delete Account</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently remove your account and stored work.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <Trash2 className="size-3.5 mr-1.5" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="m-0 space-y-4 outline-none">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Theme mode</h3>
                <ThemeModeControl />
              </div>
              <AppearancePreferences />
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6 m-0 outline-none">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/40 bg-muted/20">
                <CompassLogo className="size-10 text-primary mb-3" />
                <h3 className="font-inter font-black text-xl tracking-tight text-foreground">
                  Scorpio
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  AI-Powered Adaptive Physics & Science Learning Platform.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Version 2.0
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Next.js 16
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Documentation", href: "/research", icon: FileText, desc: "Methodology & architecture" },
                  { label: "Contact & Support", href: "/contact", icon: Mail, desc: "Get help from the team" },
                  { label: "Privacy Policy", href: "/privacy", icon: Shield, desc: "Data protection & privacy" },
                  { label: "Terms of Service", href: "/terms", icon: FileText, desc: "Usage terms & guidelines" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        router.push(item.href);
                        setOpen(false);
                      }}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-border/40 hover:bg-muted/40 hover:border-border transition-all text-left cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-foreground shrink-0 transition-colors">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-foreground">{item.label}</p>
                          <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Engineered by{" "}
                  <a
                    href="https://rushil-m.web.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground hover:underline"
                  >
                    Rushil Mahadevu
                  </a>
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Account Permanently"
        description="CRITICAL: This permanently removes your account, learning history, and submissions. This action cannot be undone. Are you sure you wish to proceed?"
        onConfirm={handleDeleteAccount}
        confirmText="Delete Account"
        variant="destructive"
      />

      {/* Email Change Dialog */}
      <Dialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address. A verification link will be sent to complete the change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="new-email-input">New Email</Label>
              <Input
                id="new-email-input"
                type="email"
                placeholder="name@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEmailChangeOpen(false)}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEmailChange}
                disabled={!newEmail.trim()}
                className="rounded-xl cursor-pointer"
              >
                Update Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
