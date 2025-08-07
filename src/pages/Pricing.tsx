import PricingSection from '@/components/home/PricingSection';
import { motion } from 'framer-motion';
import ElevenLabsChatbot from '@/components/ElevenLabsChatbot';

export default function Pricing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PricingSection />
      <ElevenLabsChatbot />
    </motion.div>
  );
}
