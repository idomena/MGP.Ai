import NavigationBar from "@/components/NavigationBar";
import MobileHeader from "@/components/MobileHeader";
import { useState, useRef } from "react";
import { Camera, Sun, Maximize, UtensilsCrossed, Loader2, Copy, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { extractOcrText } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function NutritionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setExtractedText("");
    setPreviewUrl("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success("Copied to clipboard!");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setExtractedText("");

    if (file.size > MAX_FILE_SIZE) {
      setError("That image is a bit too large. Try a smaller photo (under 4MB).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsLoading(true);

    try {
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => {
          const base64String = (r.result as string).split(",")[1];
          resolve(base64String);
        };
        r.readAsDataURL(file);
      });

      const data = await extractOcrText(base64, file.type || "image/jpeg");

      if (!data.text || data.text.trim().length === 0) {
        setError("No nutritional info found. Make sure the nutrition label is visible in the photo.");
      } else {
        setExtractedText(data.text);
        toast.success("Text extracted successfully!");
      }
    } catch (err: any) {
      setError(
        "We couldn't read that clearly. Try taking a photo with better lighting or a clearer angle."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const tips = [
    {
      icon: Sun,
      text: "Make sure the label is well-lit and in focus",
    },
    {
      icon: Maximize,
      text: "Include the entire nutrition facts panel",
    },
    {
      icon: UtensilsCrossed,
      text: "Works with packaged foods, restaurant menus, and meal prep labels",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24 overflow-y-auto" role="main" aria-label="Nutrition page">
      <div className="px-4">
        <MobileHeader />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white" data-testid="text-page-title">
            Nutrition Scanner
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Take a photo of any nutrition label or food to get instant nutritional info
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isLoading}
          data-testid="input-file-upload"
        />

        {!isLoading && !extractedText && !error && (
          <button
            onClick={handleScanClick}
            className="w-full bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] rounded-2xl p-0.5 mb-6"
            data-testid="button-scan"
          >
            <div className="bg-[#1a1a2e] rounded-[15px] p-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <span className="text-white text-lg font-semibold">Scan a Nutrition Label</span>
              <span className="text-gray-400 text-sm">Upload a photo from your gallery</span>
            </div>
          </button>
        )}

        {isLoading && (
          <div className="w-full bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">
            <div className="flex flex-col items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="w-24 h-24 object-cover rounded-xl opacity-60"
                  data-testid="img-preview-loading"
                />
              )}
              <Loader2 className="w-10 h-10 text-[#7c57ff] animate-spin" />
              <p className="text-white font-medium">Analyzing your nutrition label...</p>
              <p className="text-gray-400 text-sm">This may take a few seconds</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-[#1a1a2e]/80 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 mb-6"
              data-testid="section-error"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">Scan unsuccessful</p>
                  <p className="text-gray-400 text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#7c57ff] text-white py-3 rounded-xl font-medium"
                data-testid="button-try-again"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {extractedText && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6"
              data-testid="section-results"
            >
              <h2 className="text-white font-semibold text-lg mb-4">Scan Results</h2>

              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Scanned nutrition label"
                    className="w-full max-h-48 object-contain rounded-xl bg-black/30"
                    data-testid="img-preview-result"
                  />
                </div>
              )}

              <div className="bg-[#0f0f1a]/60 rounded-xl p-4 mb-4 max-h-72 overflow-y-auto">
                {extractedText.split("\n").map((line, i) => (
                  <p
                    key={i}
                    className={`text-sm leading-relaxed ${
                      line.trim() === "" ? "h-3" : "text-gray-200"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a2e] border border-white/10 text-white py-3 rounded-xl font-medium"
                  data-testid="button-scan-another"
                >
                  <RotateCcw className="w-4 h-4" />
                  Scan Another
                </button>
                <button
                  onClick={handleCopyText}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#7c57ff] text-white py-3 rounded-xl font-medium"
                  data-testid="button-copy-results"
                >
                  <Copy className="w-4 h-4" />
                  Copy Results
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && !extractedText && !error && (
          <div className="mb-6">
            <h2 className="text-white font-semibold text-base mb-3">Get the best results</h2>
            <div className="flex flex-col gap-2">
              {tips.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-[#1a1a2e]/60 border border-white/5 rounded-xl px-4 py-3"
                    data-testid={`tip-card-${i}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#7c57ff]/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#7c57ff]" />
                    </div>
                    <p className="text-gray-300 text-sm">{tip.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
}
