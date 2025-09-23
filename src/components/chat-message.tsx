'use client';

import type { Message } from './chat-interface';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function ChatMessage({ message }: { message: Message }) {
  const isBot = message.sender === 'bot';

  if (message.isTyping) {
    return (
      <div className="flex items-start gap-4">
        <Avatar className="w-8 h-8">
           <AvatarFallback className="bg-[#19c37d]">
             <Bot className="w-5 h-5 text-white" />
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
        isBot ? 'bg-card' : 'bg-transparent'
      )}
    >
      <div className='flex items-start gap-4 p-4 max-w-4xl mx-auto'>
        <Avatar className="w-8 h-8">
          <AvatarFallback
            className={cn(
              isBot ? 'bg-[#19c37d]' : 'bg-primary'
            )}
          >
            {isBot ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5" />}
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
