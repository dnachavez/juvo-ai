import { useEffect, useState } from "react";
import Header from "./components/Header";
import FloatingNavigation from "./components/FloatingNavigation";
import AnalysisSection from "./components/AnalysisSection";
import HeatmapSection from "./components/HeatmapSection";
import analysisData from "./data/analysisData.json";
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



  // Risk points for heatmap - Cebu City locations only
  const riskPoints = [
    { lat: 10.2914, lng: 123.8989, risk: "high", label: "Carbon Market", count: 3 },
    {
      lat: 10.3098,
      lng: 123.8931,
      risk: "medium",
      label: "Fuente Osmeña Circle",
      count: 1
    },
    { lat: 10.3304, lng: 123.9074, risk: "low", label: "IT Park - Apas", count: 1 },
    { lat: 10.3156, lng: 123.8854, risk: "high", label: "Colon Street", count: 2 },
    { lat: 10.2893, lng: 123.9058, risk: "medium", label: "Lahug District", count: 1 },
    { lat: 10.3202, lng: 123.9066, risk: "low", label: "Ayala Center Cebu", count: 1 },
    { lat: 10.3040, lng: 123.8935, risk: "medium", label: "Capitol Site", count: 2 },
    { lat: 10.3377, lng: 123.9354, risk: "high", label: "Banilad", count: 1 },
    { lat: 10.2778, lng: 123.8842, risk: "low", label: "Guadalupe", count: 1 }
  ];
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
            <AnalysisSection analysisData={analysisData} />
            <HeatmapSection riskPoints={riskPoints} riskColor={riskColor} />
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
