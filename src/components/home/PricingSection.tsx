import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

export default function PricingSection() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const freePlanFeatures = [
    "5 questions per day",
    "Basic legal information",
    "Standard templates",
    "Web access only",
  ];

  const proPlanFeatures = [
    "Unlimited questions",
    "Detailed legal explanations",
    "Premium document templates",
    "SMS and email notifications",
    "Priority response times",
    "Web, mobile and email access",
  ];

  const premiumPlanFeatures = [
    "100 credits",
    "All Pro features",
    "Full access to all AI agents",
    "Priority support",
    "Best value for power users",
  ];

  // If you want to use your backend to create a Stripe session, use API_BASE_URL here.
  // Otherwise, keep the direct Stripe link.
  const handlePayment = async () => {
    try {
      setIsLoading(true);
      // Example: Use API_BASE_URL for a backend call (demonstration only)
      // This will not actually create a session unless your backend supports it
      if (user) {
        // Example API usage
        await fetch(`${API_BASE_URL}/user/upgrade`, { method: 'POST', credentials: 'include' });
      }
      // For now, keep the direct Stripe payment link:
      window.location.href = 'https://buy.stripe.com/9AQeYP2cUcq0eA0bIU';
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to redirect to payment page",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="sm:flex sm:flex-col sm:align-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:text-center">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Start for free, upgrade when you need more
          </p>
        </motion.div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-5xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {/* Free Plan */}
          <motion.div 
            className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">
                Perfect for quick questions and occasional help with consumer issues.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <Link to="/chat">
                <Button variant="outline" className="mt-8 w-full border-primary text-primary hover:bg-primary-50">
                  Start Chatting Free
                </Button>
              </Link>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
              <ul className="mt-6 space-y-4">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div 
            className="border border-primary rounded-lg shadow-md divide-y divide-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-6 pt-10 relative">
              <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-10">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold bg-primary-100 text-primary-800 shadow-md border border-primary-200">
                  Popular
                </span>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">
                Comprehensive support for all your consumer law needs.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <Button
                className="mt-8 w-full"
                onClick={handlePayment}
                disabled={isLoading || !user}
              >
                {isLoading ? 'Processing...' : user ? 'Upgrade to Pro' : 'Login to Upgrade'}
              </Button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
              <ul className="mt-6 space-y-4">
                {proPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div 
            className="border-2 border-yellow-400 rounded-lg shadow-lg divide-y divide-gray-200 bg-white scale-105"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-6 pt-10 relative">
              <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-10">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold bg-yellow-200 text-yellow-900 shadow-md border border-yellow-300">
                  Best Value
                </span>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Premium</h3>
              <p className="mt-4 text-sm text-gray-500">
                100 credits per month, all features, and full AI agent access.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$50</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <Button
                className="mt-8 w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-300 border-yellow-500"
                onClick={() => window.location.href = 'https://buy.stripe.com/6oU28rgaCbn40uD7nGew80k'}
              >
                Get 100 Credits Monthly
              </Button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
              <ul className="mt-6 space-y-4">
                {premiumPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
