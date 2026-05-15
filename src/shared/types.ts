export type UserState = "idle" | "searching" | "chatting";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface ServerToClientEvents {
  search_started: () => void;
  chat_started: (partnerId: string, roomId: string) => void;
  chat_message: (message: ChatMessage) => void;
  partner_left: () => void;
  partner_typing: () => void;
  partner_stop_typing: () => void;
  error: (msg: string) => void;
}

export interface ClientToServerEvents {
  find_partner: () => void;
  send_message: (text: string) => void;
  leave_chat: () => void;
  typing: () => void;
  stop_typing: () => void;
}

