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
    <div className="min-h-screen bg-background pb-20">
      {/* Tabs */}
      <div className="pt-6 px-4">
        <div className="bg-muted rounded-full p-1 flex">
          <button
            className={`flex-1 ${activeTab === "scan" ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa]" : "bg-transparent"} text-white py-3 px-6 rounded-full text-center font-semibold transition-all duration-300`}
            onClick={() => setActiveTab("scan")}
          >
            Scan Food
          </button>
          <button
            className={`flex-1 ${activeTab === "history" ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa]" : "bg-transparent"} text-muted-foreground py-3 px-6 rounded-full text-center font-semibold transition-all duration-300`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
          <button
            className={`flex-1 ${activeTab === "insights" ? "bg-gradient-to-r from-[#7c57ff] to-[#60a5fa]" : "bg-transparent"} text-muted-foreground py-3 px-6 rounded-full text-center font-semibold transition-all duration-300`}
            onClick={() => setActiveTab("insights")}
          >
            Insights
          </button>
        </div>
      </div>

      {activeTab === "scan" && (
        <div className="mt-8 px-4">
          {/* Scan Options */}
          <div className="flex justify-center gap-8 mb-12">
            <button 
              onClick={handleCameraClick}
              disabled={isNavigating}
              className="flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c57ff] to-[#60a5fa] flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <span className="text-[#7c57ff] text-sm font-semibold">Camera</span>
            </button>

            <button 
              onClick={handleGalleryClick}
              disabled={isNavigating}
              className="flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all active:scale-95">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <span className="text-muted-foreground text-sm font-semibold">Gallery</span>
            </button>

            <button 
              onClick={handleSearchClick}
              disabled={isNavigating}
              className="flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all active:scale-95">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <span className="text-muted-foreground text-sm font-semibold">Search</span>
            </button>
          </div>

          {/* Camera Permission Message */}
          <div className="flex flex-col items-center justify-center mt-32">
            <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Camera className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-white text-lg font-semibold text-center mb-2">
              Camera access denied. Please allow camera permissions
            </h3>
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              Try using the gallery or search option instead, or check your device permissions
            </p>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="mt-8 px-4">
          <div className="text-center text-muted-foreground mt-32">
            <p>No scan history yet</p>
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="mt-8 px-4">
          <div className="text-center text-muted-foreground mt-32">
            <p>Insights will appear here</p>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  );
}
