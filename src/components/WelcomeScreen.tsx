import { MessageSquareDashed } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="max-w-md w-full bg-[#141414] rounded-3xl shadow-lg border border-neutral-800 p-8 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-[24px] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        <MessageSquareDashed size={40} strokeWidth={1.5} />
      </div>
      <h1 className="text-3xl font-light tracking-tight text-white mb-8">
        Say
      </h1>
      <button
        onClick={onStart}
        className="w-full py-4 bg-white hover:bg-neutral-200 text-black rounded-full font-medium transition-colors"
      >
        Find a Partner
      </button>
    </div>
  );
}
