import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, CheckCircle } from "lucide-react";

export default function BookingCalendar() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "credit-repair-chat" });
      cal("ui", { 
        hideEventTypeDetails: false, 
        layout: "month_view",
        theme: "dark"
      });
    })();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Calendar className="w-4 h-4" />
            Free Consultation
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Book Your Free Credit Repair Session
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Schedule a free 30-minute consultation with our AI-powered credit experts. 
            Get personalized advice on improving your credit score.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto"
        >
          {[
            { icon: Clock, text: "30-minute session" },
            { icon: Video, text: "Video or phone call" },
            { icon: CheckCircle, text: "100% free, no obligation" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-2 text-muted-foreground"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl"
        >
          <Cal
            namespace="credit-repair-chat"
            calLink="bookme-daniel/credit-repair-chat"
            style={{ 
              width: "100%", 
              height: "600px", 
              overflow: "scroll" 
            }}
            config={{ 
              layout: "month_view",
              theme: "dark"
            }}
          />
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>🔒 Your information is secure and will never be shared</p>
        </motion.div>
      </div>
    </section>
  );
}
