import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";

// Facebook comment testimonials with their screenshot images
const facebookComments = [
  {
    name: "Lorenzo Fifth Ave Jones",
    comment: "You're currently helping with my fix credit, and it has been increasing consistently over the last few weeks!",
    likes: 4,
    image: "/testimonials/lorenzo.png",
  },
  {
    name: "Miya Lokey",
    comment: "You Cleared a lot off for me",
    likes: 2,
    image: "/testimonials/miya.png",
  },
  {
    name: "Samuel Yarde",
    comment: "Not directly, but you definitely gave me good information for sure!",
    likes: 1,
    image: "/testimonials/samuel.png",
  },
  {
    name: "Chris Gibby",
    comment: "My credit repair guy don't miss!! Everyday gains!!! Ask him about making money with AI as well!!",
    likes: 1,
    image: "/testimonials/chris.png",
    hasProofImage: true,
  },
];

// Results/proof images
const resultImages = [
  {
    src: "/accountsremoved.jpg",
    alt: "Credit Karma showing accounts removed",
    label: "Accounts Removed",
  },
  {
    src: "/score.jpg",
    alt: "Credit score improvement graph",
    label: "Score Increase",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Real Results from Real Clients
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See what our clients are saying on Facebook and their actual credit improvements
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Left: Facebook Comments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">f</span>
              </div>
              <span className="font-medium text-sm text-muted-foreground">Facebook Reviews</span>
            </div>
            
            {facebookComments.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Screenshot of the actual Facebook comment */}
                <div className="bg-white">
                  <img
                    src={item.image}
                    alt={`${item.name}'s testimonial`}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                </div>
                {/* Show proof image for Chris (Experian notification) */}
                {item.hasProofImage && (
                  <div className="border-t border-border/30 bg-muted/20 p-2">
                    <img
                      src="/testimonials/chris-proof.png"
                      alt="Experian FICO score increase notification"
                      className="w-full h-auto rounded-lg object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Proof Images */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-medium text-sm text-muted-foreground">Verified Results</span>
            </div>

            <div className="grid gap-4">
              {resultImages.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-lg transition-all">
                    <div className="bg-muted/30 p-2">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-44 object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 border-t border-border/30">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {img.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional trust badge */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Quote className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400">98.7% Success Rate</p>
                  <p className="text-sm text-muted-foreground">On disputed items removal</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Join thousands of satisfied customers improving their credit
          </p>
          <a
            href="#booking"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Start Your Free Consultation
          </a>
        </motion.div>
      </div>
    </section>
  );
}
