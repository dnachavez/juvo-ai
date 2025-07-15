import { useEffect, useState } from "react";
import Header from "./components/Header";
import FloatingNavigation from "./components/FloatingNavigation";
import AnalysisSection from "./components/AnalysisSection";
import HeatmapSection from "./components/HeatmapSection";
import ToastContainer from "./components/ToastContainer";
import useNotifications from "./hooks/useNotifications";
import useHeatmapData from "./hooks/useHeatmapData";
// analysisData will be fetched dynamically by AnalysisSection
import { motion, AnimatePresence } from "framer-motion";
import JuvoIcon from "./assets/juvo.svg";
import {
  BarChart3,
  Map,
  Eye,
} from "lucide-react";

export default function App() {
  // State and data
  const [loader, setLoader] = useState(true);
  const { toasts, removeToast } = useNotifications();
  const { heatmapPoints, loading: heatmapLoading, error: heatmapError, locationStats } = useHeatmapData();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoader(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Navigation items
  const navigationItems = [
    { id: "analysis", label: "Analysis", icon: BarChart3 },
    { id: "heatmap", label: "Heatmap", icon: Map },
  ];

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };



  // Risk color mapping
  const riskColor = {
    high: "red",
    medium: "yellow",
    low: "green",
  };


  return (
    <AnimatePresence mode="wait">
      {loader ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -200 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center h-screen w-full flex-col"
        >
          <img src={JuvoIcon} className="w-50 h-50 animate-spin" />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-slate-950"
        >
          <Header />
          <FloatingNavigation
            navigationItems={navigationItems}
            scrollToSection={scrollToSection}
          />
          <main className="p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-12 lg:space-y-16">
            <AnalysisSection />
            <HeatmapSection 
              riskPoints={heatmapPoints} 
              riskColor={riskColor}
              loading={heatmapLoading}
              error={heatmapError}
              locationStats={locationStats}
            />
          </main>
          <ToastContainer toasts={toasts} onCloseToast={removeToast} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
