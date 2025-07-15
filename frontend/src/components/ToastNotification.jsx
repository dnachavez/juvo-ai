import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastNotification = ({ toast, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'scraping_started':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'data_scraped':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'analysis_started':
        return <Info className="w-5 h-5 text-yellow-400" />;
      case 'new_analysis':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'scraping_started':
        return 'bg-blue-900/90 border-blue-500';
      case 'data_scraped':
        return 'bg-green-900/90 border-green-500';
      case 'analysis_started':
        return 'bg-yellow-900/90 border-yellow-500';
      case 'new_analysis':
        return 'bg-emerald-900/90 border-emerald-500';
      default:
        return 'bg-slate-900/90 border-slate-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${getBgColor(toast.type)} border rounded-lg p-4 shadow-2xl backdrop-blur-sm max-w-sm`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(toast.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {toast.message}
          </p>
          {toast.timestamp && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(toast.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ToastNotification;