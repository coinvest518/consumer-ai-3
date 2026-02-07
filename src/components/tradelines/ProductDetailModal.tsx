import { X, ChevronRight, Building, CreditCard, Calendar, TrendingUp, CheckCircle, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface TradelineProduct {
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

interface ProductDetailModalProps {
  product: TradelineProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: (product: TradelineProduct) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onGetStarted
}: ProductDetailModalProps) {
  if (!product) return null;

  const accountAgeText = `${product.account_age_years}y ${product.account_age_months}m`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{product.bank_name}</DialogTitle>
              <DialogDescription className="text-base">Card ID: {product.card_id}</DialogDescription>
            </div>
            {product.stock_count > 0 && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg px-4 py-2 rounded-full animate-pulse">
                🔥 {product.stock_count} in stock
              </Badge>
            )}
            {product.stock_count === 0 && (
              <Badge variant="outline" className="bg-red-50 border-red-300 rounded-full px-4 py-2">
                Out of stock
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credit Card Image */}
          <div className="relative w-full h-56 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden">
            <img 
              src="/card (1).png" 
              alt="Credit Card" 
              className="w-full h-full object-cover opacity-90 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-2xl font-bold tracking-wider">{product.bank_name}</p>
              <p className="text-sm opacity-90 mt-1">Premium Tradeline • Card #{product.card_id}</p>
            </div>
            <div className="absolute top-6 right-6 text-white text-right">
              <p className="text-3xl font-bold">${product.price}</p>
              <p className="text-sm opacity-90">One-time payment</p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Credit Limit</p>
                </div>
                <p className="font-bold text-xl text-blue-700">${product.credit_limit.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-500 rounded-xl">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Account Age</p>
                </div>
                <p className="font-bold text-xl text-purple-700">{accountAgeText}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-500 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Utilization</p>
                </div>
                <p className="font-bold text-xl text-green-700">{product.guarantees.utilization_percent}%</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-orange-500 rounded-xl">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Price</p>
                </div>
                <p className="font-bold text-xl text-green-600">${product.price.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Guarantees */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-base">Guarantees & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">
                  <strong>No Late Payments:</strong> Account shows clean payment history
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">
                  <strong>Low Utilization:</strong> {product.guarantees.utilization_percent}% credit usage for maximum score impact
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">
                  <strong>Guaranteed Reporting:</strong> Posted to bureaus by {product.guarantees.guaranteed_post_date}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">
                  <strong>Secure & Legal:</strong> Compliant tradeline addition with full documentation
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Processing Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="w-0.5 h-12 bg-blue-200 my-2"></div>
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-sm">Purchase Deadline</p>
                  <p className="text-xs text-gray-600">{product.purchase_deadline}</p>
                  <p className="text-xs text-gray-500 mt-1">Complete your order by this date</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div className="w-0.5 h-12 bg-blue-200 my-2"></div>
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-sm">Reporting Begins</p>
                  <p className="text-xs text-gray-600">{product.reporting_period_start}</p>
                  <p className="text-xs text-gray-500 mt-1">Account added to credit bureaus</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-sm">Guaranteed Posted</p>
                  <p className="text-xs text-gray-600">{product.reporting_period_end}</p>
                  <p className="text-xs text-gray-500 mt-1">Confirmed on all three bureaus</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expected Credit Impact</CardTitle>
              <CardDescription>Typical score changes after account reporting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="font-semibold text-blue-900">Score Benefits Include:</p>
                <ul className="list-disc list-inside text-blue-800 mt-1 space-y-1">
                  <li>Improved payment history (35%)</li>
                  <li>Reduced credit utilization (30%)</li>
                  <li>Increased account diversity (10%)</li>
                  <li>Longer average age of accounts (15%)</li>
                </ul>
              </div>
              <p className="text-gray-600 text-xs">
                <strong>Note:</strong> Actual score impact varies by individual credit profile and existing accounts. Results typically seen within 30-60 days of reporting.
              </p>
            </CardContent>
          </Card>

          {/* What You Get */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What's Included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Full tradeline account details</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Legal broker agreement & documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Secure document upload & storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">24/7 support during processing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Confirmation once account is reported</span>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              View Other Tradelines
            </Button>
            <Button
              onClick={() => onGetStarted(product)}
              disabled={product.stock_count === 0}
              className="flex-1"
            >
              Get Started
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
