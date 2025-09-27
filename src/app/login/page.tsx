"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";

const BotIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M15 7h2a5 5 0 0 1 0 10h-2m-8 0H5a5 5 0 0 1 0-10h2m-4 5h14m-9-5V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-6 10v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2" />
    </svg>
)


export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // This is a placeholder. In a real app, you would have actual authentication logic.
    // For now, we just simulate a successful login to proceed.
    if (typeof window !== "undefined") {
      localStorage.setItem("isAuthenticated", "true");
    }
    router.push("/");
  };
  
  const renderAuthMethod = () => {
    return (
        <div className="space-y-4">
            <Input type="password" placeholder="Enter your PIN" className="text-center text-lg tracking-[0.5em]" maxLength={6} />
            <Button onClick={handleLogin} className="w-full">
                <KeyRound className="mr-2 h-4 w-4" /> Unlock with PIN
            </Button>
        </div>
    )
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-sm p-8 space-y-6 text-center rounded-lg border bg-card shadow-lg">
        <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                 <BotIcon />
            </div>
        </div>
        <h1 className="text-2xl font-bold">Welcome to MyDataGPT</h1>
        <p className="text-muted-foreground">
          Enter your PIN to access your secure vault.
        </p>

        <div className="pt-2">
            {renderAuthMethod()}
        </div>
        
      </div>
    </div>
  );
}
