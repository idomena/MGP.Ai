import { Link } from "react-router-dom";
import { Dumbbell, Brain, Salad, Zap, ChevronRight, Check } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Coaching",
    description: "Get real-time form tips, exercise swaps, and motivational coaching from your personal AI trainer — available 24/7.",
  },
  {
    icon: Dumbbell,
    title: "Personalized Fitness Plans",
    description: "Your plan is built around your goals, equipment, and schedule. No generic templates — just workouts that fit your life.",
  },
  {
    icon: Salad,
    title: "Nutrition Tracking",
    description: "Log meals, scan nutrition labels with your camera, and get AI-generated meal suggestions tailored to your targets.",
  },
  {
    icon: Zap,
    title: "Progress That Motivates",
    description: "Track streaks, visualize your journey, and unlock rewards as you hit milestones. Stay consistent, stay motivated.",
  },
];

const pricingFeatures = [
  "Personalized workout programs",
  "AI coaching during every session",
  "Nutrition tracking & meal suggestions",
  "Progress calendar & streak tracking",
  "OCR nutrition label scanning",
  "Unlimited AI assistant conversations",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c57ff] to-[#00c6ff] flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">MGP.AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#7c57ff]/20 border border-[#7c57ff]/40 rounded-full px-4 py-1.5 text-sm text-[#a88bff] mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI fitness coaching, personalized for you
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Your AI personal trainer,{" "}
            <span className="bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] bg-clip-text text-transparent">
              always on
            </span>
          </h1>
          <p className="text-xl text-white/60 mb-10 max-w-xl mx-auto">
            MGP.AI builds a personalized fitness plan that grows with you, coaches you through every workout, and tracks your nutrition — all powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] px-8 py-4 rounded-full text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(124,87,255,0.4)]"
            >
              Start for free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              Already have an account? Sign in
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-4">Free during beta · No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            Everything you need to get fit
          </h2>
          <p className="text-white/50 text-center mb-12">
            Built for people who want results, not another app collecting dust.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#7c57ff]/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c57ff]/30 to-[#60a5fa]/30 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#a88bff]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Simple pricing</h2>
          <p className="text-white/50 mb-10">Start free, upgrade when you're ready.</p>
          <div className="bg-gradient-to-b from-[#7c57ff]/20 to-[#60a5fa]/10 border border-[#7c57ff]/40 rounded-3xl p-8">
            <div className="text-sm text-[#a88bff] font-medium mb-2">PRO PLAN</div>
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-5xl font-bold">Free</span>
            </div>
            <p className="text-white/40 text-sm mb-8">During beta · No credit card needed</p>
            <ul className="space-y-3 mb-8 text-left">
              {pricingFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-white/80">
                  <Check className="w-4 h-4 text-[#aaf163] shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="block w-full py-3.5 rounded-full bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] text-white font-semibold hover:opacity-90 transition-opacity text-center"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-white/5 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your fitness?</h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          Join MGP.AI and get a coach that never sleeps, never judges, and always shows up.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7c57ff] to-[#60a5fa] px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Get started free
          <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <span>© 2025 MGP.AI. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
