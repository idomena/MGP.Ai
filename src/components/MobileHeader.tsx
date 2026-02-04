import Logo from "./Logo";
import { Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function MobileHeader() {
  return (
    <header 
      className="flex items-center justify-between py-4" 
      role="banner"
      style={{ paddingTop: 'calc(var(--safe-area-inset-top, 0px) + 1rem)' }}
    >
      <Link 
        to="/profile" 
        aria-label="Go to profile" 
        data-testid="button-profile"
        className="focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-full"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00c6ff] to-[#7c57ff] flex items-center justify-center text-white font-bold shadow-lg">
          <User className="w-6 h-6" aria-hidden="true" />
        </div>
      </Link>
      
      <Logo />
      
      <button 
        className="w-12 h-12 rounded-full bg-muted flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#7c57ff]"
        aria-label="Notifications"
        data-testid="button-notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
      </button>
    </header>
  );
}
