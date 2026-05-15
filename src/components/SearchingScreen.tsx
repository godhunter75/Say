import { Loader2, X } from "lucide-react";

interface SearchingScreenProps {
  onCancel: () => void;
}

export function SearchingScreen({ onCancel }: SearchingScreenProps) {
  return (
    <div className="max-w-md w-full bg-[#141414] rounded-3xl shadow-lg border border-neutral-800 p-8 flex flex-col items-center text-center">
      <div className="relative w-24 h-24 flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping opacity-75" />
        <div className="relative w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
          <Loader2 size={32} strokeWidth={2} className="animate-spin" />
        </div>
      </div>
      <h2 className="text-xl font-medium tracking-tight text-white mb-2">
        Looking for someone...
      </h2>
      <p className="text-neutral-400 mb-8 text-sm">
        Please wait while we connect you to a random stranger.
      </p>
      <button
        onClick={onCancel}
        className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full font-medium transition-colors border border-neutral-700"
      >
        <X size={18} />
        Cancel Search
      </button>
    </div>
  );
}
