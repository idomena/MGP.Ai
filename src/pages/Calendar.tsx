import MobileHeader from "@/components/MobileHeader";
import NavigationBar from "@/components/NavigationBar";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const [activeView, setActiveView] = useState<"weekly" | "quarterly">("quarterly");
  const [currentMonth, setCurrentMonth] = useState("JANUARY");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

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
    <div className="min-h-screen bg-background pb-24 px-4 overflow-y-auto" role="main" aria-label="Calendar page">
      <MobileHeader />

      <nav className="mt-6" role="tablist" aria-label="Calendar view selector">
        <div className="bg-gradient-to-r from-[#00c6ff] to-[#7c57ff] rounded-full p-1">
          <div className="flex">
            <button
              role="tab"
              aria-selected={activeView === "weekly"}
              className={`flex-1 ${activeView === "weekly" ? "bg-background" : "bg-transparent"} text-white py-2 px-4 rounded-full text-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50`}
              onClick={() => setActiveView("weekly")}
              data-testid="tab-weekly"
            >
              Weekly Program
            </button>
            <button
              role="tab"
              aria-selected={activeView === "quarterly"}
              className={`flex-1 ${activeView === "quarterly" ? "bg-background" : "bg-transparent"} text-white py-2 px-4 rounded-full text-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50`}
              onClick={() => setActiveView("quarterly")}
              data-testid="tab-quarterly"
            >
              Quarterly Plan
            </button>
          </div>
        </div>
      </nav>

      <section className="mt-8" aria-label="Monthly calendar">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handlePreviousMonth}
            className="text-gray-400 text-xl flex items-center hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-lg p-1"
            aria-label="Go to previous month"
            data-testid="button-prev-month"
          >
            <ChevronLeft className="w-5 h-5 mr-1" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">December</span>
          </button>
          <h1 className="text-white text-2xl font-bold" data-testid="text-current-month">{currentMonth}</h1>
          <button 
            onClick={handleNextMonth}
            className="text-gray-400 text-xl flex items-center hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c57ff] rounded-lg p-1"
            aria-label="Go to next month"
            data-testid="button-next-month"
          >
            <span className="sr-only sm:not-sr-only">February</span>
            <ChevronRight className="w-5 h-5 ml-1" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4" role="row" aria-label="Days of the week">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-[#60a5fa] font-medium" role="columnheader" aria-label={day}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2" role="grid" aria-label="Calendar days">
          {days.map((day) => (
            <div key={day} className="flex justify-center" role="gridcell">
              <Link to={day === 16 ? "/workout/16" : "#"} aria-label={`Day ${day}${day === 16 ? ", today's workout" : ""}`}>
                <button
                  onClick={() => setSelectedDate(day)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#7c57ff]
                    ${day === 16 
                      ? "bg-[#7c57ff] scale-110 shadow-lg ring-2 ring-[#7c57ff]/50" 
                      : selectedDate === day
                      ? "bg-[#4a4a4a] ring-2 ring-[#60a5fa]"
                      : "bg-white hover:bg-gray-100"
                    }`}
                  aria-pressed={selectedDate === day}
                  data-testid={`button-day-${day}`}
                >
                  <span className={day === 16 || selectedDate === day ? "text-white font-bold" : "text-gray-900"}>
                    {day}
                  </span>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <NavigationBar />
    </div>
  );
}
