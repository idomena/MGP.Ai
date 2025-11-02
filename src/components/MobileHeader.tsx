import Logo from "./Logo";
import { Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function MobileHeader() {
  return (
    <div className="flex items-center justify-between py-4">
      <Link to="/profile">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00c6ff] to-[#7c57ff] flex items-center justify-center text-white font-bold shadow-lg">
          <User className="w-6 h-6" />
        </div>
      </Link>
      
      <Logo />
      
      <button className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Bell className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
