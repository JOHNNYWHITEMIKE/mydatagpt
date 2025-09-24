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
    // This resets the chat to its initial state every time the component mounts,
    // simulating the "Ollama database reset"
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
    
    // Filter out initial welcome message and typing indicators for history
    const currentHistory = messages.filter(m => m.id !== 0 && !m.isTyping).map(msg => ({
      sender: msg.sender,
      // Ensure history text is a string
      text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
    }));

    const historyForAI = [...currentHistory, {
        sender: userMessage.sender,
        text: userMessage.text as string
    }];
    
    if (input.trim().toLowerCase() === 'clear') {
        setMessages([ { id: 0, sender: 'bot', text: 'How can I help you today?' } ]);
        setInput('');
        return;
    }

    setMessages(prev => [...prev, userMessage, { id: Date.now() + 1, sender: 'bot', text: '', isTyping: true }]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await handleQuery({
        query: input,
        history: historyForAI,
      });

      if (result.relevantData === 'CLEAR_SCREEN') {
         setMessages([ { id: 0, sender: 'bot', text: 'How can I help you today?' } ]);
      } else if (result.relevantData === 'EXIT_SESSION') {
         setMessages([ { id: 0, sender: 'bot', text: 'Session ended. How can I help you today?' } ]);
      }
      else {
        const botMessage: Message = {
          id: Date.now() + 2,
          sender: 'bot',
          text: result.relevantData,
        };
        setMessages(prev => prev.filter(m => !m.isTyping).concat(botMessage));
      }

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
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 flex flex-col items-center">
        <ScrollArea className="flex-1 w-full" viewportRef={viewportRef}>
          <div className="max-w-3xl mx-auto px-4">
            {messages.length === 1 && messages[0].id === 0 ? (
              <div className="flex flex-col items-center text-center pt-20 pb-12">
                   <div className="p-4 bg-primary/10 rounded-full mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                   </div>
                  <h1 className="text-4xl font-bold text-foreground">MyDataGPT</h1>
                  <p className="text-muted-foreground mt-2">Your secure, private data vault.</p>
              </div>
            ) : null}
            <div className="flex flex-col gap-4 py-6">
              {messages.map(msg => (
                msg.id !== 0 && <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="w-full max-w-3xl p-4 sticky bottom-0 bg-background/80 backdrop-blur-sm">
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Message MyDataGPT..."
                  className="pr-12 h-12 pt-3 resize-none bg-card border-border shadow-lg focus-visible:ring-1 focus-visible:ring-ring"
                  onKeyDown={handleTextareaKeyDown}
                  disabled={isLoading}
                  rows={1}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90">
                        <Send className="w-5 h-5 text-primary-foreground" />
                    </Button>
                </div>
              </form>
               <p className="text-xs text-center text-muted-foreground pt-3 px-10">
                  MyDataGPT can make mistakes. Consider checking important information.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
