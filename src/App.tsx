import { BrowserRouter, Routes, Route } from "react-router-dom";
import { inject } from "@vercel/analytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Layout from "./components/layout/Layout";
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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// Create QueryClient instance
const queryClient = new QueryClient();

inject();

function App() {
  const baseUrl = getBaseUrl();
  return (
    <ErrorBoundary>
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
                  <Route path="/credit-builder" element={<ProtectedRoute><CreditBuilderPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </Elements>
            </ChatProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;