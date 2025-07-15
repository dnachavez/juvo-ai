import { motion } from "framer-motion";
export default function DashboardCard({ title, value, icon: Icon, color, index }) {
  return (
    <motion.div
    initial={{opacity: 0, y: -20}}
    animate={{opacity: 1, y: 0}}
    transition={{duration: .3, delay: 0.2 * index}}
    className="flex items-center p-4 rounded-lg shadow bg-slate-800 text-slate-100 min-w-[180px]">
      <div className={`p-2 rounded-full ${color} mr-4`}>
        <Icon size={28} />
      </div>
      <div>
        <div className="text-lg font-semibold">{value}</div>
        <div className="text-slate-400 text-sm">{title}</div>
      </div>
    </motion.div>
  );
}
