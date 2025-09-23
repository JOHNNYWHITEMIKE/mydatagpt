"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Scanning...");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate scanning process
    const timer1 = setTimeout(() => {
      setStatus("Authenticating...");
    }, 2000);

    const timer2 = setTimeout(() => {
      setStatus("Authentication Successful");
      setAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem("isAuthenticated", "true");
      }
    }, 4000);

    const timer3 = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 text-center">
        <div className="flex justify-center">
          <ShieldCheck className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">MyDataGPT</h1>
        <p className="text-muted-foreground">Secure Facial Authentication</p>
        
        <div className="relative w-64 h-64 mx-auto overflow-hidden border-4 rounded-full border-primary/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="w-32 h-32 text-muted-foreground/50" />
          </div>
          {!authenticated && (
            <div className="absolute top-0 w-full h-1 bg-accent animate-scan"></div>
          )}
          {authenticated && (
             <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <ShieldCheck className="w-24 h-24 text-green-500"/>
             </div>
          )}
        </div>

        <p className="text-lg font-medium text-foreground">{status}</p>
        <p className="text-sm text-muted-foreground">
          {status === "Scanning..." ? "Position your face within the frame." : "Please wait..."}
        </p>

        {authenticated && (
            <Button onClick={() => router.push('/')}>Continue to App</Button>
        )}
      </div>
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(16rem); }
        }
        .animate-scan {
          animation: scan 2s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}
