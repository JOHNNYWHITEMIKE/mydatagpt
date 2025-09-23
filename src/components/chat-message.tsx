'use client';

import type { Message } from './chat-interface';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatMessage({ message }: { message: Message }) {
  const isBot = message.sender === 'bot';

  if (message.isTyping) {
    return (
      <div className="flex items-start gap-4">
        <Avatar className="w-8 h-8 border">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 pt-2">
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4',
        !isBot && 'flex-row-reverse'
      )}
    >
      <Avatar className="w-8 h-8 border">
        <AvatarFallback
          className={cn(
            isBot ? 'bg-primary text-primary-foreground' : 'bg-card'
          )}
        >
          {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'p-4 rounded-lg max-w-[75%] shadow-md',
          isBot ? 'bg-card' : 'bg-primary text-primary-foreground'
        )}
      >
        <div className="text-sm text-current whitespace-pre-wrap">{message.text}</div>
      </div>
    </div>
  );
}
