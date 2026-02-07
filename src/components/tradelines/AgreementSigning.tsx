import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface AgreementSigningProps {
  product: TradelineProduct;
  onSign: (signatureData: {
    fullName: string;
    email: string;
    phone: string;
    signatureImage: string;
    timestamp: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function AgreementSigning({
  product,
  onSign,
  isLoading
}: AgreementSigningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentTab, setCurrentTab] = useState('agreement');
  const [error, setError] = useState('');

  useEffect(() => {
    if (canvasRef.current && currentTab === 'signature') {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Sign here', 10, 25);
      }
    }
  }, [currentTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Sign here', 10, 25);
      }
    }
    setHasSignature(false);
  };

  const handleSignSubmit = async () => {
    setError('');

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!hasSignature) {
      setError('Please sign the agreement');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the terms');
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Signature capture failed');
      }

      const signatureImage = canvas.toDataURL('image/png');

      await onSign({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        signatureImage,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign agreement');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-600">Bank</p>
              <p className="font-semibold text-sm">{product.bank_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Card ID</p>
              <p className="font-semibold text-sm">{product.card_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Credit Limit</p>
              <p className="font-semibold text-sm">${product.credit_limit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Price</p>
              <p className="font-semibold text-green-600">${product.price.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agreement">Agreement</TabsTrigger>
          <TabsTrigger value="signature">Sign & Confirm</TabsTrigger>
        </TabsList>

        <TabsContent value="agreement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Broker User Agreement</CardTitle>
              <CardDescription>Please carefully read the agreement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm max-h-96 overflow-y-auto">
              <div className="space-y-3 text-gray-700">
                <div>
                  <h3 className="font-semibold text-base mb-2">1. SERVICES PROVIDED</h3>
                  <p>
                    We provide authorized user tradeline services to help establish and improve credit profiles. Our services include adding qualified authorized user accounts to your credit file with verification and documentation.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">2. COMPLIANCE & LEGALITY</h3>
                  <p>
                    All tradeline accounts are legally obtained and reported to consumer credit reporting agencies (Equifax, Experian, TransUnion) in compliance with the Fair Credit Reporting Act (FCRA). The accounts added to your profile will contain accurate information and reflect legitimate authorized user relationships.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">3. PAYMENT & PRICING</h3>
                  <p>
                    Payment for services is non-refundable once the tradeline account has been added to your credit profile and reported to bureaus. Pricing is based on account age, credit limit, and reporting timeline as listed.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">4. DOCUMENTATION & RECORD KEEPING</h3>
                  <p>
                    You authorize us to collect and maintain copies of your identification documents and personal information for verification, compliance, and dispute resolution purposes. All documentation is stored securely and encrypted.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">5. NO GUARANTEES</h3>
                  <p>
                    While we guarantee that tradelines will be reported to bureaus by the stated date, we cannot guarantee specific credit score improvements as this depends on your overall credit profile, payment history, and other factors determined by credit bureaus.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">6. DISPUTE RESOLUTION</h3>
                  <p>
                    If you believe there is an error with your tradeline, please contact us immediately with documentation. We will work with the account holder and bureaus to resolve inaccuracies. Disputes must be reported within 30 days of discovery.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">7. TERMINATION & REMOVAL</h3>
                  <p>
                    Tradelines may be removed from your credit profile upon request or if we determine the relationship is no longer appropriate. Removal typically occurs within 30-60 days and will stop reporting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signature</CardTitle>
              <CardDescription>Draw your signature in the box below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full border-2 border-gray-300 rounded cursor-crosshair bg-white"
                style={{ minHeight: '150px', touchAction: 'none' }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={!hasSignature || isLoading}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Signature
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked === true)
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal cursor-pointer"
              >
                I agree to the Broker User Agreement and understand the terms, privacy policy, and that this is a legally binding commitment
              </Label>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSignSubmit}
            disabled={isLoading || !hasSignature || !agreedToTerms}
            className="w-full"
          >
            {isLoading ? 'Signing...' : 'Sign & Continue'}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
