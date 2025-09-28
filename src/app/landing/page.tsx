"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bot, ShieldCheck, Zap } from "lucide-react";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex flex-col items-center p-6 text-center bg-card rounded-lg shadow-md border">
    <div className="mb-4 text-primary">{icon}</div>
    <h3 className="mb-2 text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">MyDataGPT</h1>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" onClick={() => router.push("/login")}>
            Login
          </Button>
          <Button onClick={() => router.push("/login")}>Get Started</Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Personal Data, Secured and Smart
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    MyDataGPT provides a secure vault for your personal information, accessible through an intelligent chat interface. Your data, your control.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    onClick={() => router.push("/login")}
                    className="w-full min-[400px]:w-auto"
                  >
                    Secure Your Data Now
                  </Button>
                </div>
              </div>
               <div className="flex justify-center">
                 <Bot className="w-48 h-48 text-primary animate-pulse" />
               </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Choose MyDataGPT?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We combine state-of-the-art security with the power of generative AI to give you a unique and powerful way to manage your personal data.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <FeatureCard 
                icon={<ShieldCheck size={48} />}
                title="End-to-End Encryption"
                description="Your data is encrypted on your device and stays that way. Only you can access it."
              />
              <FeatureCard 
                icon={<Bot size={48} />}
                title="Intelligent Chat"
                description="Interact with your data naturally. Ask questions, give commands, and get insights in seconds."
              />
              <FeatureCard 
                icon={<Zap size={48} />}
                title="Private & Secure"
                description="Runs entirely locally on your device or your own private server. No third-party data access."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MyDataGPT. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
