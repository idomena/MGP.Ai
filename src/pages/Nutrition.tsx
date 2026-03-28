import NavigationBar from "@/components/NavigationBar";
import MobileHeader from "@/components/MobileHeader";
import { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, Sun, Maximize, UtensilsCrossed, Loader2, Copy, RotateCcw, AlertCircle, Plus, Trash2, Flame } from "lucide-react";
import { toast } from "sonner";
import { extractOcrText, API_BASE } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface FoodEntry {
  id: number;
  foodName: string;
  calories: number | null;
  proteinG: string | null;
  carbsG: string | null;
  fatG: string | null;
  servingSize: string | null;
}

const todayStr = () => new Date().toISOString().split("T")[0];

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function NutritionPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Food log state
  const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [logLoading, setLogLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFood, setNewFood] = useState({ foodName: "", calories: "", proteinG: "", carbsG: "", fatG: "", servingSize: "" });

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/api/nutrition/${user.id}/${todayStr()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setFoodLog(data.data.logs ?? []);
          setTotalCalories(data.data.totalCalories ?? 0);
        }
      })
      .catch(() => {});
  }, [user]);

  async function handleAddFood(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newFood.foodName.trim()) return;
    setLogLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/nutrition/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          logDate: todayStr(),
          foodName: newFood.foodName.trim(),
          calories: newFood.calories ? parseInt(newFood.calories) : null,
          proteinG: newFood.proteinG || null,
          carbsG: newFood.carbsG || null,
          fatG: newFood.fatG || null,
          servingSize: newFood.servingSize || null,
        }),
      });
      const data = await res.json();
      if (data.data?.entry) {
        setFoodLog((prev) => [...prev, data.data.entry]);
        setTotalCalories((prev) => prev + (data.data.entry.calories ?? 0));
        setNewFood({ foodName: "", calories: "", proteinG: "", carbsG: "", fatG: "", servingSize: "" });
        setShowAddForm(false);
        toast.success("Food logged!");
      }
    } catch {
      toast.error("Failed to log food");
    } finally {
      setLogLoading(false);
    }
  }

  async function handleDeleteFood(id: number, cal: number | null) {
    try {
      await fetch(`${API_BASE}/api/nutrition/log/${id}`, { method: "DELETE" });
      setFoodLog((prev) => prev.filter((f) => f.id !== id));
      setTotalCalories((prev) => prev - (cal ?? 0));
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleReset = () => {
    setExtractedText("");
    setPreviewUrl("");
    setError("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
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
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
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
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isLoading}
          data-testid="input-camera-upload"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isLoading}
          data-testid="input-gallery-upload"
        />

        {!isLoading && !extractedText && !error && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-[#7c57ff] via-[#60a5fa] to-[#00c6ff] rounded-2xl p-0.5">
              <div className="bg-[#1a1a2e] rounded-[15px] p-6 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-semibold">Scan a Nutrition Label</p>
                  <p className="text-gray-400 text-sm mt-1">Take a photo or pick one from your gallery</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleCameraClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#7c57ff] text-white py-3 rounded-xl font-medium"
                    data-testid="button-camera"
                  >
                    <Camera className="w-5 h-5" />
                    Camera
                  </button>
                  <button
                    onClick={handleGalleryClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a2e] border border-white/10 text-white py-3 rounded-xl font-medium"
                    data-testid="button-gallery"
                  >
                    <ImageIcon className="w-5 h-5" />
                    Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        {/* Food Log Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-white font-semibold text-base">Today's Food Log</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">{totalCalories} kcal</span>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1 bg-[#7c57ff] text-white text-sm px-3 py-1.5 rounded-full font-medium"
            >
              <Plus className="w-4 h-4" />
              Add food
            </button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddFood}
                className="bg-[#1a1a2e]/80 border border-white/10 rounded-2xl p-4 mb-3 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    className="col-span-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#7c57ff]"
                    placeholder="Food name *"
                    value={newFood.foodName}
                    onChange={(e) => setNewFood((p) => ({ ...p, foodName: e.target.value }))}
                    required
                  />
                  <input
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#7c57ff]"
                    placeholder="Calories"
                    type="number"
                    value={newFood.calories}
                    onChange={(e) => setNewFood((p) => ({ ...p, calories: e.target.value }))}
                  />
                  <input
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#7c57ff]"
                    placeholder="Serving (e.g. 100g)"
                    value={newFood.servingSize}
                    onChange={(e) => setNewFood((p) => ({ ...p, servingSize: e.target.value }))}
                  />
                  <input
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#7c57ff]"
                    placeholder="Protein (g)"
                    type="number"
                    value={newFood.proteinG}
                    onChange={(e) => setNewFood((p) => ({ ...p, proteinG: e.target.value }))}
                  />
                  <input
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#7c57ff]"
                    placeholder="Carbs (g)"
                    type="number"
                    value={newFood.carbsG}
                    onChange={(e) => setNewFood((p) => ({ ...p, carbsG: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={logLoading}
                  className="w-full py-2.5 rounded-xl bg-[#7c57ff] text-white text-sm font-medium disabled:opacity-50"
                >
                  {logLoading ? "Logging..." : "Log food"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {foodLog.length === 0 ? (
            <div className="bg-[#1a1a2e]/60 border border-white/5 rounded-2xl p-6 text-center">
              <UtensilsCrossed className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">No food logged today yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {foodLog.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between bg-[#1a1a2e]/60 border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{entry.foodName}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {entry.calories != null ? `${entry.calories} kcal` : ""}
                      {entry.servingSize ? ` · ${entry.servingSize}` : ""}
                      {entry.proteinG ? ` · ${entry.proteinG}g protein` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFood(entry.id, entry.calories)}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    aria-label="Delete food entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      <NavigationBar />
    </div>
  );
}
