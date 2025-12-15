import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      <div className="mt-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-white text-2xl font-bold mt-4">Guest User</h2>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-[#3f3f3f] rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Profile</h3>
            <p className="text-gray-400">You are using the app as a guest.</p>
          </div>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}