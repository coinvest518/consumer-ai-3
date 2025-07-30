import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import CryptoPaymentForm from "../wallet/CryptoPaymentForm";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function Header() {
  const { user, signOut } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    // In a real app, you'd likely want to present a modal for wallet selection
    // if multiple connectors are available.
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  // Listen for global modal open event from other components
  useEffect(() => {
    const openModal = () => {
      if (isConnected) {
        setModalOpen(true);
      } else {
        // If wallet is not connected, initiate connection first.
        handleConnect();
      }
    };
    window.addEventListener('open-crypto-modal', openModal);
    return () => window.removeEventListener('open-crypto-modal', openModal);
  }, [isConnected, connectors, connect]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Payment result handler (optional: show toast, etc.)
  const handlePaymentResult = (result: any) => {
    setModalOpen(false);
    // Optionally: show toast or notification here
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          ConsumerAI
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/chat" className="text-gray-600 hover:text-primary">Chat</Link>
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-gray-600 hover:text-primary"
          >
            Features
          </button>
          <Link to="/pricing" className="text-gray-600 hover:text-primary">Pricing</Link>
          <Link to="/credit-builder" className="text-gray-600 hover:text-primary">Credit Builder</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <Button variant="outline" onClick={() => setModalOpen(true)}>Buy Credits</Button>
              <Button variant="secondary" onClick={() => disconnect()}>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Disconnect"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleConnect}>Connect Wallet</Button>
          )}

          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link to="/chat">
                <Button>New Chat</Button>
              </Link>
              <Button variant="ghost" onClick={signOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-fadeInUp">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-2 text-center">Crypto Payment</h2>
            <p className="mb-4 text-gray-600 text-center">Select chain, token, and amount to pay securely.</p>
            <CryptoPaymentForm onPaymentResult={handlePaymentResult} />
          </div>
        </div>
      )}
    </header>
  );
}
