import { useState, useEffect, useRef, type ReactNode } from "react";

interface LazyGifProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: "cover" | "contain";
  fallback?: ReactNode;
}

export default function LazyGif({ src, alt, className = "", objectFit = "cover", fallback }: LazyGifProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {hasError && fallback ? (
        <div className="w-full h-full flex items-center justify-center">
          {fallback}
        </div>
      ) : (
        <>
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#3a3a5c] to-[#2a2a4c] animate-pulse" />
          )}
          {isVisible && (
            <img
              src={src}
              alt={alt}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={`w-full h-full ${objectFit === "contain" ? "object-contain" : "object-cover"} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </>
      )}
    </div>
  );
}
