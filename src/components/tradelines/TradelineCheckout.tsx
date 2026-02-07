import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Lock, FileText, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AgreementSigning from './AgreementSigning';
import { useAuth } from '@/hooks/useAuth';

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

interface TradelineCheckoutProps {
  product: TradelineProduct;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orderData: any) => void;
}

type CheckoutStep = 'sign' | 'confirm' | 'service-agreement' | 'payment-info' | 'success';

interface SignatureData {
  fullName: string;
  email: string;
  phone: string;
  signatureImage: string;
  timestamp: string;
}

export default function TradelineCheckout({
  product,
  isOpen,
  onClose,
  onSuccess
}: TradelineCheckoutProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('sign');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>Please log in to purchase tradelines</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-600">You must be logged in to proceed with this purchase.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSignAgreement = async (data: SignatureData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/tradelines/sign-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          signatureImage: data.signatureImage,
          timestamp: new Date().toISOString(),
          ipAddress: await getClientIpAddress()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign agreement');
      }

      const result = await response.json();
      setSignatureData(data);
      setAgreementId(result.agreementId);
      setCurrentStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/tradelines/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tradelineId: product.id,
          quantity,
          agreementId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      setOrderData(result);
      setCurrentStep('service-agreement');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    setCurrentStep('payment-info');
  };

  const handleCompleteCheckout = async () => {
    setIsLoading(true);
    try {
      // Send order completion email
      await fetch('/api/email/send-order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          orderNumber: orderData.orderNumber,
          email: signatureData?.email,
          tradelineDetails: {
            bank: product.bank_name,
            cardId: product.card_id,
            limit: product.credit_limit,
            accountAge: `${product.account_age_years}y${product.account_age_months}m`,
            price: product.price
          }
        })
      });

      setCurrentStep('success');
      onSuccess?.(orderData);
    } catch (err) {
      setError('Failed to complete checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const total = product.price * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Stepper */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${currentStep === 'sign' || ['confirm', 'service-agreement', 'payment-info', 'success'].includes(currentStep) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`flex-1 h-0.5 ${['confirm', 'service-agreement', 'payment-info', 'success'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${currentStep === 'confirm' || ['service-agreement', 'payment-info', 'success'].includes(currentStep) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className={`flex-1 h-0.5 ${['service-agreement', 'payment-info', 'success'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${currentStep === 'service-agreement' || ['payment-info', 'success'].includes(currentStep) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <div className={`flex-1 h-0.5 ${['payment-info', 'success'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${currentStep === 'payment-info' || currentStep === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              4
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 px-1">
            <span>Sign</span>
            <span>Confirm</span>
            <span>Documents</span>
            <span>Payment</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* STEP 1: Sign Agreement */}
        {currentStep === 'sign' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Step 1: Review & Sign Agreement</DialogTitle>
              <DialogDescription>Please review and sign the broker agreement to proceed</DialogDescription>
            </DialogHeader>
            <AgreementSigning
              product={product}
              onSign={handleSignAgreement}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* STEP 2: Confirm Purchase */}
        {currentStep === 'confirm' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Step 2: Confirm Your Purchase</DialogTitle>
              <DialogDescription>Review the tradeline details and confirm your order</DialogDescription>
            </DialogHeader>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.bank_name}</CardTitle>
                    <CardDescription>Card ID: {product.card_id}</CardDescription>
                  </div>
                  <Badge variant="outline">{product.stock_count} in stock</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Credit Limit</p>
                    <p className="font-semibold">${product.credit_limit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Account Age</p>
                    <p className="font-semibold">{product.account_age_years}y {product.account_age_months}m</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Utilization</p>
                    <p className="font-semibold">{product.guarantees.utilization_percent}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Report Date</p>
                    <p className="font-semibold">{product.reporting_period_end}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">No late payments guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Low utilization guaranteed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price per unit:</span>
                  <span>${product.price.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have signed the broker agreement. Click below to confirm and proceed to the next step.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('sign')}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : 'Confirm & Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Service Agreement & Document Requirements */}
        {currentStep === 'service-agreement' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Step 3: Document Requirements</DialogTitle>
              <DialogDescription>Required documents for secure processing</DialogDescription>
            </DialogHeader>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Private Service Agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>This Private Service Agreement establishes the terms under which we will:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Securely collect and store your personal documents</li>
                  <li>Process your tradeline order with your provided information</li>
                  <li>Communicate updates and next steps via email and phone</li>
                  <li>Transfer your order to our broker for finalization</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Documents</CardTitle>
                <CardDescription>We'll securely collect these after confirming your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">AU Driver's License</p>
                    <p className="text-xs text-gray-600">Front & back photo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">AU SSN Card</p>
                    <p className="text-xs text-gray-600">Photo or scan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Billing Driver's License (Optional)</p>
                    <p className="text-xs text-gray-600">For payment verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                All documents are encrypted and stored securely. We never share your information without consent.
              </AlertDescription>
            </Alert>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span>Order confirmed: <strong>{orderData?.orderNumber}</strong></span>
                </div>
                <p className="text-xs text-green-700 mt-2">We'll contact you within 24 hours to collect documents and finalize payment.</p>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('confirm')}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleProceedToPayment}
                disabled={isLoading}
                className="flex-1"
              >
                Next: Payment Info
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Payment Information */}
        {currentStep === 'payment-info' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Step 4: Payment Setup</DialogTitle>
              <DialogDescription>How we'll process your payment</DialogDescription>
            </DialogHeader>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-5 h-5" />
                  Direct Bank Transfer (ACH/e-check)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-gray-700">We accept secure bank transfers to process payments:</p>
                <ul className="space-y-2 ml-2">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>ACH Transfer:</strong> Direct bank debit (2-3 business days)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>e-check:</strong> Electronic check processing (1-2 business days)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Wire Transfer:</strong> Same-day processing (if requested)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{product.bank_name} Tradeline</span>
                  <span>${(product.price * quantity).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base">
                  <span>Total Due:</span>
                  <span>${(product.price * quantity).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> After clicking complete, we'll send you secure payment instructions and contact you to collect the required documents. Payment will be processed once documents are verified.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('service-agreement')}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleCompleteCheckout}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Completing...' : 'Complete Order'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Success */}
        {currentStep === 'success' && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <DialogTitle>Order Confirmed!</DialogTitle>
              <DialogDescription className="mt-2">
                Your tradeline order has been successfully placed.
              </DialogDescription>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Order Number</p>
                  <p className="font-mono font-semibold text-lg">{orderData?.orderNumber}</p>
                </div>
                <div className="border-t border-green-200 pt-2">
                  <p className="text-xs text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg">${(product.price * quantity).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>What happens next:</strong>
                <ul className="text-xs mt-2 space-y-1">
                  <li>✓ Confirmation email sent to {signatureData?.email}</li>
                  <li>✓ We'll contact you within 24 hours</li>
                  <li>✓ Secure document collection link will be provided</li>
                  <li>✓ Payment instructions will be sent separately</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get client IP (best effort)
async function getClientIpAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || '0.0.0.0';
  } catch {
    return '0.0.0.0';
  }
}
