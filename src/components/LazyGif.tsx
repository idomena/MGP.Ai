import { useState, useEffect, useRef, type ReactNode } from "react";

interface LazyGifProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: "cover" | "contain";
  fallback?: ReactNode;
}

/**
 * Extract the numeric ExerciseDB ID from any URL format we store:
 *   https://exercisedb.p.rapidapi.com/image/0025
 *   https://v2.exercisedb.io/image/0025.gif
 *   /api/exercises/image/0025
 *   /api/proxy-image?url=...%2F0025.gif
 */
function extractExerciseId(src: string): string | null {
  const m = src.match(/\/image\/([a-zA-Z0-9_-]+?)(?:\.gif)?(?:[?#&]|$)/);
  return m?.[1] ?? null;
}

export default function LazyGif({
  src,
  alt,
  className = "",
  objectFit = "cover",
  fallback,
}: LazyGifProps) {
  const exerciseId = extractExerciseId(src);

  // Primary: direct v2 CDN URL
  const cdnUrl = exerciseId
    ? `https://v2.exercisedb.io/image/${exerciseId}.gif`
    : src;

  const [isVisible, setIsVisible]   = useState(false);
  const [isLoaded, setIsLoaded]     = useState(false);
  const [cdnFailed, setCdnFailed]   = useState(false);
  const [blobUrl, setBlobUrl]       = useState<string | null>(null);
  const [blobFailed, setBlobFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer — only load when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset all state when src changes
  useEffect(() => {
    setCdnFailed(false);
    setBlobUrl(null);
    setBlobFailed(false);
    setIsLoaded(false);
  }, [src]);

  // Blob fallback — triggered when the CDN img fails.
  // Fetches via our backend proxy (/api/exercises/image/:id) which holds the
  // RapidAPI key server-side; we never expose the key in the browser bundle.
  useEffect(() => {
    if (!cdnFailed || !exerciseId || blobUrl || blobFailed) return;

    let objectUrl: string | null = null;

    fetch(`/api/exercises/image/${exerciseId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`proxy ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setIsLoaded(false); // let the new <img> trigger onLoad
      })
      .catch((err) => {
        console.warn(`[LazyGif] blob fallback failed for id=${exerciseId}:`, err);
        setBlobFailed(true);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cdnFailed, exerciseId, blobUrl, blobFailed]);

  const hasError  = cdnFailed && blobFailed;
  const activeSrc = blobUrl ?? cdnUrl;

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
              key={activeSrc}             // force remount when src switches
              src={activeSrc}
              alt={alt}
              loading="lazy"
              crossOrigin="anonymous"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                if (!blobUrl) {
                  setCdnFailed(true);     // triggers blob fallback effect
                } else {
                  setBlobFailed(true);    // blob also failed — show fallback icon
                }
              }}
              className={`w-full h-full ${
                objectFit === "contain" ? "object-contain" : "object-cover"
              } transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </>
      )}
    </div>
  );
}
