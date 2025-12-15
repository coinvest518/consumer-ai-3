
import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CheckoutForm from "./CheckoutForm";

// This button now triggers the modal in Header via a custom event

export default function PricingSection() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgrade = async (plan: string) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to upgrade.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user.id })
      });
      const data = await res.json();
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setIsModalOpen(true);
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      let message = 'Payment failed';
      if (error && typeof error === 'object' && 'message' in error) {
        message = (error as any).message;
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutSuccess = () => {
    setIsModalOpen(false);
    setClientSecret(null);
    toast({ 
      title: 'Payment successful!', 
      description: 'Your subscription has been activated. Welcome to the premium experience!',
      variant: 'default' 
    });
    // Optionally redirect to dashboard or refresh user data
    window.location.reload(); // Refresh to update user status
  };

  const handleCheckoutCancel = () => {
    setIsModalOpen(false);
    setClientSecret(null);
    toast({ 
      title: 'Payment cancelled', 
      description: 'No charges were made. You can try again anytime.',
      variant: 'default' 
    });
  };

  const starterPlanFeatures = [
    "100 credits/month",
    "Access to advanced AI models",
    "File uploads",
    "Longer chat history",
    "Email support"
  ];

  const proPlanFeatures = [
    "300 credits/month",
    "All Starter features",
    "Priority queue",
    "Advanced features (summarization, export)",
    "Early access to new features",
    "API access"
  ];

  const powerPlanFeatures = [
    "1500 credits/month",
    "All Pro features",
    "Dedicated support",
    "Custom integrations",
    "Best value for teams & power users"
  ];

  // ...existing code...

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
            Choose the plan that's right for you
          </p>
        </motion.div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-5xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">

          {/* Starter Plan */}
          <motion.div 
            className="border border-blue-400 rounded-lg shadow-md divide-y divide-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-6 pt-10 relative">
              <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-10">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 shadow-md border border-blue-200">
                  Starter
                </span>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Starter</h3>
              <p className="mt-4 text-sm text-gray-500">
                For regular users who want more power and flexibility.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <Button
                className="mt-8 w-full bg-blue-500 text-white hover:bg-blue-600 border-blue-700"
                onClick={() => handleUpgrade('starter')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Starter'}
              </Button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
              <ul className="mt-6 space-y-4">
                {starterPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div 
            className="border-2 border-primary rounded-lg shadow-lg divide-y divide-gray-200 bg-white scale-105"
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
                For power users and professionals who need more credits and features.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$50</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <Button
                className="mt-8 w-full bg-primary text-white hover:bg-primary-700 border-primary-800"
                onClick={() => handleUpgrade('pro')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
              <ul className="mt-6 space-y-4">
                {proPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-primary" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Power Plan */}
          <motion.div 
            className="border-2 border-yellow-400 rounded-lg shadow-lg divide-y divide-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-6 pt-10 relative">
              <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-10">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold bg-yellow-200 text-yellow-900 shadow-md border border-yellow-300">
                  Power
                </span>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Power</h3>
              <p className="mt-4 text-sm text-gray-500">
                For teams and high-volume users who need the most credits and support.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$99</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <Button
                className="mt-8 w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-300 border-yellow-500"
                onClick={() => handleUpgrade('power')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Power'}
              </Button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
              <ul className="mt-6 space-y-4">
                {powerPlanFeatures.map((feature, index) => (
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Complete Your Purchase</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            {clientSecret && (
              <CheckoutForm 
                clientSecret={clientSecret} 
                onSuccess={handleCheckoutSuccess}
                onCancel={handleCheckoutCancel}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
