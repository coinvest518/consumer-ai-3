import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function CreditCardNFT() {
  const { user } = useAuth();

  return (
    <div className="relative mx-auto w-full rounded-lg lg:max-w-md">
      {/* Animated Credit Card NFT */}
      <motion.div
        className="relative h-96 rounded-2xl overflow-hidden"
        initial={{ rotateY: -10, rotateX: 5 }}
        animate={{ 
          rotateY: [-10, 10, -10],
          rotateX: [5, -5, 5],
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      >
        {/* Card Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800 rounded-2xl shadow-2xl">
          {/* Animated mesh pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Glowing orbs */}
          <motion.div 
            className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/30 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/30 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* Card Content */}
        <div className="relative z-10 h-full p-6 flex flex-col justify-between text-white">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <motion.div 
                className="flex items-center gap-2 mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <span className="text-xs font-medium tracking-wider uppercase text-cyan-200">YieldBot Credit</span>
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Genesis NFT
              </motion.h3>
            </div>
            <motion.div 
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="h-6 w-6 text-cyan-300" />
            </motion.div>
          </div>

          {/* Middle - Token Info */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-cyan-200">Early Investor Bonus</p>
                <p className="text-lg font-bold">2X Token Multiplier</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <p className="text-xs text-cyan-200">Credit Score</p>
                <motion.p 
                  className="text-xl font-bold text-green-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  850
                </motion.p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <p className="text-xs text-cyan-200">Tokens Earned</p>
                <motion.p 
                  className="text-xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Zap className="inline h-4 w-4 text-yellow-400" /> 1,250
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Bottom - CTA */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-xs text-center text-cyan-200">
              Be an early investor in the future of credit
            </p>
            {user ? (
              <Link to="/dashboard" className="block">
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/25"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  View Your NFT
                </Button>
              </Link>
            ) : (
              <a 
                href="https://yieldbot.cc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/25"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Claim Early Access
                </Button>
              </a>
            )}
            <a 
              href="https://yieldbot.cc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center text-xs text-cyan-300 hover:text-white transition-colors"
            >
              Learn more at yieldbot.cc →
            </a>
          </motion.div>
        </div>

        {/* Holographic shimmer effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
      </motion.div>
    </div>
  );
}
