import { BrowserRouter, Routes, Route } from "react-router-dom";
import { inject } from "@vercel/analytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { getBaseUrl } from "./lib/config";
import "./debug-auth";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import NotFound from "./pages/not-found";
import ThankYou from "./pages/ThankYou";
import Pricing from "./pages/Pricing";
import CreditBuilderPage from "./pages/CreditBuilderPage";
import TradelinesPage from "./pages/TradelinesPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import TermsOfService from "./pages/TermsOfService";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// Create QueryClient instance
const queryClient = new QueryClient();

inject();

function App() {
  const baseUrl = getBaseUrl();
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename={baseUrl}>
            <AuthProvider>
              <ChatProvider>
                <Elements stripe={stripePromise}>
                  <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><EnhancedDashboard /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/credit-builder" element={<CreditBuilderPage />} />
                  <Route path="/tradelines" element={<TradelinesPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:id" element={<BlogPostPage />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Layout>
              </Elements>
            </ChatProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;