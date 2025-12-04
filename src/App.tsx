import { WagmiProvider } from 'wagmi';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { inject } from "@vercel/analytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { getBaseUrl } from "./lib/config";
import "./debug-auth";


import { createAppKit } from '@reown/appkit/react';
import {
  mainnet,
  polygon,
  polygonAmoy,
  bsc,
  arbitrum,
  optimism,
  base,
  avalanche,
  fantom,
  zksync,
  linea,
  scroll,
  gnosis,
  celo,
  moonbeam,
  aurora,
  cronos,
} from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import NotFound from "./pages/not-found";
import ThankYou from "./pages/ThankYou";
import Pricing from "./pages/Pricing";
import CreditBuilderPage from "./pages/CreditBuilderPage";



const projectId = 'cd2c15a170750ad01e62ef80f2ba74f4';


// AppKit metadata
const metadata = {
  name: 'AppKit Example',
  description: 'AppKit Example',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// Set the networks as a non-empty tuple of AppKitNetwork
import type { AppKitNetwork } from '@reown/appkit-common';
const networks = [
  mainnet,
  polygon,
  polygonAmoy,
  bsc,
  arbitrum,
  optimism,
  base,
  avalanche,
  fantom,
  zksync,
  linea,
  scroll,
  gnosis,
  celo,
  moonbeam,
  aurora,
  cronos,
] as [AppKitNetwork, ...AppKitNetwork[]];
// Create QueryClient instance
const queryClient = new QueryClient();

// Create Wagmi Adapter with reconnect disabled
const wagmiAdapter = new WagmiAdapter({
  networks: [...networks],
  projectId,
  ssr: true, // Prevents auto-reconnect on page load
});

// Create modal - configured to NOT auto-connect on page load
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  },
  // Disable automatic reconnection on page load
  enableReconnect: false,
  // Disable wallet guide prompt
  enableWalletGuide: false,
});

inject();

function App() {
  const baseUrl = getBaseUrl();
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount={false}>
        <BrowserRouter basename={baseUrl}>
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
        </BrowserRouter>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;