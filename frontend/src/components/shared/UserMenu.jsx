"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Settings, LogOut, HelpCircle, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu({ user, onLogout, onSettings, className }) {
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  const handlePremiumClick = () => {
    setShowPremiumDialog(true);
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("relative h-9 w-9 rounded-full", className)}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handlePremiumClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePremiumClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePremiumClick}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help</span>
            <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Premium Dialog */}
    <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
      <DialogContent className="glass dark:glass-dark border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            Premium Feature
          </DialogTitle>
          <DialogDescription className="text-base pt-4">
            This feature is only available for Premium users.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="glass-card p-4 border border-yellow-500/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Upgrade to Premium
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get access to advanced features including custom profiles, advanced settings, priority support, and much more!
            </p>
            <Button
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0"
              onClick={() => setShowPremiumDialog(false)}
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
