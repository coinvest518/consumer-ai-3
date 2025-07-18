import { BrowserRouter, Routes, Route } from "react-router-dom";
import { inject } from "@vercel/analytics";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { getBaseUrl } from "./lib/config";
import "./debug-auth"; // Import debug helper


// Import pages
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import NotFound from "./pages/not-found";
import ThankYou from "./pages/ThankYou";
import Pricing from "./pages/Pricing";
import CreditBuilderPage from "./pages/CreditBuilderPage";

inject();
function App() {
  // Get base URL for the router
  const baseUrl = getBaseUrl();

  return (
    <BrowserRouter basename={baseUrl}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
