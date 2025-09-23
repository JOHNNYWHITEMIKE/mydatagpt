'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { handleQuery } from '@/app/actions';
import { ChatMessage } from './chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BackupPrompt } from '@/components/backup-prompt';

export type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string | React.ReactNode;
  isTyping?: boolean;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
        { id: 0, sender: 'bot', text: 'Authentication successful. How can I assist you?' },
      ]);
  }, []);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage, { id: Date.now() + 1, sender: 'bot', text: '', isTyping: true }]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await handleQuery({
        query: input,
        encryptedResources: [],
      });

      const botMessage: Message = {
        id: Date.now() + 2,
        sender: 'bot',
        text: result.relevantData,
      };

      setMessages(prev => prev.filter(m => !m.isTyping).concat(botMessage));
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now() + 2,
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen">
       {/* <BackupPrompt /> */}

      <div className="flex-1 flex flex-col items-center bg-background">
        <ScrollArea className="flex-1 w-full" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto px-4">
            {messages.length === 1 && (
              <div className="flex flex-col items-center text-center pt-20 pb-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground">Your Private Vault</h1>
              </div>
            )}
            <div className="flex flex-col gap-2 pb-6">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="w-full max-w-3xl p-4 sticky bottom-0 bg-gradient-to-t from-background to-transparent">
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about your data..."
                  className="pr-12 h-12 pt-3 resize-none bg-card border-border shadow-lg"
                  onKeyDown={handleTextareaKeyDown}
                  disabled={isLoading}
                  rows={1}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary/80 hover:bg-primary">
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
              </form>
               <p className="text-xs text-center text-muted-foreground pt-3 px-10">
                  All data is end-to-end encrypted. Only you can access your information.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
