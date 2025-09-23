"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ShieldCheck, User, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState("Initializing...");
  const [authenticated, setAuthenticated] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        setStatus("Camera not supported");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setStatus("Scanning...");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setStatus("Camera access denied");
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings to continue.",
        });
      }
    };

    getCameraPermission();
  }, [toast]);

  useEffect(() => {
    if (hasCameraPermission) {
      const timer1 = setTimeout(() => {
        setStatus("Authenticating...");
      }, 2500);

      const timer2 = setTimeout(() => {
        setStatus("Authentication Successful");
        setAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem("isAuthenticated", "true");
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
      }, 4500);

      const timer3 = setTimeout(() => {
        router.push("/");
      }, 5500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [hasCameraPermission, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <ShieldCheck className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Private Vault</h1>
        <p className="text-muted-foreground">Secure Biometric Authentication</p>
        
        <div className="relative w-64 h-64 mx-auto overflow-hidden rounded-full border-4 border-primary/50 bg-card">
          <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
          
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-background/90">
                <CameraOff className="w-20 h-20 text-muted-foreground/50" />
                 <p className="text-sm text-muted-foreground">Camera is required</p>
            </div>
          )}

          {!authenticated && hasCameraPermission && (
            <div className="absolute top-0 w-full h-2 bg-accent animate-scan"></div>
          )}

          {authenticated && (
             <div className="absolute inset-0 flex items-center justify-center bg-background/90">
                <ShieldCheck className="w-24 h-24 text-green-500 animate-pulse"/>
             </div>
          )}
        </div>

        <p className="text-lg font-medium text-foreground">{status}</p>
        
        {hasCameraPermission === false && (
             <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access in your browser settings to use this feature.
                </AlertDescription>
            </Alert>
        )}

        {authenticated && (
            <Button onClick={() => router.push('/')}>Enter Vault</Button>
        )}
      </div>
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-0.5rem); }
          100% { transform: translateY(16rem); }
        }
        .animate-scan {
          animation: scan 2s infinite alternate ease-in-out;
          box-shadow: 0 0 10px hsl(var(--accent)), 0 0 20px hsl(var(--accent));
        }
      `}</style>
    </div>
  );
}
