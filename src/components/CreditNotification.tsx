import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Sparkles, TrendingUp } from 'lucide-react';

interface CreditNotificationProps {
  credits: number;
  source: 'credit-builder' | 'daily-login' | 'purchase';
  streakCount?: number;
  onComplete?: () => void;
}

export default function CreditNotification({
  credits,
  source,
  streakCount,
  onComplete
}: CreditNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 300); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getSourceMessage = () => {
    switch (source) {
      case 'credit-builder':
        return 'Credit Builder Reward!';
      case 'daily-login':
        return streakCount && streakCount > 1
          ? `Daily Login Streak! (${streakCount} days)`
          : 'Daily Login Bonus!';
      case 'purchase':
        return 'Credits Purchased!';
      default:
        return 'Credits Earned!';
    }
  };

  const getSourceColor = () => {
    switch (source) {
      case 'credit-builder':
        return 'from-green-500 to-emerald-600';
      case 'daily-login':
        return 'from-blue-500 to-cyan-600';
      case 'purchase':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-yellow-500 to-orange-600';
    }
  };

  const getSourceIcon = () => {
    switch (source) {
      case 'credit-builder':
        return <TrendingUp className="w-6 h-6" />;
      case 'daily-login':
        return <Sparkles className="w-6 h-6" />;
      case 'purchase':
        return <Coins className="w-6 h-6" />;
      default:
        return <Coins className="w-6 h-6" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`bg-gradient-to-r ${getSourceColor()} text-white rounded-xl shadow-2xl p-4 border border-white/20 backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  {getSourceIcon()}
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium opacity-90">
                  {getSourceMessage()}
                </div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  +{credits}
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3, repeat: 3 }}
                    className="text-lg"
                  >
                    💰
                  </motion.span>
                </div>
                {streakCount && streakCount > 1 && (
                  <div className="text-xs opacity-75 mt-1">
                    Keep the streak going! 🔥
                  </div>
                )}
              </div>
            </div>

            {/* Animated particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/60 rounded-full"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: '100%',
                    opacity: 0
                  }}
                  animate={{
                    y: '-20%',
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}