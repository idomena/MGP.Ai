import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await resetPassword(email);
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex flex-col items-center justify-center px-4" role="main" aria-label="Password reset confirmation">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7c57ff] to-[#00c6ff] bg-clip-text text-transparent mb-2">
              MGP·AI
            </h1>
          </div>

          <div className="bg-[#1a1f3e]/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-3">Check Your Email</h2>
            <p className="text-white/60 mb-6">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
            
            <Link to="/login">
              <Button
                className="w-full h-12 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] hover:from-[#8f6fff] hover:to-[#7ab8ff] text-white font-semibold rounded-xl"
                data-testid="button-back-to-login"
              >
                Back to Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] flex flex-col items-center justify-center px-4" role="main" aria-label="Reset password page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7c57ff] to-[#00c6ff] bg-clip-text text-transparent mb-2">
            MGP·AI
          </h1>
          <p className="text-white/60 text-sm">Your AI Fitness Partner</p>
        </div>

        <div className="bg-[#1a1f3e]/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
            data-testid="link-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          
          <h2 className="text-2xl font-semibold text-white mb-2">Reset Password</h2>
          <p className="text-white/60 text-sm mb-6">
            Enter your email and we'll send you a link to reset your password.
          </p>
          
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] hover:from-[#8f6fff] hover:to-[#7ab8ff] text-white font-semibold rounded-xl transition-all duration-300"
              data-testid="button-reset"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
