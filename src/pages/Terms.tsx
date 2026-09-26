import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-cozy-bg text-cozy-ink">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-cozy-ink-soft hover:text-cozy-ink mb-8" data-testid="link-back-home-terms">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        <h1 className="text-2xl font-bold mb-2" data-testid="text-terms-title">Terms of Service</h1>
        <p className="text-cozy-ink-faint text-sm mb-8">Last updated: February 6, 2026</p>

        <div className="space-y-6 text-cozy-ink-soft text-sm leading-relaxed">
          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using MGP.AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">2. Description of Service</h2>
            <p>MGP.AI provides AI-powered fitness coaching, workout tracking, exercise demonstrations, and nutrition guidance. The service is intended for informational and educational purposes only and should not replace professional medical or fitness advice.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">4. Health Disclaimer</h2>
            <p>The fitness and nutrition information provided through MGP.AI is for general informational purposes only. Always consult with a qualified healthcare provider before beginning any new exercise or nutrition program. You use the application and follow its recommendations at your own risk.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">5. Intellectual Property</h2>
            <p>All content, features, and functionality of MGP.AI, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the property of MGP.AI and are protected by applicable copyright and trademark laws.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">6. User Conduct</h2>
            <p>You agree not to use the service for any unlawful purpose, attempt to gain unauthorized access to any portion of the service, or interfere with the proper functioning of the service.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">7. Limitation of Liability</h2>
            <p>MGP.AI and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">8. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.</p>
          </section>

          <section>
            <h2 className="text-cozy-ink font-semibold text-base mb-2">9. Contact</h2>
            <p>For questions about these Terms of Service, please contact us at support@mgp.ai.</p>
          </section>
        </div>
      </div>
    </div>
  );
}