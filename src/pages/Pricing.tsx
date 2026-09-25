import { Check, Zap } from "lucide-react";
import NavigationBar from "@/components/NavigationBar";

const features = [
  "Personalized workout programs",
  "AI coaching during every session",
  "Nutrition tracking & meal suggestions",
  "Progress calendar & streak tracking",
  "OCR nutrition label scanning",
  "Unlimited AI assistant conversations",
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto px-4 pt-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#7c57ff]/20 border border-[#7c57ff]/40 rounded-full px-4 py-1.5 text-sm text-[#a88bff] mb-4">
            <Zap className="w-3.5 h-3.5" />
            7-day free trial
          </div>
          <h1 className="text-3xl font-bold mb-3">Upgrade to Pro</h1>
          <p className="text-white/50 text-sm">
            Unlock everything MGP.AI has to offer, starting free.
          </p>
        </div>

        <div className="bg-gradient-to-b from-[#7c57ff]/20 to-[#60a5fa]/10 border border-[#7c57ff]/40 rounded-3xl p-8 mb-6">
          <div className="text-sm text-[#a88bff] font-medium mb-2">PRO PLAN</div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-5xl font-bold">$9</span>
            <span className="text-white/50 mb-2">/month</span>
          </div>
          <p className="text-white/40 text-sm mb-8">After 7-day free trial · Cancel anytime</p>

          <ul className="space-y-3 mb-8">
            {features.map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-white/80">
                <Check className="w-4 h-4 text-[#aaf163] shrink-0" />
                {feat}
              </li>
            ))}
          </ul>

          <div className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#aaf163]/20 to-[#aaf163]/10 border border-[#aaf163]/40 text-[#aaf163] font-semibold text-center">
            Free during beta
          </div>
          <p className="text-white/30 text-xs text-center mt-3">
            No credit card needed · Paid plans coming soon
          </p>
        </div>

        <p className="text-white/30 text-xs text-center">
          Secure payment powered by Stripe · No charge during trial
        </p>
      </div>
      <NavigationBar />
    </div>
  );
}
