import Logo from "./Logo";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Preparing your personalized experience" }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-8">
        <div className="loading-logo-pulse">
          <Logo size="xl" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="loading-dots flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7c57ff] loading-dot-1" />
            <span className="w-2 h-2 rounded-full bg-[#7c57ff] loading-dot-2" />
            <span className="w-2 h-2 rounded-full bg-[#7c57ff] loading-dot-3" />
          </div>

          <p className="text-white/50 text-sm font-medium tracking-wide" data-testid="text-loading-message">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}