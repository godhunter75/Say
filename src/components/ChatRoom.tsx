import React, { useState, useRef, useEffect } from "react";
import { Send, LogOut, Info, RefreshCw, FastForward } from "lucide-react";
import { ChatMessage } from "../shared/types";
import { cn } from "../lib/utils";

interface ChatRoomProps {
  socketContext: {
    socket: any;
    messages: ChatMessage[];
    partnerLeft: boolean;
    isPartnerTyping: boolean;
    sendMessage: (text: string) => void;
    sendTyping: () => void;
    sendStopTyping: () => void;
    leaveChat: () => void;
    findPartner: () => void;
  };
}

export function ChatRoom({ socketContext }: ChatRoomProps) {
  const { socket, messages, partnerLeft, isPartnerTyping, sendMessage, sendTyping, sendStopTyping, leaveChat, findPartner } = socketContext;
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, partnerLeft, isPartnerTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (!partnerLeft) {
      sendTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping();
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !partnerLeft) {
      sendMessage(text.trim());
      setText("");
      sendStopTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="w-full h-[100dvh] max-w-2xl mx-auto flex flex-col bg-[#141414] sm:h-[80vh] sm:rounded-3xl sm:shadow-lg sm:border sm:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="h-16 px-4 border-b border-neutral-800 flex items-center justify-between bg-[#141414] shrink-0 z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400">
            <span className="font-medium text-sm">S</span>
          </div>
          <div>
            <h2 className="font-medium text-white leading-tight">Stranger</h2>
            <p className="text-xs text-neutral-400">
              {partnerLeft ? "Disconnected" : "Connected"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={findPartner}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-white transition-colors rounded-full"
            title="Skip to next person"
          >
            <FastForward size={14} className="translate-y-[0.5px]" />
            Skip
          </button>
          <button
            onClick={leaveChat}
            className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-full hover:bg-neutral-800"
            title="Leave completely"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0a0a0a] relative" ref={scrollRef}>
        <div className="flex items-center justify-center p-4">
          <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-3 py-1 rounded-full font-medium tracking-wide flex items-center gap-2">
            <Info size={14} />
            You're now chatting with a random stranger
          </div>
        </div>
        
        {messages.map((msg) => {
          const isMe = msg.senderId === socket?.id;
          return (
            <div
              key={msg.id}
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2 text-[15px] break-words",
                isMe 
                  ? "bg-blue-600 text-white self-end rounded-tr-sm" 
                  : "bg-neutral-800 text-neutral-200 self-start rounded-tl-sm"
              )}
            >
              {msg.text}
            </div>
          );
        })}

        {isPartnerTyping && !partnerLeft && (
          <div className="flex items-center gap-1.5 max-w-[75%] self-start px-4 py-2 text-[14px] text-neutral-500">
            <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-1 text-xs">Stranger is typing...</span>
          </div>
        )}

        {partnerLeft && (
          <div className="flex flex-col items-center justify-center mt-4 border-t border-neutral-800 pt-6">
            <p className="text-neutral-500 text-sm mb-4">Stranger has disconnected.</p>
            <button
              onClick={findPartner}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              <RefreshCw size={16} />
              Find another stranger
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#141414] border-t border-neutral-800 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            value={text}
            onChange={handleTextChange}
            disabled={partnerLeft}
            placeholder={partnerLeft ? "Chat ended" : "Type a message..."}
            className="flex-1 max-h-32 min-h-[44px] bg-[#0a0a0a] border border-neutral-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-neutral-500"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!text.trim() || partnerLeft}
            className="w-11 h-11 shrink-0 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <Send size={18} className="translate-x-[2px]" />
          </button>
        </form>
      </div>
    </div>
  );
}

