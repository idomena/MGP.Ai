import NavigationBar from "@/components/NavigationBar";
import { useState } from "react";
import { Camera, Image as ImageIcon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<"scan" | "history" | "insights">("scan");
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleCameraClick = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    navigate("/ocr");
  };

  const handleGalleryClick = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    navigate("/ocr");
  };

  const handleSearchClick = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    navigate("/ocr");
  };

  return (
    <div className="min-h-screen bg-background pb-24 overflow-y-auto" role="main" aria-label="Nutrition page">
      {/* Tabs */}
      <nav className="pt-6 px-4" role="tablist" aria-label="Nutrition options">
        <div className="bg-muted rounded-full p-1 flex">
          <button
            role="tab"
            aria-selected={activeTab === "scan"}
            aria-controls="scan-panel"
            className={`flex-1 ${activeTab === "scan" ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa]" : "bg-transparent"} text-white py-3 px-6 rounded-full text-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7c57ff]/50`}
            onClick={() => setActiveTab("scan")}
            data-testid="tab-scan"
          >
            Scan Food
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "history"}
            aria-controls="history-panel"
            className={`flex-1 ${activeTab === "history" ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa]" : "bg-transparent"} text-muted-foreground py-3 px-6 rounded-full text-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7c57ff]/50`}
            onClick={() => setActiveTab("history")}
            data-testid="tab-history"
          >
            History
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "insights"}
            aria-controls="insights-panel"
            className={`flex-1 ${activeTab === "insights" ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa]" : "bg-transparent"} text-muted-foreground py-3 px-6 rounded-full text-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7c57ff]/50`}
            onClick={() => setActiveTab("insights")}
            data-testid="tab-insights"
          >
            Insights
          </button>
        </div>
      </nav>

      {activeTab === "scan" && (
        <section id="scan-panel" role="tabpanel" aria-labelledby="tab-scan" className="mt-8 px-4">
          {/* Scan Options */}
          <div className="flex justify-center gap-8 mb-12">
            <button 
              onClick={handleCameraClick}
              disabled={isNavigating}
              className="flex flex-col items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-xl p-2"
              aria-label="Scan food with camera"
              data-testid="button-camera"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95">
                <Camera className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <span className="text-[#7c57ff] text-sm font-semibold">Camera</span>
            </button>

            <button 
              onClick={handleGalleryClick}
              disabled={isNavigating}
              className="flex flex-col items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-xl p-2"
              aria-label="Select from gallery"
              data-testid="button-gallery"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all active:scale-95">
                <ImageIcon className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <span className="text-muted-foreground text-sm font-semibold">Gallery</span>
            </button>

            <button 
              onClick={handleSearchClick}
              disabled={isNavigating}
              className="flex flex-col items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-xl p-2"
              aria-label="Search for food"
              data-testid="button-search"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all active:scale-95">
                <Search className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <span className="text-muted-foreground text-sm font-semibold">Search</span>
            </button>
          </div>

          {/* Camera Permission Message */}
          <div className="flex flex-col items-center justify-center mt-32" role="status" aria-live="polite">
            <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Camera className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-white text-lg font-semibold text-center mb-2">
              Camera access denied. Please allow camera permissions
            </h3>
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              Try using the gallery or search option instead, or check your device permissions
            </p>
          </div>
        </section>
      )}

      {activeTab === "history" && (
        <section id="history-panel" role="tabpanel" aria-labelledby="tab-history" className="mt-8 px-4">
          <div className="text-center text-muted-foreground mt-32">
            <p>No scan history yet</p>
          </div>
        </section>
      )}

      {activeTab === "insights" && (
        <section id="insights-panel" role="tabpanel" aria-labelledby="tab-insights" className="mt-8 px-4">
          <div className="text-center text-muted-foreground mt-32">
            <p>Insights will appear here</p>
          </div>
        </section>
      )}

      <NavigationBar />
    </div>
  );
}
