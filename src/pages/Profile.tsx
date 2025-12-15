import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      <div className="mt-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-white text-2xl font-bold mt-4">
            {user?.email?.split("@")[0] || "User"}
          </h2>
          <div className="flex items-center text-gray-400 mt-2">
            <Mail className="w-4 h-4 mr-2" />
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-[#3f3f3f] rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">User ID</p>
                <p className="text-white text-xs font-mono">{user?.id}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={signOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-6 rounded-xl flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}
