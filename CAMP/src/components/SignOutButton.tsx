"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      // Clear all auth cookies first
      await supabase.auth.signOut({ scope: 'local' });
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      // Clear any local storage or cookies
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      // Force a hard navigation to sign-in page
      window.location.replace("/auth/signin");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={loading}
      variant="ghost"
      className="text-gray-700 hover:text-green-700 hover:bg-green-50"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Signing out...
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  );
}