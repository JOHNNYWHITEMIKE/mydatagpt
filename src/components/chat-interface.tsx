'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Settings } from 'lucide-react';
import { handleQuery } from '@/app/actions';
import { ChatMessage } from './chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        { id: 0, sender: 'bot', text: 'Hello! How can I help you with your secured data today?' },
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
        encryptedResources: [], // Not showing resources anymore
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
      {/* Sidebar - Hidden for now to focus on chat, can be re-added */}
      {/* <div className="w-64 bg-gray-900 p-4">...</div> */}

      <div className="flex-1 flex flex-col items-center">
        <header className="w-full max-w-4xl p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">MyDataGPT</h1>
            <div>
                <Button variant="ghost" size="icon"><Plus /></Button>
                <Button variant="ghost" size="icon"><Settings /></Button>
            </div>
        </header>

        <ScrollArea className="flex-1 w-full" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col gap-6 py-6">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="w-full max-w-4xl p-4 sticky bottom-0 bg-background">
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
               <p className="text-xs text-center text-muted-foreground pt-2">
                  MyDataGPT can make mistakes. Consider checking important information.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
