"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Fingerprint, Bot } from "lucide-react";
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
        // If we switch away from face auth, stop the video stream.
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
    
    // Cleanup function to stop video stream on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };

  }, [authMethod, toast]);

  const handleLogin = () => {
    // Simulate a successful login
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
            <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90" disabled={!hasCameraPermission}>
              Authenticate
            </Button>
          </div>
        )
      case 'pin':
        return (
            <div className="space-y-4">
                <Input type="password" placeholder="Enter your PIN" className="text-center" maxLength={6} />
                <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90">
                    <KeyRound className="mr-2 h-4 w-4" /> Unlock
                </Button>
            </div>
        )
      case 'phrase':
        return (
            <div className="space-y-4">
                <Input type="password" placeholder="Enter your secret phrase" />
                <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90">
                    <Fingerprint className="mr-2 h-4 w-4" /> Access Vault
                </Button>
            </div>
        )
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-sm p-8 space-y-6 text-center rounded-lg shadow-2xl bg-card">
        <div className="flex justify-center">
             <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
        </div>
        <h1 className="text-2xl font-bold">Welcome to MyDataGPT</h1>
        <p className="text-muted-foreground">
          {authMethod === 'face' && 'Authenticate to access your secure vault.'}
          {authMethod === 'pin' && 'Enter your secure PIN.'}
          {authMethod === 'phrase' && 'Enter your secret passphrase.'}
        </p>

        <div className="pt-2">
            {renderAuthMethod()}
        </div>
        
        <div className="flex justify-center gap-4 pt-4">
            <Button variant="ghost" size="sm" onClick={() => setAuthMethod('face')} className={authMethod === 'face' ? 'text-primary' : ''}>Face ID</Button>
            <Button variant="ghost" size="sm" onClick={() => setAuthMethod('pin')} className={authMethod === 'pin' ? 'text-primary' : ''}>PIN</Button>
            <Button variant="ghost" size="sm" onClick={() => setAuthMethod('phrase')} className={authMethod === 'phrase' ? 'text-primary' : ''}>Phrase</Button>
        </div>
      </div>
    </div>
  );
}
