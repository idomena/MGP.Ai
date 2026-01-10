import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-24 px-4 overflow-y-auto" role="main" aria-label="Profile page">
      <MobileHeader />

      <div className="mt-8">
        <header className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] flex items-center justify-center" aria-hidden="true">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold mt-4" data-testid="text-username">
            {user?.email?.split("@")[0] || "User"}
          </h1>
          <div className="flex items-center text-gray-400 mt-2">
            <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
            <span data-testid="text-email">{user?.email}</span>
          </div>
        </header>

        <div className="mt-8 space-y-4">
          <section className="bg-[#3f3f3f] rounded-xl p-6" aria-labelledby="account-info-heading">
            <h2 id="account-info-heading" className="text-white font-semibold mb-4">Account Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-gray-400 text-sm">Email</dt>
                <dd className="text-white">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-sm">User ID</dt>
                <dd className="text-white text-xs font-mono">{user?.id}</dd>
              </div>
            </dl>
          </section>

          <Button
            onClick={signOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-6 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Sign out of your account"
            data-testid="button-signout"
          >
            <LogOut className="w-5 h-5 mr-2" aria-hidden="true" />
            Sign Out
          </Button>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}
