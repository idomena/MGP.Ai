import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a1a] border-t border-white/5 py-6 px-6 mb-20" data-testid="footer">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <Link
            to="/privacy-policy"
            className="text-white/40 text-xs hover:text-white/70 transition-colors"
            data-testid="link-privacy-policy"
          >
            Privacy Policy
          </Link>
          <span className="text-white/20 text-xs">|</span>
          <Link
            to="/terms"
            className="text-white/40 text-xs hover:text-white/70 transition-colors"
            data-testid="link-terms"
          >
            Terms of Service
          </Link>
        </div>
        <p className="text-white/25 text-xs" data-testid="text-copyright">
          MGP.AI {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}