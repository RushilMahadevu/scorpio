"use client"

import * as React from "react"
import { 
  Moon, 
  Sun, 
  Sparkles, 
  User, 
  LogOut, 
  SlidersHorizontal as SettingsIcon, 
  Palette, 
  Info, 
  RotateCcwKey, 
  Mails, 
  Shield, 
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  Mail,
  Trash2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSpaceEffects } from "@/contexts/space-effects-context"
import { useAppearance, FontOption, ThemeColor } from "@/contexts/appearance-context"
import { useAuth } from "@/contexts/auth-context"
import { logout, resetPassword, changeEmail, deleteFullAccount, updateUserProfile } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"

export function SettingsDialog() {
  const { setTheme, theme } = useTheme()
  const {
    spaceEffectsEnabled,
    toggleSpaceEffects,
    spacyLevel,
    setSpacyLevel,
    nebulaBrightness,
    setNebulaBrightness
  } = useSpaceEffects()
  const { font, setFont, themeColor, setThemeColor, customColor, setCustomColor } = useAppearance()
  const { user, role, profile } = useAuth()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [showNote, setShowNote] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [newEmail, setNewEmail] = React.useState("")
  const [emailChangeOpen, setEmailChangeOpen] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState("")
  
  const [alertType, setAlertType] = React.useState<"success" | "error">("success")

  const handleAutoRedirectChange = async (checked: boolean) => {
    if (!user) return
    try {
      await updateUserProfile(user.uid, {
        preferences: {
          ...profile?.preferences,
          autoRedirectPortal: checked
        }
      })
      setAlertMessage("Account settings updated.")
      setAlertType("success")
      setTimeout(() => setAlertMessage(""), 3000)
    } catch (error) {
      console.error("Error updating preferences:", error)
      setAlertMessage("Failed to update settings.")
      setAlertType("error")
    }
  }

  const handleAssignmentEmailsChange = async (checked: boolean) => {
    if (!user) return
    try {
      await updateUserProfile(user.uid, {
        preferences: {
          ...profile?.preferences,
          disableAssignmentEmails: checked
        }
      })
      setAlertMessage("Account settings updated.")
      setAlertType("success")
      setTimeout(() => setAlertMessage(""), 3000)
    } catch (error) {
      console.error("Error updating preferences:", error)
      setAlertMessage("Failed to update settings.")
      setAlertType("error")
    }
  }

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === "light") {
      setShowNote(true)
      setTimeout(() => setShowNote(false), 3000)
    }
    setTheme(newTheme)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
    setOpen(false)
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      setAlertMessage("Deleting account and data...")
      setAlertType("success")
      
      await deleteFullAccount(user.uid, role || "student")
      
      setAlertMessage("Account deleted successfully. Goodbye.")
      toast.success("Account deleted successfully.")
      setTimeout(() => {
        router.push("/signup")
        setOpen(false)
      }, 2000)
    } catch (error: any) {
      console.error("Error deleting account:", error)
      setAlertMessage(`Failed to delete account: ${error.message}`)
      setAlertType("error")
      toast.error(`Failed to delete account: ${error.message}`)
    }
  }

  const getInitials = (name: string | null | undefined, email?: string | null) => {
    if (name && typeof name === 'string' && name.trim()) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    
    if (email && typeof email === 'string' && email.trim()) {
      const emailName = email.split("@")[0]
      if (emailName) {
        if (emailName.includes(".")) {
          return emailName.split(".").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        } else {
          return emailName.substring(0, 2).toUpperCase()
        }
      }
    }
    
    return "U"
  }

  const handleLearnMore = () => {
    router.push("/about")
    setOpen(false)
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    try {
      await resetPassword(user.email)
      setAlertMessage("Password reset email sent! Check your inbox.")
      setAlertType("success")
      setTimeout(() => setAlertMessage(""), 5000)
    } catch (error) {
      setAlertMessage("Failed to send password reset email.")
      setAlertType("error")
      setTimeout(() => setAlertMessage(""), 5000)
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail.trim()) return
    try {
      await changeEmail(newEmail)
      setAlertMessage("Email updated successfully!")
      setAlertType("success")
      setEmailChangeOpen(false)
      setNewEmail("")
      setTimeout(() => setAlertMessage(""), 5000)
    } catch (error) {
      setAlertMessage("Failed to update email. Please try again.")
      setAlertType("error")
      setTimeout(() => setAlertMessage(""), 5000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <SettingsIcon className="text-muted-foreground hover:text-foreground h-[1.2rem] w-[1.2rem] cursor-pointer" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 text-foreground hover:text-foreground transition-colors" />
            <div className="space-y-1">
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your account and application preferences.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account" className="flex items-center gap-1 cursor-pointer">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1 cursor-pointer">
              <Palette className="h-3 w-3" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="learn-more" className="flex items-center gap-1 cursor-pointer">
              <Info className="h-3 w-3" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6 mt-4">
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(user?.displayName, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{user?.displayName || "User"}</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">{role}</div>
                </div>
              </div>

              {alertMessage && (
                <Alert className={`border-l-4 ${alertType === "error" ? "border-l-destructive bg-destructive/5" : "border-l-green-500 bg-green-50 dark:bg-green-950/20"}`}>
                  <AlertDescription className="text-sm">{alertMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 p-1">
                <h4 className="text-sm font-medium">Account Actions</h4>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePasswordReset}
                    className="w-full justify-start h-10 cursor-pointer"
                  >
                    <RotateCcwKey className="mr-3 h-4 w-4" />
                    Reset Password
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEmailChangeOpen(true)}
                    className="w-full justify-start h-10 cursor-pointer"
                  >
                    <Mails className="mr-3 h-4 w-4" />
                    Change Email
                  </Button>
                  <Separator className="my-2" />
                  
                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-medium">Platform Preferences</h4>
                    {role !== "student" && (
                      <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Checkbox 
                          id="auto-redirect" 
                          checked={profile?.preferences?.autoRedirectPortal ?? true}
                          onCheckedChange={(checked) => handleAutoRedirectChange(checked === true)}
                          className="mt-0.5 cursor-pointer"
                        />
                        <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => handleAutoRedirectChange(!(profile?.preferences?.autoRedirectPortal ?? true))}>
                          <Label 
                            htmlFor="auto-redirect" 
                            className="text-sm font-black leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Auto-Portal Redirect
                          </Label>
                          <p className="text-[11px] text-muted-foreground font-medium">
                            Skip the landing page and jump straight to your {role || "portal"} when logged in.
                          </p>
                        </div>
                      </div>
                    )}
                    {role === "teacher" && (
                      <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/10 mt-2">
                        <Checkbox 
                          id="disable-emails" 
                          checked={profile?.preferences?.disableAssignmentEmails ?? true}
                          onCheckedChange={(checked) => handleAssignmentEmailsChange(checked === true)}
                          className="mt-0.5 cursor-pointer"
                        />
                        <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => handleAssignmentEmailsChange(!(profile?.preferences?.disableAssignmentEmails ?? true))}>
                          <Label 
                            htmlFor="disable-emails" 
                            className="text-sm font-black leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Disable Assignment Emails
                          </Label>
                          <p className="text-[11px] text-muted-foreground font-medium">
                            Turn off email notifications sent to your students when you create new assignments.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start h-10 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </Button>

                  <Separator className="my-2" />
                  
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                    <p className="text-[10px] text-muted-foreground leading-snug">
                       Once you delete your account, there is no going back. All submissions, uploaded work files, and profile data will be permanently purged.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full justify-start h-10 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      Delete Account Permanently
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <ConfirmDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            title="Delete Account"
            description="CRITICAL: This will permanently delete your account and ALL your data (submissions, storage files, profile). This cannot be undone. Are you absolutely sure?"
            onConfirm={handleDeleteAccount}
            confirmText="Delete Account"
            variant="destructive"
          />

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-6">
              {/* Theme Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Theme</h4>
                </div>
                <div className="space-y-3">
                  <RadioGroup value={theme} onValueChange={handleThemeChange} className="grid grid-cols-1 gap-2">
                    <div
                      className={`flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer ${theme === "light" && themeColor === "midnight" ? "opacity-50 grayscale pointer-events-none" : ""}`}
                      onClick={() => !(theme === "light" && themeColor === "midnight") && handleThemeChange("dark")}
                    >
                      <RadioGroupItem value="dark" id="dark-theme" disabled={theme === "light" && themeColor === "midnight"} />
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        <div>
                          <Label htmlFor="dark-theme" className={`font-medium ${theme === "light" && themeColor === "midnight" ? "" : "cursor-pointer"}`}>Dark</Label>
                          <p className="text-xs text-muted-foreground">Perfect for late-night studying</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">(Recommended)</span>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleThemeChange("light")}
                    >
                      <RadioGroupItem value="light" id="light-theme" />
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <div>
                          <Label htmlFor="light-theme" className="font-medium">Light</Label>
                          <p className="text-xs text-muted-foreground">Classic bright interface</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleThemeChange("system")}
                    >
                      <RadioGroupItem value="system" id="system-theme" />
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        <div>
                          <Label htmlFor="system-theme" className="font-medium">System</Label>
                          <p className="text-xs text-muted-foreground">Follow your device settings</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              {/* Theme Color Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Accent Color</h4>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[
                    { name: "Default", value: "default", color: "bg-foreground" },
                    { name: "Ocean", value: "ocean", color: "bg-sky-500" },
                    { name: "Violet", value: "violet", color: "bg-violet-500" },
                    { name: "Rose", value: "rose", color: "bg-rose-500" },
                    { name: "Amber", value: "amber", color: "bg-amber-500" },
                    { name: "Emerald", value: "emerald", color: "bg-emerald-500" },
                    { name: "Midnight", value: "midnight", color: "bg-slate-950" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setThemeColor(t.value as ThemeColor)}
                      className={`group relative flex flex-col items-center gap-1.5 p-1 rounded-lg border-2 transition-all hover:bg-muted/50 cursor-pointer ${
                        themeColor === t.value ? "border-primary bg-primary/5" : "border-transparent"
                      } ${t.value === "midnight" && theme === "light" ? "opacity-50 grayscale pointer-events-none" : ""}`}
                      title={t.name}
                      disabled={t.value === "midnight" && theme === "light"}
                    >
                      <div className={`h-6 w-6 rounded-full ${t.color} shadow-sm group-hover:scale-110 transition-transform`} />
                      <span className="text-[10px] font-medium truncate w-full text-center">{t.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setThemeColor("custom")}
                    className={`group relative flex flex-col items-center gap-1.5 p-1 rounded-lg border-2 transition-all hover:bg-muted/50 cursor-pointer ${
                      themeColor === "custom" ? "border-primary bg-primary/5" : "border-transparent"
                    }`}
                    title="Custom Color"
                  >
                    <div 
                      className="h-6 w-6 rounded-full shadow-sm group-hover:scale-110 transition-transform relative overflow-hidden" 
                      style={{ backgroundColor: customColor }}
                    >
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value)
                          setThemeColor("custom")
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] font-medium truncate w-full text-center">Custom</span>
                  </button>
                </div>
              </div>

              <Separator />

              {/* Space Effects Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Space Effects</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable Space Effects</Label>
                      <p className="text-xs text-muted-foreground">Animated space background</p>
                    </div>
                    <Button
                      variant={spaceEffectsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleSpaceEffects}
                      className="cursor-pointer"
                    >
                      {spaceEffectsEnabled ? "On" : "Off"}
                    </Button>
                  </div>

                  {spaceEffectsEnabled && (
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Animation Intensity</Label>
                        <p className="text-xs text-muted-foreground">How "spacy" the effects are</p>
                        <RadioGroup
                          value={String(spacyLevel)}
                          onValueChange={v => setSpacyLevel(Number(v))}
                          className="grid grid-cols-5 gap-2"
                        >
                          {[0, 10, 25, 40, 50].map((level) => (
                            <div key={level} className="flex flex-col items-center gap-1">
                              <RadioGroupItem value={String(level)} id={`spacy-${level}`} className="cursor-pointer" />
                              <Label htmlFor={`spacy-${level}`} className="text-xs text-center cursor-pointer">
                                {level === 0
                                  ? "Off"
                                  : level === 10
                                  ? "Low"
                                  : level === 25
                                  ? "Med"
                                  : level === 40
                                  ? "High"
                                  : "Max"}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-4 pt-2">
                        <Label className="text-sm font-medium">Nebula Intensity</Label>
                        <p className="text-xs text-muted-foreground -mt-2">Enable or adjust cosmic glow</p>
                        <div className="grid grid-cols-4 gap-2">
                          {[0, 10, 20, 35].map((level) => (
                            <div key={level} className="flex flex-col items-center">
                              <button
                                onClick={() => setNebulaBrightness(level)}
                                className={`w-full py-2 px-1 text-[10px] font-medium rounded-md border transition-all cursor-pointer ${
                                  nebulaBrightness === level
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-muted border-border"
                                }`}
                              >
                                {level === 0 ? "Off" : level === 10 ? "Dim" : level === 20 ? "Mid" : "High"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />

              {/* Font Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Typography</h4>
                </div>
                <div className="space-y-3">
                  <RadioGroup 
                    value={font} 
                    onValueChange={(v) => setFont(v as FontOption)} 
                    className="grid grid-cols-1 gap-2"
                  >
                    <div
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => setFont("ibm-plex-sans")}
                    >
                      <RadioGroupItem value="ibm-plex-sans" id="font-ibm-plex-sans" />
                      <div className="flex items-center gap-2">
                        <div style={{ fontFamily: 'var(--font-ibm-plex-sans)' }}>
                          <Label htmlFor="font-ibm-plex-sans" className="font-medium text-foreground">IBM Plex Sans (Default)</Label>
                          <p className="text-xs text-muted-foreground">Technical, precise, and professional</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => setFont("inter")}
                    >
                      <RadioGroupItem value="inter" id="font-inter" />
                      <div className="flex items-center gap-2">
                        <div style={{ fontFamily: 'var(--font-inter)' }}>
                          <Label htmlFor="font-inter" className="font-medium text-foreground">Inter</Label>
                          <p className="text-xs text-muted-foreground">Standard, modern, and highly readable</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => setFont("verdana")}
                    >
                      <RadioGroupItem value="verdana" id="font-verdana" />
                      <div className="flex items-center gap-2">
                        <div style={{ fontFamily: 'Verdana, sans-serif' }}>
                          <Label htmlFor="font-verdana" className="font-medium">Verdana</Label>
                          <p className="text-xs text-muted-foreground">Highly legible, wide-set sans-serif</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => setFont("roboto-mono")}
                    >
                      <RadioGroupItem value="roboto-mono" id="font-roboto-mono" />
                      <div className="flex items-center gap-2">
                        <div style={{ fontFamily: 'var(--font-roboto-mono)' }}>
                          <Label htmlFor="font-roboto-mono" className="font-medium">Roboto Mono</Label>
                          <p className="text-xs text-muted-foreground">Clear monospace for scientific clarity</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => setFont("opendyslexic")}
                    >
                      <RadioGroupItem value="opendyslexic" id="font-opendyslexic" />
                      <div className="flex items-center gap-2">
                        <div style={{ fontFamily: 'OpenDyslexic, sans-serif' }}>
                          <Label htmlFor="font-opendyslexic" className="font-medium">OpenDyslexic</Label>
                          <p className="text-xs text-muted-foreground">Designed for readability</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="learn-more" className="space-y-4 mt-4">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                  <img src="/favicon.svg" alt="Scorpio Logo" className="h-6 w-6" />
                </div>
                <h3 className="font-inter font-bold tracking-tighter">Scorpio</h3>
                <p className="text-sm text-muted-foreground">Built for Adaptive Learning.</p>
                <p className="text-xs text-muted-foreground">Version 2.0</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button onClick={handleLearnMore} className="w-full cursor-pointer">
                  <Info className="mr-2 h-4 w-4" />
                  Learn More About Scorpio
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/contact")
                    setOpen(false)
                  }}
                  className="w-full cursor-pointer"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact & Support
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/privacy")
                    setOpen(false)
                  }}
                  className="w-full cursor-pointer"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy Policy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/terms")
                    setOpen(false)
                  }}
                  className="w-full cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Terms of Service
                </Button>
              </div>

              <Separator />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Made by{" "}
                  <a
                    href="https://rushil-m.web.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold hover:underline"
                  >
                    Rushil Mahadevu
                  </a>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Email Change Dialog */}
      <Dialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address below. You'll need to verify this change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailChangeOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleEmailChange} disabled={!newEmail.trim()} className="cursor-pointer">
                Update Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
