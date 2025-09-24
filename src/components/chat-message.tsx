'use client';

import type { Message } from './chat-interface';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

const BotIcon = () => (
    <Bot className="w-6 h-6" />
)

const UserIcon = () => (
    <User className="w-6 h-6" />
)

export function ChatMessage({ message }: { message: Message }) {
  const isBot = message.sender === 'bot';

  if (message.isTyping) {
    return (
      <div className="flex items-start gap-4">
        <Avatar className="w-10 h-10 bg-primary text-primary-foreground">
           <AvatarFallback className="bg-transparent">
             <BotIcon />
           </AvatarFallback>
         </Avatar>
        <div className="flex items-center gap-2 pt-3">
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-start gap-4'>
      <Avatar className={cn(
        "w-10 h-10",
         isBot ? "bg-primary text-primary-foreground" : "bg-gray-700 text-white"
      )}>
        <AvatarFallback className="bg-transparent text-lg font-bold">
          {isBot ? <BotIcon /> : 'You'}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 pt-2'>
        <div className="text-base text-current whitespace-pre-wrap leading-relaxed">{message.text}</div>
      </div>
    </div>
  );
}
