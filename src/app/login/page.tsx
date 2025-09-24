"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Fingerprint } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [authMethod, setAuthMethod] = useState<'face' | 'pin' | 'phrase'>('face');

  useEffect(() => {
    if (authMethod !== 'face') {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        return;
    }

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions to use Face Authentication.",
        });
      }
    };

    getCameraPermission();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };

  }, [authMethod, toast]);

  const handleLogin = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isAuthenticated", "true");
    }
    router.push("/");
  };
  
  const renderAuthMethod = () => {
    switch(authMethod) {
      case 'face':
        return (
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-md bg-muted overflow-hidden border">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/80">
                        <Alert variant="destructive" className="max-w-sm">
                          <AlertTitle>Camera Access Required</AlertTitle>
                          <AlertDescription>
                            Please allow camera access to use this feature.
                          </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
            <Button onClick={handleLogin} className="w-full" variant="outline" disabled={!hasCameraPermission}>
              Authenticate with Face
            </Button>
          </div>
        )
      case 'pin':
        return (
            <div className="space-y-4">
                <Input type="password" placeholder="Enter your PIN" className="text-center" maxLength={6} />
                <Button onClick={handleLogin} className="w-full" variant="outline">
                    <KeyRound className="mr-2 h-4 w-4" /> Unlock with PIN
                </Button>
            </div>
        )
      case 'phrase':
        return (
            <div className="space-y-4">
                <Input type="password" placeholder="Enter your secret phrase" />
                <Button onClick={handleLogin} className="w-full" variant="outline">
                    <Fingerprint className="mr-2 h-4 w-4" /> Access with Phrase
                </Button>
            </div>
        )
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-sm p-8 space-y-6 text-center rounded-lg border bg-card">
        <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            </div>
        </div>
        <h1 className="text-2xl font-bold">Welcome to MyDataGPT</h1>
        <p className="text-muted-foreground">
          Choose your authentication method to access your secure vault.
        </p>

        <div className="pt-2">
            {renderAuthMethod()}
        </div>
        
        <div className="flex justify-center gap-2 pt-4">
            <Button variant="ghost" size="sm" onClick={() => setAuthMethod('face')} className={authMethod === 'face' ? 'bg-muted' : ''}>Face</Button>
            <Button variant="ghost" size="sm" onClick={() => setAuthMethod('pin')} className={authMethod === 'pin' ? 'bg-muted' : ''}>PIN</Button>
            <Button variant="ghost" size="sm" onClick={() => setAuthMethod('phrase')} className={authMethod === 'phrase' ? 'bg-muted' : ''}>Phrase</Button>
        </div>
      </div>
    </div>
  );
}
