import { AnimatePresence } from "framer-motion";
import ToastNotification from "./ToastNotification";

const ToastContainer = ({ toasts, onCloseToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={onCloseToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;