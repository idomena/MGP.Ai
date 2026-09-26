import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-cozy-bg text-cozy-ink">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-cozy-ink-soft hover:text-cozy-ink mb-8" data-testid="link-back-home">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        <h1 className="text-2xl font-bold mb-2" data-testid="text-privacy-title">Privacy Policy</h1>
        <p className="text-cozy-ink-faint text-sm mb-8">Last updated: February 6, 2026</p>

        <div className="space-y-6 text-cozy-ink-soft text-sm leading-relaxed">
          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, update your profile, use interactive features, or contact us. This may include your name, email address, fitness goals, workout data, and nutrition information.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, including to personalize your workout plans and nutrition recommendations. We also use the information to communicate with you about products, services, and events.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">3. Information Sharing</h2>
            <p>We do not share your personal information with third parties except as described in this policy. We may share information with service providers who assist us in operating the app, conducting business, or serving users.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">4. Data Security</h2>
            <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet or electronic storage system is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">5. Your Rights</h2>
            <p>You may access, update, or delete your account information at any time by logging into your account settings. You may also contact us to request access to, correction of, or deletion of any personal information you have provided to us.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">6. Cookies and Tracking</h2>
            <p>We use cookies and similar tracking technologies to collect and use personal information about you. Our use of cookies helps us improve your experience and deliver personalized content and recommendations.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@mgp.ai.</p>
          </section>
        </div>
      </div>
    </div>
  );
}