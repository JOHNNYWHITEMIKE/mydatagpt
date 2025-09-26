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

const BotIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 41 41"
        fill="none"
    >
        <path
            d="M35.213 18.283C35.213 17.133 35.035 16.033 34.724 14.983C34.619 14.65 34.357 14.388 34.024 14.283L31.815 13.578C31.576 13.504 31.304 13.578 31.126 13.756L29.611 15.271C29.339 15.543 28.932 15.617 28.599 15.471C25.688 14.249 23.072 11.633 21.85 8.722C21.704 8.389 21.778 7.982 22.05 7.71L23.565 6.195C23.743 6.017 23.817 5.745 23.743 5.506L23.038 3.297C22.933 2.964 22.671 2.702 22.338 2.597C21.288 2.286 20.188 2.108 19.038 2.108C17.888 2.108 16.788 2.286 15.738 2.597C15.405 2.702 15.143 2.964 15.038 3.297L14.333 5.506C14.259 5.745 14.333 6.017 14.511 6.195L16.026 7.71C16.298 7.982 16.372 8.389 16.226 8.722C15.004 11.633 12.388 14.249 9.477 15.471C9.144 15.617 8.737 15.543 8.465 15.271L6.95 13.756C6.772 13.578 6.5 13.504 6.261 13.578L4.052 14.283C3.719 14.388 3.457 14.65 3.352 14.983C3.041 16.033 2.863 17.133 2.863 18.283C2.863 19.433 3.041 20.533 3.352 21.583C3.457 21.916 3.719 22.178 4.052 22.283L6.261 22.988C6.5 23.062 6.772 22.988 6.95 22.81L8.465 21.295C8.737 21.023 9.144 20.949 9.477 21.095C12.388 22.317 15.004 24.933 16.226 27.844C16.372 28.177 16.298 28.584 16.026 28.856L14.511 30.371C14.333 30.549 14.259 30.821 14.333 31.06L15.038 33.269C15.143 33.602 15.405 33.864 15.738 33.969C16.788 34.28 17.888 34.458 19.038 34.458C20.188 34.458 21.288 34.28 22.338 33.969C22.671 33.864 22.933 33.602 23.038 33.269L23.743 31.06C23.817 30.821 23.743 30.549 23.565 30.371L22.05 28.856C21.778 28.584 21.704 28.177 21.85 27.844C23.072 24.933 25.688 22.317 28.599 21.095C28.932 20.949 29.339 21.023 29.611 21.295L31.126 22.81C31.304 22.988 31.576 23.062 31.815 22.988L34.024 22.283C34.357 22.178 34.619 21.916 34.724 21.583C35.035 20.533 35.213 19.433 35.213 18.283ZM20.738 24.928C20.949 24.717 21.246 24.602 21.557 24.602C21.868 24.602 22.165 24.717 22.376 24.928C22.587 25.139 22.702 25.436 22.702 25.747C22.702 26.058 22.587 26.355 22.376 26.566C22.165 26.777 21.868 26.892 21.557 26.892C21.246 26.892 20.949 26.777 20.738 26.566C20.527 26.355 20.412 26.058 20.412 25.747C20.412 25.436 20.527 25.139 20.738 24.928ZM14.814 24.928C15.025 24.717 15.322 24.602 15.633 24.602C15.944 24.602 16.241 24.717 16.452 24.928C16.663 25.139 16.778 25.436 16.778 25.747C16.778 26.058 16.663 26.355 16.452 26.566C16.241 26.777 15.944 26.892 15.633 26.892C15.322 26.892 15.025 26.777 14.814 26.566C14.603 26.355 14.488 26.058 14.488 25.747C14.488 25.436 14.603 25.139 14.814 24.928Z"
            fill="white"
        ></path>
        <path
            d="M38.076 38.076L36.002 36.002"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
        ></path>
    </svg>
)


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
    // This is a placeholder. In a real app, you would have actual authentication logic.
    // For now, we just simulate a successful login to proceed.
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
            <Button onClick={handleLogin} className="w-full" disabled={!hasCameraPermission}>
              Authenticate with Face
            </Button>
          </div>
        )
      case 'pin':
        return (
            <div className="space-y-4">
                <Input type="password" placeholder="Enter your PIN" className="text-center text-lg tracking-[0.5em]" maxLength={6} />
                <Button onClick={handleLogin} className="w-full">
                    <KeyRound className="mr-2 h-4 w-4" /> Unlock with PIN
                </Button>
            </div>
        )
      case 'phrase':
        return (
            <div className="space-y-4">
                <Input type="password" placeholder="Enter your secret phrase" />
                <Button onClick={handleLogin} className="w-full">
                    <Fingerprint className="mr-2 h-4 w-4" /> Access with Phrase
                </Button>
            </div>
        )
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-sm p-8 space-y-6 text-center rounded-lg border bg-card shadow-lg">
        <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                 <BotIcon />
            </div>
        </div>
        <h1 className="text-2xl font-bold">Welcome to ChatGPT</h1>
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
