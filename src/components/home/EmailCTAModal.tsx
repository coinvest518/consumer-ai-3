import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PDF_URL = 'https://ffvvesrqtdktayjwurwm.supabase.co/storage/v1/object/public/users-file-storage/resources/CREDIT%20REPAIR%20EBOOK%202025%20.pdf';
const BOOKING_URL = 'https://cal.com/bookme-daniel/how-to-sue-debt-collectors-consultation'; // Update with your Calendly URL
const PHONE = '518-229-9675';

interface EmailCTAModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EmailCTAModal({ open, onOpenChange }: EmailCTAModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(!!open);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Sync controlled open prop if provided
  useEffect(() => {
    if (typeof open === 'boolean') setIsOpen(open);
  }, [open]);

  // Auto-open modal after 3 seconds on first visit when not controlled
  useEffect(() => {
    if (typeof open === 'boolean') return; // skip auto behavior when controlled
    const hasSeenModal = localStorage.getItem('emailCTA_seen');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('emailCTA_seen', 'true');
      }, 3000); // 3 seconds - faster popup
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Auto-close modal after 5 seconds if not interacting
  useEffect(() => {
    if (isOpen && !submitted) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/email-cta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?.id || '',
        },
        body: JSON.stringify({
          email: email.trim(),
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit');
      }

      const data = await response.json();
      setSubmitted(true);

      // Trigger PDF download — prefer server-provided URL, fallback to constant
      try {
        const downloadUrl = data?.pdfUrl || PDF_URL;
        if (downloadUrl) {
          // Try to force download via temporary anchor
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          // Some browsers respect download, but cross-origin may block; open in new tab as fallback
          try {
            a.download = '';
            document.body.appendChild(a);
            a.click();
            a.remove();
          } catch (e) {
            window.open(downloadUrl, '_blank');
          }
        }
      } catch (err) {
        console.error('PDF download failed:', err);
      }

      // Auto-close after 3 seconds following successful submission
      setTimeout(() => {
        setIsOpen(false);
        // Reset for next session
        setTimeout(() => {
          setSubmitted(false);
          setEmail('');
        }, 300);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Email submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onOpenChange) onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Modal - Fixed positioning centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto w-full max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 hover:scale-110 transform"
              >
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>

              {!submitted ? (
                // Email Collection Form
                <div className="p-8 sm:p-10 pt-12 sm:pt-12">
                  {/* Header with gradient background */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-center mb-8"
                  >
                    <div className="inline-block bg-gradient-to-r from-primary/10 to-blue-100 px-4 py-2 rounded-full mb-4">
                      <p className="text-sm font-semibold text-primary">🎁 Limited Time Offer</p>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 leading-tight">
                      Free Credit Repair Guide
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Download our 2025 guide + earn <span className="font-bold text-primary">10 FREE credits</span>
                    </p>
                  </motion.div>

                  {/* Benefit Preview - Improved */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="bg-gradient-to-br from-primary/5 via-blue-50 to-indigo-50 p-5 rounded-xl mb-7 border border-primary/10"
                  >
                    <ul className="space-y-3">
                      <li className="flex items-start text-sm sm:text-base text-gray-700">
                        <span className="text-primary font-bold mr-3 text-lg">✓</span>
                        <span>Step-by-step credit repair strategies</span>
                      </li>
                      <li className="flex items-start text-sm sm:text-base text-gray-700">
                        <span className="text-primary font-bold mr-3 text-lg">✓</span>
                        <span>Dispute letter templates ready to use</span>
                      </li>
                      <li className="flex items-start text-sm sm:text-base text-gray-700">
                        <span className="text-primary font-bold mr-3 text-lg">✓</span>
                        <span>Legal resources & expert insights</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2.5">
                        Your Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white hover:border-gray-400 placeholder:text-gray-400"
                        disabled={loading}
                      />
                    </motion.div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.12 }}
                      className="space-y-3 pt-2"
                    >
                      <Button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
                      >
                        {loading ? (
                          <>
                            <span className="inline-block animate-spin mr-2">⏳</span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Download size={18} className="mr-2 inline" />
                            Get Free PDF + 10 Credits
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center font-medium">
                        ✓ No spam • Unsubscribe anytime • Secure
                      </p>
                    </motion.div>
                  </form>

                  {/* Contact Options - Improved */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="mt-8 pt-6 border-t border-gray-200"
                  >
                    <p className="text-xs font-semibold text-gray-700 text-center mb-4 uppercase tracking-wide">
                      📞 Need Personal Help?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg text-sm font-semibold text-primary transition-all border border-blue-200 hover:border-primary"
                      >
                        <Calendar size={16} />
                        <span>Schedule</span>
                      </a>
                      <a
                        href={`tel:${PHONE}`}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg text-sm font-semibold text-green-700 transition-all border border-green-200 hover:border-green-500"
                      >
                        <Phone size={16} />
                        <span>Call Now</span>
                      </a>
                    </div>
                  </motion.div>

                  {/* Timer Info */}
                  <p className="text-xs text-gray-400 text-center mt-5 font-medium">
                    ⏱️ Modal closes automatically in 5 seconds
                  </p>
                </div>
              ) : (
                // Success Message - Improved
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 sm:p-10 text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="mb-6"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-4xl">✓</span>
                    </div>
                  </motion.div>

                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                    All Set! 🎉
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
                    Your PDF is downloading and <span className="font-bold text-primary">10 credits</span> have been added to your account.
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-5"
                  >
                    <p className="text-sm font-bold text-green-900">
                      ✓ PDF downloading automatically...
                    </p>
                    <p className="text-xs text-green-700 mt-1">Check your downloads folder</p>
                  </motion.div>

                  <p className="text-xs text-gray-400 font-medium">
                    Modal closing in 3 seconds...
                  </p>
                </motion.div>
              )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
