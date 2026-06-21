import { motion } from 'framer-motion';

export default function HealthBar({ p1Count, p2Count }) {
  const total = p1Count + p2Count;
  // Prevent division by zero if data hasn't loaded
  const p1Percentage = total === 0 ? 50 : (p1Count / total) * 100;

  return (
    <div className="w-11/12 max-w-6xl mx-auto h-16 bg-gray-900 border-4 border-gray-400 flex relative health-bar-container z-10">
      
      {/* Player 1 Bar (Left Side) */}
      <motion.div 
        className="h-full bg-gradient-to-r from-blue-800 to-blue-400"
        initial={{ width: '50%' }}
        animate={{ width: `${p1Percentage}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      {/* Visual Divider (The "Clash" point) */}
      <div className="absolute top-0 bottom-0 w-2 bg-white transform -translate-x-1/2 z-20 shadow-lg" 
           style={{ left: `${p1Percentage}%` }} />

      {/* Player 2 Bar (Right Side) */}
      <motion.div 
        className="h-full bg-gradient-to-l from-red-800 to-red-400"
        initial={{ width: '50%' }}
        animate={{ width: `${100 - p1Percentage}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </div>
  );
}
