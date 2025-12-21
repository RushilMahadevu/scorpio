"use client"

import * as React from "react"
import { Moon, Sun, Sparkles, User, LogOut, Settings as SettingsIcon, Palette, Info } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
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
import { useAuth } from "@/contexts/auth-context"
import { logout } from "@/lib/firebase"

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
  const { user, role } = useAuth()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [showNote, setShowNote] = React.useState(false)

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

  const getInitials = (name: string | null | undefined, email?: string | null) => {
    // First try display name
    if (name && typeof name === 'string' && name.trim()) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    
    // Then try email
    if (email && typeof email === 'string' && email.trim()) {
      const emailName = email.split("@")[0]
      if (emailName) {
        // If email has dots (like first.last), use those initials
        if (emailName.includes(".")) {
          return emailName.split(".").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        } else {
          // Otherwise use first 2 characters
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6" />
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
            <TabsTrigger value="account" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="learn-more" className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span className="hidden sm:inline">Learn More</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 mt-4">
            <div className="space-y-4">
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

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Account Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

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
                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                      <RadioGroupItem value="dark" id="dark-theme" />
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        <div>
                          <Label htmlFor="dark-theme" className="font-medium">Dark</Label>
                          <p className="text-xs text-muted-foreground">Perfect for late-night studying</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">(Recommended)</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                      <RadioGroupItem value="light" id="light-theme" />
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <div>
                          <Label htmlFor="light-theme" className="font-medium">Light</Label>
                          <p className="text-xs text-muted-foreground">Classic bright interface</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
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
                              <RadioGroupItem value={String(level)} id={`spacy-${level}`} />
                              <Label htmlFor={`spacy-${level}`} className="text-xs text-center">
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Nebula Brightness</Label>
                        <p className="text-xs text-muted-foreground">Background glow intensity</p>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min={0}
                            max={25}
                            value={nebulaBrightness}
                            onChange={e => setNebulaBrightness(Number(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Subtle</span>
                            <span>{nebulaBrightness}</span>
                            <span>Bright</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                <h3 className="font-semibold">Scorpio</h3>
                <p className="text-sm text-muted-foreground">Built for Sage Ridge School.</p>
                <p className="text-xs text-muted-foreground">Version 2.0</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button onClick={handleLearnMore} className="w-full">
                  <Info className="mr-2 h-4 w-4" />
                  Learn More About Scorpio
                </Button>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-xs text-muted-foreground font-bold">
                    Made by Rushil Mahadevu
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}