import { useState } from "react";
import { API_BASE } from "@/lib/api";
import posthog from "posthog-js";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check, X } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!allRequirementsMet) {
      toast({
        title: "Password too weak",
        description: "Please meet all password requirements.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms of service.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(email, password, fullName);
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      posthog.capture('user_signed_up', { method: 'email' });
      fetch(`${API_BASE}/api/email/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName }),
      }).catch(() => {});
      navigate("/login");
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setIsGoogleLoading(false);
      toast({
        title: "Google signup failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-cozy-bg flex flex-col items-center justify-center px-4 py-8" role="main" aria-label="Sign up page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <Logo size="xl" />
        </div>

        <div className="bg-cozy-surface rounded-2xl p-8 border border-cozy-line">
          <h2 className="text-2xl font-semibold text-cozy-ink text-center mb-6">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-cozy-ink-soft text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cozy-ink-faint" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-11 bg-cozy-surface border-cozy-line text-cozy-ink placeholder:text-cozy-ink-faint h-12 rounded-xl focus:ring-2 focus:ring-cozy-primary focus:border-transparent"
                  data-testid="input-fullname"
                  aria-label="Full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-cozy-ink-soft text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cozy-ink-faint" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 bg-cozy-surface border-cozy-line text-cozy-ink placeholder:text-cozy-ink-faint h-12 rounded-xl focus:ring-2 focus:ring-cozy-primary focus:border-transparent"
                  data-testid="input-email"
                  aria-label="Email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-cozy-ink-soft text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cozy-ink-faint" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 bg-cozy-surface border-cozy-line text-cozy-ink placeholder:text-cozy-ink-faint h-12 rounded-xl focus:ring-2 focus:ring-cozy-primary focus:border-transparent"
                  data-testid="input-password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cozy-ink-faint hover:text-cozy-ink-soft transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <Check className="w-3 h-3 text-cozy-sage-deep" />
                      ) : (
                        <X className="w-3 h-3 text-cozy-danger" />
                      )}
                      <span className={req.met ? "text-cozy-sage-deep" : "text-cozy-ink-faint"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-cozy-ink-soft text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cozy-ink-faint" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11 pr-11 bg-cozy-surface border-cozy-line text-cozy-ink placeholder:text-cozy-ink-faint h-12 rounded-xl focus:ring-2 focus:ring-cozy-primary focus:border-transparent"
                  data-testid="input-confirm-password"
                  aria-label="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cozy-ink-faint hover:text-cozy-ink-soft transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-cozy-danger flex items-center gap-1">
                  <X className="w-3 h-3" /> Passwords don't match
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="mt-0.5 h-5 w-5 rounded-md border-cozy-ink-faint bg-cozy-surface data-[state=checked]:bg-cozy-primary data-[state=checked]:border-cozy-primary"
                data-testid="checkbox-terms"
              />
              <label htmlFor="terms" className="text-cozy-ink-soft text-sm leading-tight cursor-pointer">
                I agree to the{" "}
                <span className="text-cozy-primary hover:underline">Terms of Service</span>
                {" "}and{" "}
                <span className="text-cozy-primary hover:underline">Privacy Policy</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-cozy-primary hover:bg-cozy-primary text-white font-semibold rounded-xl transition-all duration-300 mt-4"
              data-testid="button-signup"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cozy-line"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-cozy-surface px-4 text-cozy-ink-faint">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            variant="outline"
            className="w-full h-12 bg-cozy-sunk border-cozy-line hover:bg-cozy-sunk text-cozy-ink font-medium rounded-xl transition-all duration-300"
            data-testid="button-google-signup"
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
            <p className="text-cozy-ink-soft text-sm">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-cozy-primary hover:text-cozy-primary font-medium transition-colors"
                data-testid="link-login"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
