import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents, ChatMessage, UserState } from "../shared/types";

export function useSocket() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userState, setUserState] = useState<UserState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    console.log("Connecting to backend at:", backendUrl);
    
    const socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> = io(backendUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected with id:", socketInstance.id);
      setIsConnected(true);
      setErrorMsg(null);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setErrorMsg(`Connection error: ${error.message}`);
    });

    socketInstance.on("search_started", () => {
      setUserState("searching");
      setMessages([]);
      setErrorMsg(null);
      setPartnerLeft(false);
      setIsPartnerTyping(false);
    });

    socketInstance.on("chat_started", () => {
      setUserState("chatting");
      setMessages([]);
      setErrorMsg(null);
      setPartnerLeft(false);
      setIsPartnerTyping(false);
    });

    socketInstance.on("chat_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on("partner_left", () => {
      setPartnerLeft(true);
      setIsPartnerTyping(false);
    });

    socketInstance.on("partner_typing", () => setIsPartnerTyping(true));
    socketInstance.on("partner_stop_typing", () => setIsPartnerTyping(false));
    
    socketInstance.on("error", (msg) => {
      setErrorMsg(msg);
      console.error("Socket error mapping:", msg);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const findPartner = useCallback(() => {
    socket?.emit("find_partner");
  }, [socket]);

  const sendMessage = useCallback((text: string) => {
    socket?.emit("send_message", text);
  }, [socket]);

  const sendTyping = useCallback(() => {
    socket?.emit("typing");
  }, [socket]);

  const sendStopTyping = useCallback(() => {
    socket?.emit("stop_typing");
  }, [socket]);

  const leaveChat = useCallback(() => {
    socket?.emit("leave_chat");
    setUserState("idle");
    setMessages([]);
    setPartnerLeft(false);
    setIsPartnerTyping(false);
  }, [socket]);

  return {
    socket,
    isConnected,
    userState,
    messages,
    errorMsg,
    partnerLeft,
    isPartnerTyping,
    findPartner,
    sendMessage,
    sendTyping,
    sendStopTyping,
    leaveChat
  };
}

