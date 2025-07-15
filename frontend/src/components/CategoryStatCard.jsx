import { motion } from "framer-motion";
export default function CategoryStatCard({ category, count, desc, color, index }) {
  return (
    <motion.div
    initial={{opacity: 0, y: 50}}
    whileInView={{opacity: 1, y: 0}}
    transition={{duration: .5}}
    viewport={{once:true}}
      className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg flex flex-col min-w-[220px] border-l-8 ${color} transition-transform hover:scale-105 hover:shadow-2xl duration-200`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl font-extrabold text-blue-400 drop-shadow">
          {count}
        </span>
        <span
          className={`w-3 h-3 rounded-full ${color.replace("border-", "bg-")}`}
        ></span>
      </div>
      <div
        className="text-slate-100 font-semibold text-lg mb-1 truncate"
        title={category}
      >
        {category}
      </div>
      <div
        className="text-slate-400 text-xs leading-snug line-clamp-2"
        title={desc}
      >
        {desc}
      </div>
    </motion.div>
  );
}


// hierarchy