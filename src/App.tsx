/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useSocket } from "./hooks/useSocket";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SearchingScreen } from "./components/SearchingScreen";
import { ChatRoom } from "./components/ChatRoom";

export default function App() {
  const socketContext = useSocket();

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-neutral-100 flex flex-col justify-center items-center p-0 sm:p-4">
      {socketContext.userState === "idle" && (
        <WelcomeScreen onStart={socketContext.findPartner} />
      )}
      {socketContext.userState === "searching" && (
        <SearchingScreen onCancel={socketContext.leaveChat} />
      )}
      {socketContext.userState === "chatting" && (
        <ChatRoom socketContext={socketContext} />
      )}
    </div>
  );
}

