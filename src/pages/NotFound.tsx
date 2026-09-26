import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cozy-sunk">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-cozy-ink-faint">Oops! Page not found</p>
        <a href="/" className="text-cozy-sky-deep underline hover:text-cozy-sky-deep">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
