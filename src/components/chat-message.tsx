'use client';

import type { Message } from './chat-interface';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

export function ChatMessage({ message }: { message: Message }) {
  const isBot = message.sender === 'bot';

  if (message.isTyping) {
    return (
      <div className="flex items-start gap-4 p-4">
        <Avatar className="w-8 h-8">
           <AvatarFallback className="bg-foreground">
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
    <div
      className={cn(
        'w-full',
        isBot ? 'bg-transparent' : 'bg-secondary/50'
      )}
    >
      <div className='flex items-start gap-4 p-4'>
        <Avatar className="w-8 h-8">
          <AvatarFallback
            className={cn(
              isBot ? 'bg-foreground' : 'bg-transparent'
            )}
          >
            {isBot ? <BotIcon /> : <UserIcon />}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'flex-1 pt-1'
          )}
        >
          <div className="text-sm text-current whitespace-pre-wrap">{message.text}</div>
        </div>
      </div>
    </div>
  );
}
