import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayCircle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { VideoModal } from "@/components/ui/VideoModal";
import CreditCardNFT from "./CreditCardNFT";

export default function HeroSection() {
  const { user } = useAuth();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pb-32">
      {/* Background gradient and patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white z-0"></div>
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 transform">
        <div className="w-96 h-96 rounded-full bg-secondary/10 animate-pulse-slow"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 transform">
        <div className="w-96 h-96 rounded-full bg-cyan-500/10 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <motion.div 
            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:flex-col lg:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>
              <span className="block text-sm font-semibold uppercase tracking-wide text-secondary">
                Free AI-Powered Legal Help
              </span>
              <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                <span className="block text-gray-900">Consumer Law</span>
                <span className="block text-primary">AI Assistant.</span>
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Get instant answers to your credit, debt, and consumer protection questions from an AI trained on real laws and legal cases.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <motion.div 
                  className="rounded-md shadow"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    to={user ? "/chat" : "/login"} 
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10"
                  >
                    {user ? "Start Chatting" : "Start Chatting Free"}
                  </Link>
                </motion.div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a href="#how-it-works" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition">
                    How It Works
                  </a>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                No credit card required. Start asking questions right away.
                <span className="ml-2 inline-flex items-center text-blue-600">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Video support available
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CreditCardNFT />
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="relative z-10 mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center gap-4 flex-wrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-primary hover:bg-primary/10"
          onClick={() => setIsVideoOpen(true)}
        >
          <PlayCircle className="h-4 w-4" /> Watch instruction video
        </Button>
        <a href="https://cal.com/bookme-daniel" target="_blank" rel="noopener noreferrer">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
          >
            <Calendar className="h-4 w-4" /> Book a Free Consultation
          </Button>
        </a>
      </motion.div>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoId="6NW2gXoezaE"
      />
    </section>
  );
}