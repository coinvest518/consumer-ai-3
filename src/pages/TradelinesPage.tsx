import { useState } from "react";
import { Building, TrendingUp, DollarSign, Zap, ArrowRight, LogIn, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TradelineCheckout from "@/components/tradelines/TradelineCheckout";
import ProductDetailModal from "@/components/tradelines/ProductDetailModal";
import { useAuth } from "@/hooks/useAuth";
import { tradelineInventory } from "@/data/tradelineInventory";

interface TradelineProduct {
  id: string;
  card_id: string;
  bank_name: string;
  credit_limit: number;
  account_age_years: number;
  account_age_months: number;
  purchase_deadline: string;
  reporting_period_start: string;
  reporting_period_end: string;
  price: number;
  stock_count: number;
  guarantees: {
    no_late_payments: boolean;
    utilization_percent: number;
    guaranteed_post_date: string;
  };
}

export default function TradelinesPage() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<TradelineProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // Convert static inventory to tradeline format
  const tradelines: TradelineProduct[] = tradelineInventory.map(item => {
    // Parse account age (e.g., "4y4m" → years: 4, months: 4)
    const ageMatch = item.accountAge.match(/(\d+)y(\d+)m/);
    const years = ageMatch ? parseInt(ageMatch[1]) : 0;
    const months = ageMatch ? parseInt(ageMatch[2]) : 0;

    // Convert date formats (e.g., "Mar 1st" → "2026-03-01")
    const parseDate = (dateStr: string) => {
      const months: any = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
      const match = dateStr.match(/(\w+)\s(\d+)/);
      if (match) {
        const month = months[match[1]];
        const day = match[2].padStart(2, '0');
        return `2026-${month}-${day}`;
      }
      return dateStr; // Already in ISO format
    };

    return {
      id: item.cardId,
      card_id: item.cardId,
      bank_name: item.bank,
      credit_limit: item.creditLimit,
      account_age_years: years,
      account_age_months: months,
      purchase_deadline: parseDate(item.purchaseDeadline),
      reporting_period_start: parseDate(item.reportingStart),
      reporting_period_end: parseDate(item.reportingEnd),
      price: item.price,
      stock_count: item.stock,
      guarantees: {
        no_late_payments: item.guarantees?.noLatePayments ?? true,
        utilization_percent: item.guarantees?.utilizationPercent ?? 15,
        guaranteed_post_date: item.guarantees?.guaranteedPostDate ?? item.reportingEnd
      }
    };
  }).filter(item => item.stock_count > 0); // Only show in-stock items

  const handleViewDetails = (product: TradelineProduct) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleGetStarted = (product: TradelineProduct) => {
    // Check if user is logged in
    if (!user) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 5000);
      return;
    }

    setSelectedProduct(product);
    setShowDetailModal(false);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (orderData: any) => {
    setShowCheckout(false);
    // Note: In production, you'd refresh from DB to show updated stock
    // For now, static data remains unchanged until next deployment
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Login Alert */}
      {showLoginAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <LogIn className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please <a href="/login" className="underline font-semibold">login</a> or <a href="/signup" className="underline font-semibold">create an account</a> to purchase tradelines.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Premium Tradelines
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed">
              Add established credit accounts to your profile and improve your credit score. All tradelines are legally verified and reported to major bureaus.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm">
                ⚡ Fast 24hr Setup
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm">
                ✓ FCRA Compliant
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm">
                🔒 100% Secure
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-16 -mt-10">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Avg. Score Increase</p>
              </div>
              <p className="text-3xl font-bold text-green-700">50-100 pts</p>
              <p className="text-sm text-gray-600 mt-2">Within 60 days</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Low Utilization</p>
              </div>
              <p className="text-3xl font-bold text-blue-700">≤15%</p>
              <p className="text-sm text-gray-600 mt-2">Guaranteed</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Quick Setup</p>
              </div>
              <p className="text-3xl font-bold text-yellow-700">24 hrs</p>
              <p className="text-sm text-gray-600 mt-2">From purchase</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Active Tradelines</p>
              </div>
              <p className="text-3xl font-bold text-purple-700">{tradelines.length}</p>
              <p className="text-sm text-gray-600 mt-2">In stock</p>
            </CardContent>
          </Card>
        </div>

        {/* Login Required Alert */}
        {!user && (
          <Alert className="mb-10 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
            <LogIn className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-900 text-base">
              <strong>Browsing only:</strong> You must be logged in to purchase tradelines. Please <a href="/login" className="underline font-semibold hover:text-amber-700 transition-colors">log in</a> or <a href="/signup" className="underline font-semibold hover:text-amber-700 transition-colors">create an account</a>.
            </AlertDescription>
          </Alert>
        )}

        {/* Tradelines Grid */}
        {tradelines.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-10 text-gray-800">Available Tradelines</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tradelines.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-300 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-gray-50"
                >
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-3xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-2xl font-bold">{product.bank_name}</CardTitle>
                        <CardDescription className="text-blue-100">Card ID: {product.card_id}</CardDescription>
                      </div>
                      {product.stock_count > 0 && (
                        <Badge className="bg-green-400 text-green-900 border-0 shadow-lg px-3 py-1 rounded-full animate-pulse">
                          🔥 {product.stock_count} left
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-2xl border-2 border-blue-100">
                        <p className="text-xs text-gray-600 font-medium">Credit Limit</p>
                        <p className="font-bold text-lg text-blue-700">${product.credit_limit.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-2xl border-2 border-purple-100">
                        <p className="text-xs text-gray-600 font-medium">Account Age</p>
                        <p className="font-bold text-lg text-purple-700">{product.account_age_years}y {product.account_age_months}m</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-2xl border-2 border-green-100">
                        <p className="text-xs text-gray-600 font-medium">Utilization</p>
                        <p className="font-bold text-lg text-green-700">{product.guarantees.utilization_percent}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-3 rounded-2xl border-2 border-yellow-200">
                        <p className="text-xs text-gray-600 font-medium">Price</p>
                        <p className="font-bold text-lg text-green-600">${product.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border-2 border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Reporting Timeline
                      </p>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p className="flex items-center gap-2">📅 Deadline: {new Date(product.purchase_deadline).toLocaleDateString()}</p>
                        <p className="flex items-center gap-2">✓ Reports: {new Date(product.reporting_period_end).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Guarantees */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 rounded-full px-3 py-1">
                        ✓ No late payments
                      </Badge>
                      <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 rounded-full px-3 py-1">
                        ✓ Low utilization
                      </Badge>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-3 pt-3">
                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(product)}
                        className="flex-1 rounded-xl hover:bg-gray-50 border-2 hover:border-gray-300 transition-all"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleGetStarted(product)}
                        disabled={!user || product.stock_count === 0}
                        className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>

                    {!user && (
                      <p className="text-xs text-gray-600 text-center bg-gray-50 py-2 rounded-xl">🔒 Log in to purchase</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tradelines.length === 0 && (
          <div className="text-center py-20">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tradelines Available</h3>
            <p className="text-gray-600 mb-6">
              Check back soon for available tradelines. We update our inventory regularly.
            </p>
          </div>
        )}

        {/* FAQ Section */}
        <section className="mt-20 bg-gradient-to-br from-white to-blue-50 rounded-3xl p-10 border-2 border-blue-100 shadow-xl">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <h3 className="font-bold text-lg mb-3 text-blue-600">How long does reporting take?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Most tradelines report within 30-60 days of purchase. We guarantee reporting by the specified date or your money back.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <h3 className="font-bold text-lg mb-3 text-purple-600">Is this legal?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Yes. We work with licensed brokers to add you as an authorized user on legitimate accounts. All transactions comply with FCRA regulations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <h3 className="font-bold text-lg mb-3 text-green-600">What about my privacy?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                All documents are encrypted and stored securely. We never share your information with third parties without explicit consent.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <h3 className="font-bold text-lg mb-3 text-orange-600">Can I remove a tradeline?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Yes. You can request removal at any time. It typically takes 30-60 days for the account to stop reporting.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <>
          <ProductDetailModal
            product={selectedProduct}
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            onGetStarted={handleGetStarted}
          />
          <TradelineCheckout
            product={selectedProduct}
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            onSuccess={handleCheckoutSuccess}
          />
        </>
      )}
    </div>
  );
}