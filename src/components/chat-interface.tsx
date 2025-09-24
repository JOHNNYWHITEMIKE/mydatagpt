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

const BotIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
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
                     <BotIcon />
                   </div>
                  <h1 className="text-4xl font-bold text-foreground">ChatGPT</h1>
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
                  placeholder="Message ChatGPT..."
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
                  ChatGPT can make mistakes. Consider checking important information.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
