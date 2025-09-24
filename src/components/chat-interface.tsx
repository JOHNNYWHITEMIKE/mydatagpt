'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
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
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start with an initial bot message to guide the user
    setMessages([
        { id: Date.now(), sender: 'bot', text: 'How can I help you today?' }
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
    
    const currentHistory = messages.filter(m => !m.isTyping).map(msg => ({
      sender: msg.sender,
      text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
    }));

    const historyForAI = [...currentHistory, {
        sender: userMessage.sender,
        text: userMessage.text as string
    }];
    
    if (input.trim().toLowerCase() === 'clear') {
        setMessages([{ id: Date.now(), sender: 'bot', text: 'How can I help you today?' }]);
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
         setMessages([{ id: Date.now(), sender: 'bot', text: 'How can I help you today?' }]);
      } else if (result.relevantData === 'EXIT_SESSION') {
         setMessages([{ id: Date.now(), sender: 'bot', text: 'Session ended.' }]);
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
          <div className="max-w-3xl mx-auto px-4 w-full">
            {messages.length <= 1 ? (
              <div className="flex flex-col items-center text-center pt-20 pb-12">
                   <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                   </div>
                  <h1 className="text-4xl font-bold text-foreground">MyDataGPT</h1>
              </div>
            ) : null}
            <div className="flex flex-col gap-6 py-6">
              {messages.map((msg, index) => (
                // Don't render the initial 'how can i help' if there are more messages
                (messages.length > 1 && index === 0) ? null : <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="w-full max-w-3xl p-4 sticky bottom-0 bg-transparent backdrop-blur-sm">
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Message MyDataGPT..."
                  className="pr-12 h-14 pt-4 resize-none bg-card border-border shadow-lg focus-visible:ring-1 focus-visible:ring-ring text-base"
                  onKeyDown={handleTextareaKeyDown}
                  disabled={isLoading}
                  rows={1}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90 h-10 w-10">
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
