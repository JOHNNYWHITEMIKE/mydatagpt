'use client';

import type { Message } from './chat-interface';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Shield, User } from 'lucide-react';

const BotIcon = () => (
    <Shield className="w-5 h-5" />
)

const UserIcon = () => (
    <User className="w-5 h-5" />
)

export function ChatMessage({ message }: { message: Message }) {
  const isBot = message.sender === 'bot';

  if (message.isTyping) {
    return (
      <div className="flex items-start gap-4">
        <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
           <AvatarFallback className="bg-transparent">
             <BotIcon />
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
    <div className='flex items-start gap-4'>
      <Avatar className={cn(
        "w-8 h-8",
         isBot ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        <AvatarFallback className="bg-transparent">
          {isBot ? <BotIcon /> : <UserIcon />}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 pt-1'>
        <div className="text-sm text-current whitespace-pre-wrap">{message.text}</div>
      </div>
    </div>
  );
}
