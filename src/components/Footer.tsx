import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-cozy-bg border-t border-cozy-line py-6 px-6 mb-20" data-testid="footer">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <Link
            to="/privacy-policy"
            className="text-cozy-ink-faint text-xs hover:text-cozy-ink-soft transition-colors"
            data-testid="link-privacy-policy"
          >
            Privacy Policy
          </Link>
          <span className="text-cozy-ink-faint text-xs">|</span>
          <Link
            to="/terms"
            className="text-cozy-ink-faint text-xs hover:text-cozy-ink-soft transition-colors"
            data-testid="link-terms"
          >
            Terms of Service
          </Link>
        </div>
        <p className="text-cozy-ink-faint text-xs" data-testid="text-copyright">
          MGP.AI {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}