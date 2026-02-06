import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    setIsLoading(false);
    
    if (error) {
      console.error("Login error:", error.message, error);
      let errorMessage = error.message;
      let errorTitle = "Login failed";
      
      if (error.message === "Invalid login credentials") {
        errorMessage = "Incorrect email or password. Please try again.";
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        errorMessage = "Please check your email and click the verification link before logging in.";
      } else if (error.message.toLowerCase().includes("invalid") || error.message.toLowerCase().includes("user not found")) {
        errorMessage = "No account found with this email. Please sign up first.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setIsGoogleLoading(false);
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] flex flex-col items-center justify-center px-4" role="main" aria-label="Login page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" />
        </div>

        <div className="bg-[#1a1f3e]/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-white/80 text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 bg-[#0a0e27]/50 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus:ring-2 focus:ring-[#7c57ff] focus:border-transparent"
                  data-testid="input-email"
                  aria-label="Email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-white/80 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 bg-[#0a0e27]/50 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus:ring-2 focus:ring-[#7c57ff] focus:border-transparent"
                  data-testid="input-password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link 
                to="/reset-password" 
                className="text-sm text-[#7c57ff] hover:text-[#9b7aff] transition-colors"
                data-testid="link-forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] hover:from-[#8f6fff] hover:to-[#7ab8ff] text-white font-semibold rounded-xl transition-all duration-300"
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#1a1f3e]/50 px-4 text-white/40">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            variant="outline"
            className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-300"
            data-testid="button-google-login"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <SiGoogle className="w-5 h-5 mr-3" />
                Continue with Google
              </>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-[#7c57ff] hover:text-[#9b7aff] font-medium transition-colors"
                data-testid="link-signup"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/privacy-policy" className="text-white/30 text-xs hover:text-white/60 transition-colors" data-testid="link-login-privacy">Privacy Policy</Link>
            <span className="text-white/15 text-xs">|</span>
            <Link to="/terms" className="text-white/30 text-xs hover:text-white/60 transition-colors" data-testid="link-login-terms">Terms</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
