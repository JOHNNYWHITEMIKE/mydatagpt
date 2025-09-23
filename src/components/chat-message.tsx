'use client';

import type { Message } from './chat-interface';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatMessage({ message }: { message: Message }) {
  const isBot = message.sender === 'bot';

  if (message.isTyping) {
    return (
      <div className="flex items-start gap-4 p-4 rounded-lg">
        <Avatar className="w-8 h-8">
           <AvatarFallback className="bg-primary/20">
             <Bot className="w-5 h-5 text-primary" />
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
        'w-full',
        isBot ? 'bg-transparent' : 'bg-transparent'
      )}
    >
      <div className='flex items-start gap-4 p-4 rounded-lg hover:bg-card/50'>
        <Avatar className="w-8 h-8">
          <AvatarFallback
            className={cn(
              isBot ? 'bg-primary/20' : 'bg-secondary'
            )}
          >
            {isBot ? <Bot className="w-5 h-5 text-primary" /> : <User className="w-5 h-5" />}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'flex-1 pt-0.5'
          )}
        >
          <div className="text-sm text-current whitespace-pre-wrap">{message.text}</div>
        </div>
      </div>
    </div>
  );
}
