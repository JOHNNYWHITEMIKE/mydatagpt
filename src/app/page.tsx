"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';
import { BackupPrompt } from '@/components/backup-prompt';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a static export, localStorage is only available on the client.
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      router.replace("/login");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <ChatInterface />
      <BackupPrompt />
    </>
  );
}
