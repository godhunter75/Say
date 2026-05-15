import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../shared/types";

// Random ID generator for rooms
const generateRoomId = () => Math.random().toString(36).substring(2, 9);

export function setupSocketManager(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  // Use a Set to handle multiple waitings
  const waitingUsers = new Set<Socket>();
  // Map socket IDs to current room IDs
  const activeRooms = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    const leaveCurrentChat = () => {
      const roomId = activeRooms.get(socket.id);
      if (roomId) {
        socket.leave(roomId);
        activeRooms.delete(socket.id);
        
        // Notify the partner
        socket.to(roomId).emit("partner_left");
        
        // Let's clear the partner from the room too
        const clients = io.sockets.adapter.rooms.get(roomId);
        if (clients) {
          for (const clientId of clients) {
            const clientSocket = io.sockets.sockets.get(clientId);
            if (clientSocket) {
              clientSocket.leave(roomId);
              activeRooms.delete(clientId);
            }
          }
        }
      }

      // If user was waiting, remove from queue
      if (waitingUsers.has(socket)) {
        waitingUsers.delete(socket);
      }
    };

    const attemptMatch = () => {
      // Find pairs as long as there are at least 2 users waiting
      while (waitingUsers.size >= 2) {
        const iterator = waitingUsers.values();
        const user1 = iterator.next().value!;
        const user2 = iterator.next().value!;

        // Remove both from waiting list
        waitingUsers.delete(user1);
        waitingUsers.delete(user2);

        const roomId = `room_${generateRoomId()}`;
        
        // Both join the new room
        user1.join(roomId);
        user2.join(roomId);

        activeRooms.set(user1.id, roomId);
        activeRooms.set(user2.id, roomId);

        // Notify both sides that chat started
        user1.emit("chat_started", user2.id, roomId);
        user2.emit("chat_started", user1.id, roomId);
        
        console.log(`Paired ${user1.id} with ${user2.id} in ${roomId}`);
      }
    };

    socket.on("find_partner", () => {
      // First ensure they left any existing chat
      leaveCurrentChat();

      socket.emit("search_started");
      waitingUsers.add(socket);

      // Attempt to match
      attemptMatch();
    });

    socket.on("send_message", (text) => {
      const roomId = activeRooms.get(socket.id);
      if (!roomId) {
        socket.emit("error", "You are not in a chat room");
        return;
      }

      const message = {
        id: Math.random().toString(36).substring(2, 9),
        senderId: socket.id,
        text,
        timestamp: Date.now(),
      };

      // Broadcast to the whole room (including sender)
      io.to(roomId).emit("chat_message", message);
    });

    socket.on("typing", () => {
      const roomId = activeRooms.get(socket.id);
      if (roomId) {
        socket.to(roomId).emit("partner_typing");
      }
    });

    socket.on("stop_typing", () => {
      const roomId = activeRooms.get(socket.id);
      if (roomId) {
        socket.to(roomId).emit("partner_stop_typing");
      }
    });

    socket.on("leave_chat", () => {
      leaveCurrentChat();
    });

    socket.on("disconnect", () => {
      leaveCurrentChat();
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

