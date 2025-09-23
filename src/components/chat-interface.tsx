'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Paperclip, Send, ShieldCheck, HardDriveUpload } from 'lucide-react';
import { handleQuery, getUploadSuggestions } from '@/app/actions';
import { ChatMessage } from './chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string | React.ReactNode;
  isTyping?: boolean;
};

const DUMMY_RESOURCES = [
  'contacts.json',
  'photos_archive.zip',
  'documents_2024.docx',
  'financial_records.csv',
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setMessages([
        { id: 0, sender: 'bot', text: 'Hello! How can I help you with your secured data today?' },
      ]);
      try {
        const result = await getUploadSuggestions({ knownInformation: '' });
        const suggestions = result.suggestedDataTypes.split(',').map(s => s.trim());
        const suggestionMessage = (
          <div>
            <p className="mb-2">To get started, you can upload some data. Here are some suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button key={index} variant="outline" size="sm" className="bg-background/50">
                  <HardDriveUpload className="w-4 h-4 mr-2" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        );
        setMessages(prev => [
            ...prev,
            { id: Date.now(), sender: 'bot', text: suggestionMessage }
        ]);
      } catch (error) {
        console.error("Failed to get suggestions:", error);
        setMessages(prev => [
          ...prev,
          { id: Date.now(), sender: 'bot', text: 'I can help you search through your documents, photos, and more.' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
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
        encryptedResources: DUMMY_RESOURCES,
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b">
        <ShieldCheck className="w-8 h-8 mr-3 text-primary" />
        <h1 className="text-xl font-bold">MyDataGPT</h1>
      </header>
      
      <main className="flex-1 flex min-h-0">
        <div className="w-1/4 p-4 border-r hidden md:block">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Secured Files</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {DUMMY_RESOURCES.map((file, i) => (
                            <li key={i} className="flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                                <span>{file}</span>
                            </li>
                        ))}
                    </ul>
                    <Button className="w-full mt-4" variant="outline">
                        <HardDriveUpload className="w-4 h-4 mr-2" />
                        Upload New File
                    </Button>
                </CardContent>
            </Card>
        </div>
        <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="flex flex-col gap-6">
                {messages.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about your data..."
                  className="pr-24 h-12 pt-3 resize-none bg-card"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                  rows={1}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
                    <Button type="button" size="icon" variant="ghost" disabled={isLoading}>
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
              </form>
            </div>
        </div>
      </main>
    </div>
  );
}
