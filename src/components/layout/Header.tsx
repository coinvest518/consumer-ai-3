import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { X, Menu } from "lucide-react";

export default function Header() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary">
          ConsumerAI
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/chat" className="text-gray-600 hover:text-primary transition-colors">Chat</Link>
          <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
          <Link to="/pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</Link>
          <Link to="/credit-builder" className="text-gray-600 hover:text-primary transition-colors">Credit Builder</Link>
          <a href="https://buymeacoffee.com/coinvest/extras" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">Free Products</a>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link to="/chat">
                <Button size="sm">New Chat</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-500">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-3">
            <Link to="/chat" className="text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Chat</Link>
            <a href="#features" className="text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <Link to="/pricing" className="text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link to="/credit-builder" className="text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Credit Builder</Link>
            <a href="https://buymeacoffee.com/coinvest/extras" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Free Resources</a>
          </nav>
          
          <div className="border-t pt-4 space-y-3">
            {user ? (
              <div className="flex gap-2">
                <Link to="/dashboard" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
                <Link to="/chat" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Chat</Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
