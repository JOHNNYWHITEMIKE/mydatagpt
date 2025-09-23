'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { handleQuery } from '@/app/actions';
import { ChatMessage } from './chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';


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
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
        { id: 0, sender: 'bot', text: 'How can I help you today?' },
      ]);
  }, []);
  
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    const currentMessages = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage, { id: Date.now() + 1, sender: 'bot', text: '', isTyping: true }]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForAI = currentMessages.slice(1).map(msg => ({
        sender: msg.sender,
        text: msg.text as string // Assuming text is always string for AI history
      }));

      const result = await handleQuery({
        query: input,
        history: historyForAI,
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
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 flex flex-col items-center">
        <ScrollArea className="flex-1 w-full" viewportRef={viewportRef}>
          <div className="max-w-3xl mx-auto px-4">
            {messages.length === 1 && (
              <div className="flex flex-col items-center text-center pt-20 pb-12">
                  <h1 className="text-4xl font-bold text-foreground">ChatGPT</h1>
              </div>
            )}
            <div className="flex flex-col gap-4 py-6">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="w-full max-w-3xl p-4 sticky bottom-0 bg-background">
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Message ChatGPT..."
                  className="pr-12 h-12 pt-3 resize-none bg-card border-border shadow-lg focus-visible:ring-1 focus-visible:ring-ring"
                  onKeyDown={handleTextareaKeyDown}
                  disabled={isLoading}
                  rows={1}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-foreground hover:bg-foreground/80">
                        <Send className="w-5 h-5 text-background" />
                    </Button>
                </div>
              </form>
               <p className="text-xs text-center text-muted-foreground pt-3 px-10">
                  ChatGPT can make mistakes. Consider checking important information.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
