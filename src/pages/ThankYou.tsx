import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import type { PaymentVerificationResponse } from '@/lib/types';

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID found');
      return;
    }
    if (!user || !user.id) {
      setStatus('error');
      setErrorMessage('You must be logged in to verify your payment.');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    api.verifyPayment(sessionId, user.id)
      .then((res: PaymentVerificationResponse) => {
        if (res && res.paid && res.processed) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Payment could not be verified. Please contact support.');
        }
      })
      .catch((err: any) => {
        setStatus('error');
        setErrorMessage(err?.message || 'Payment verification failed.');
      });
  }, [searchParams, user, navigate]);

  if (status === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Verifying Your Purchase...</h1>
              <p className="mt-4 text-sm text-gray-600">
                Please wait while we verify your payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <XCircle className="h-8 w-8 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Payment Verification Failed</h1>
              <p className="mt-4 text-sm text-gray-600 mb-8">
                {errorMessage || 'We could not verify your payment. Please try again or contact support.'}
              </p>
              <Button asChild>
                <Link to="/">Return Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Thank You for Your Purchase!</h1>
            
            <p className="mt-4 text-sm text-gray-600">
              We've added <span className="font-bold">50 credits</span> to your account. 
              You can now continue asking more questions.
            </p>
            
            {!user && (
              <p className="mt-2 text-sm text-amber-600">
                You'll be redirected to the login page shortly to access your additional credits.
              </p>
            )}

            <div className="mt-8">
              <Button asChild className="w-full">
                <Link to={user ? "/chat" : "/login"}>
                  {user ? "Continue Chatting" : "Log In to Continue"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ThankYou;