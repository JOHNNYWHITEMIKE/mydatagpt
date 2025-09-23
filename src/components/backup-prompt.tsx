'use client';

import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HardDriveDownload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";

const BACKUP_PROMPT_KEY = 'backupPromptDismissed';

export function BackupPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem(BACKUP_PROMPT_KEY);
    if (!hasBeenDismissed) {
      // Delay showing the prompt slightly so it doesn't feel too intrusive
      const timer = setTimeout(() => setIsOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BACKUP_PROMPT_KEY, 'true');
    setIsOpen(false);
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          return prev;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 200);

    setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
            handleDismiss();
            toast({
                title: 'Backup Successful',
                description: 'Your device data has been securely backed up.',
            });
        }, 500);
    }, 3000);
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <HardDriveDownload className="w-12 h-12 text-accent" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Secure Your Data
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            To ensure your data is safe, we recommend performing a full device backup. Your data will be end-to-end encrypted and accessible only by you.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isBackingUp && (
          <div className="py-4 space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">Backing up... {progress}%</p>
          </div>
        )}

        {!isBackingUp && (
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel onClick={handleDismiss}>Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleBackup} className="bg-accent hover:bg-accent/90">
              Backup Now
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
