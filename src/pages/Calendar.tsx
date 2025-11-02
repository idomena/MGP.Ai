import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const [activeView, setActiveView] = useState<"weekly" | "quarterly">("quarterly");
  const [currentMonth, setCurrentMonth] = useState("JANUARY");

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handlePreviousMonth = () => {
    const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const currentIndex = months.indexOf(currentMonth);
    setCurrentMonth(months[currentIndex === 0 ? 11 : currentIndex - 1]);
  };

  const handleNextMonth = () => {
    const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const currentIndex = months.indexOf(currentMonth);
    setCurrentMonth(months[(currentIndex + 1) % 12]);
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <MobileHeader />

      <div className="mt-6">
        <div className="bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] rounded-full p-1">
          <div className="flex">
            <button
              className={`flex-1 ${activeView === "weekly" ? "bg-background" : "bg-transparent"} text-white py-2 px-4 rounded-full text-center font-semibold transition-all duration-300`}
              onClick={() => setActiveView("weekly")}
            >
              Weekly Program
            </button>
            <button
              className={`flex-1 ${activeView === "quarterly" ? "bg-background" : "bg-transparent"} text-white py-2 px-4 rounded-full text-center font-semibold transition-all duration-300`}
              onClick={() => setActiveView("quarterly")}
            >
              Quarterly Plan
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handlePreviousMonth}
            className="text-gray-400 text-xl flex items-center hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            December
          </button>
          <h2 className="text-white text-2xl font-bold">{currentMonth}</h2>
          <button 
            onClick={handleNextMonth}
            className="text-gray-400 text-xl flex items-center hover:text-white transition-colors"
          >
            February
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-[#60a5fa] font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div key={day} className="flex justify-center">
              <Link to={day === 16 ? "/workout/16" : "#"}>
                <button
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${day === 16 ? "bg-[#7c57ff] scale-110 shadow-lg" : "bg-white hover:bg-gray-100"}`}
                >
                  <span className={day === 16 ? "text-white font-bold" : "text-gray-900"}>
                    {day}
                  </span>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}
