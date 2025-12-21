import { creditBuilders as baseCreditBuilders, CreditBuilder } from "@/types/CreditBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCredits } from "@/hooks/useCredits";
import { useState } from "react";
import { Building, Shield, TrendingUp, DollarSign, CreditCard, Verified, Star, Award, Zap, Target, BookOpen, Users, Calendar, CheckCircle, X, Mail, Phone, MessageSquare } from 'lucide-react';
import ElevenLabsChatbot from "@/components/ElevenLabsChatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "react-router-dom";

interface TradelineProduct {
  id: string;
  name: string;
  bank: string;
  limit: string;
  price: number;
  originalPrice: number;
  benefits: string[];
  accountAge: string;
  gradient: string;
  logo: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

interface QuestionnaireData {
  name: string;
  email: string;
  phone: string;
  creditScore: string;
  goals: string;
  timeline: string;
  experience: string;
  budget: string;
  additionalInfo: string;
}

export default function CreditBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { refreshCredits } = useCredits();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireStep, setQuestionnaireStep] = useState(1);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    name: '',
    email: '',
    phone: '',
    creditScore: '',
    goals: '',
    timeline: '',
    experience: '',
    budget: '',
    additionalInfo: ''
  });

  // Tradeline products data
  const tradelineProducts: TradelineProduct[] = [
    {
      id: 'cp1-5000',
      name: 'CP1 Tradeline',
      bank: 'Capital One',
      limit: '$5,000',
      price: 427,
      originalPrice: 327,
      benefits: ['Low-cost entry', 'Solid account age', 'Lower utilization', 'Positive history'],
      accountAge: 'June 2021',
      gradient: 'from-blue-500 to-blue-600',
      logo: '🏦'
    },
    {
      id: 'chase-5900',
      name: 'Chase Tradeline',
      bank: 'Chase',
      limit: '$5,900',
      price: 427,
      originalPrice: 327,
      benefits: ['Major bank credibility', 'Higher limit', 'Bank card mix', 'Auto approvals'],
      accountAge: '2020',
      gradient: 'from-red-500 to-red-600',
      logo: '🏦'
    },
    {
      id: 'discover-3000',
      name: 'Discover Tradeline',
      bank: 'Discover',
      limit: '$3,000',
      price: 451,
      originalPrice: 351,
      benefits: ['Older account', 'Rebuilding credit', 'Length of history', 'Recover from issues'],
      accountAge: '2020',
      gradient: 'from-orange-500 to-orange-600',
      logo: '🏦'
    },
    {
      id: 'chase-6500',
      name: 'Chase Tradeline',
      bank: 'Chase',
      limit: '$6,500',
      price: 480,
      originalPrice: 380,
      benefits: ['Age & limit balance', 'Mid-tier option', 'Faster score jump', 'Loan approvals'],
      accountAge: '2019',
      gradient: 'from-red-600 to-red-700',
      logo: '🏦'
    },
    {
      id: 'discover-10000',
      name: 'Discover Tradeline',
      bank: 'Discover',
      limit: '$10,000',
      price: 480,
      originalPrice: 380,
      benefits: ['High limit', 'Strong impact', 'Utilization reduction', 'Score stability'],
      accountAge: '2018',
      gradient: 'from-orange-600 to-orange-700',
      logo: '🏦'
    },
    {
      id: 'barclays-10000',
      name: 'Barclays Tradeline',
      bank: 'Barclays',
      limit: '$10,000',
      price: 509,
      originalPrice: 409,
      benefits: ['International presence', 'Lender diversity', 'Creditworthiness', 'Business funding'],
      accountAge: '2017',
      gradient: 'from-purple-500 to-purple-600',
      logo: '🏦'
    },
    {
      id: 'cp1-15000',
      name: 'CP1 Tradeline',
      bank: 'Capital One',
      limit: '$15,000',
      price: 509,
      originalPrice: 409,
      benefits: ['High limit & age', 'Strong impact', 'Big utilization drop', '700+ scores'],
      accountAge: '2016',
      gradient: 'from-blue-600 to-blue-700',
      logo: '🏦'
    },
    {
      id: 'chase-20000',
      name: 'Chase Tradeline',
      bank: 'Chase',
      limit: '$20,000+',
      price: 597,
      originalPrice: 497,
      benefits: ['Top-tier tradeline', 'Maximum relief', 'Lender confidence', 'Business credit'],
      accountAge: '2015',
      gradient: 'from-red-700 to-red-800',
      logo: '🏦'
    }
  ];

  // Blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'How Tradelines Work: A Complete Guide to Credit Building',
      excerpt: 'Understanding how authorized user tradelines can transform your credit score and financial future.',
      date: 'Dec 21, 2024',
      readTime: '5 min read',
      category: 'Credit Education',
      image: '📚'
    },
    {
      id: '2',
      title: 'Credit Score Myths Debunked: What Really Matters',
      excerpt: 'Separating fact from fiction in the world of credit scoring and financial health.',
      date: 'Dec 18, 2024',
      readTime: '4 min read',
      category: 'Credit Tips',
      image: '💡'
    },
    {
      id: '3',
      title: 'Building Credit from Zero: A Step-by-Step Approach',
      excerpt: 'Practical strategies for establishing and improving your credit profile from scratch.',
      date: 'Dec 15, 2024',
      readTime: '6 min read',
      category: 'Beginners Guide',
      image: '🚀'
    }
  ];

  // Filter out tradelines from credit builders
  const creditBuilders: CreditBuilder[] = baseCreditBuilders
    .filter(b => b.id !== 'tradelines')
    .map((b) => {
      let icon = null;
      switch (b.id) {
        case 'chime': icon = <Building className="w-6 h-6" />; break;
        case 'self': icon = <Shield className="w-6 h-6" />; break;
        case 'kickoff': icon = <TrendingUp className="w-6 h-6" />; break;
        case 'brigit': icon = <DollarSign className="w-6 h-6" />; break;
        case 'growcredit': icon = <TrendingUp className="w-6 h-6" />; break;
        case 'creditstrong': icon = <Shield className="w-6 h-6" />; break;
        case 'rentreporter': icon = <Building className="w-6 h-6" />; break;
        case 'atlas': icon = <CreditCard className="w-6 h-6" />; break;
        default: icon = null;
      }
      return { ...b, icon };
    });

  const handleClick = async (builder: CreditBuilder) => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to earn credits." });
      return;
    }
    try {
      await fetch("/api/credit-builder-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ builderId: builder.id, userId: user.id, points: builder.points }),
      });
      
      // Refresh credits to show the update immediately
      await refreshCredits();
      
      window.open(builder.link, "_blank");
      toast({ title: "Credits Awarded!", description: `You earned ${builder.points} credits.` });
    } catch (e) {
      toast({ title: "Error", description: "Could not track or award credits." });
    }
  };

  const handleTradelineInterest = (product: TradelineProduct) => {
    setShowQuestionnaire(true);
    setQuestionnaireStep(1);
  };

  const handleQuestionnaireSubmit = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log the data for demo purposes (in real app, this would go to backend)
      console.log('Questionnaire submitted:', questionnaireData);

      toast({
        title: "Questionnaire Submitted!",
        description: "We'll contact you within 24 hours to discuss your options."
      });

      setShowQuestionnaire(false);
      setQuestionnaireStep(1);
      setQuestionnaireData({
        name: '', email: '', phone: '', creditScore: '', goals: '',
        timeline: '', experience: '', budget: '', additionalInfo: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit questionnaire. Please try again."
      });
    }
  };

  const nextStep = () => {
    if (questionnaireStep < 3) {
      setQuestionnaireStep(questionnaireStep + 1);
    } else {
      handleQuestionnaireSubmit();
    }
  };

  const prevStep = () => {
    if (questionnaireStep > 1) {
      setQuestionnaireStep(questionnaireStep - 1);
    }
  };

  const totalPossibleCredits = creditBuilders.reduce((sum, builder) => sum + builder.points, 0);
  const averageCredits = Math.round(totalPossibleCredits / creditBuilders.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Credit Building Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
            Build Your Credit Score
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover premium credit building opportunities and professional tradeline services. Earn credits while improving your financial future with our curated selection of top-rated services.
          </p>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-0">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-90" />
                <div className="text-2xl font-bold mb-1">{creditBuilders.length}</div>
                <div className="text-sm opacity-90">Free Offers</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 mx-auto mb-3 opacity-90" />
                <div className="text-2xl font-bold mb-1">{totalPossibleCredits}</div>
                <div className="text-sm opacity-90">Free Credits</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-90" />
                <div className="text-2xl font-bold mb-1">{tradelineProducts.length}</div>
                <div className="text-sm opacity-90">Tradeline Options</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-90" />
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-sm opacity-90">Happy Clients</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Blog Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Credit Education
            </div>
            <h2 className="text-3xl font-bold mb-4">Latest Credit Building Insights</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
              Stay informed with expert tips, strategies, and the latest trends in credit building and financial wellness.
            </p>
            <Link to="/blog">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20">
                View All Articles →
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg h-full">
              <CardHeader className="pb-3">
                <div className="text-4xl mb-3">{post.image}</div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  <span className="text-xs text-slate-500">{post.readTime}</span>
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{post.date}</span>
                    <Link to={`/blog/${post.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                        Read More →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Free Credit Builder Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Free Credit Building
            </div>
            <h2 className="text-3xl font-bold mb-4">Start Building Credit for Free</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              These free offers help you build credit while earning rewards. No upfront costs, just smart credit building.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creditBuilders.map((builder, index) => (
              <HoverCard key={builder.id}>
                <HoverCardTrigger asChild>
                  <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br ${builder.gradient} text-white hover:scale-[1.02] ${isMobile ? 'hover:scale-100' : ''} h-full flex flex-col`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <CardHeader className="relative z-10 pb-2 flex-shrink-0">
                      <div className="flex items-center justify-between mb-3 min-h-[2.5rem]">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                            {builder.icon}
                          </div>
                          <CardTitle className="text-lg font-bold truncate">{builder.title}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-shrink-0 ml-2">
                          +{builder.points}
                        </Badge>
                      </div>

                      {/* Fixed height bonus section */}
                      <div className="min-h-[1.5rem] flex items-center">
                        {builder.bonus ? (
                          <Badge variant="outline" className="w-fit bg-yellow-400/20 text-yellow-100 border-yellow-400/30 text-xs">
                            🎁 {builder.bonus}
                          </Badge>
                        ) : (
                          <div className="invisible">
                            <Badge variant="outline" className="text-xs">Placeholder</Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    {/* Flexible content section */}
                    <CardContent className="relative z-10 pt-0 flex-1 flex flex-col">
                      <CardDescription className="text-white/90 mb-4 leading-relaxed text-sm overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical' as const,
                        lineHeight: '1.4'
                      }}>
                        {builder.description}
                      </CardDescription>

                      {/* Fixed height progress section */}
                      <div className="space-y-2 flex-shrink-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/80">Credit Impact</span>
                          <span className="font-medium">{Math.min(builder.points * 2, 100)}%</span>
                        </div>
                        <Progress
                          value={Math.min(builder.points * 2, 100)}
                          className="h-2 bg-white/20"
                        />
                      </div>

                      {/* Fixed height button section */}
                      <div className="mt-4 flex-shrink-0">
                        <Button
                          className="w-full bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-10"
                          onClick={() => handleClick(builder)}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Visit & Earn Credits
                        </Button>
                      </div>
                    </CardContent>

                    {/* Animated background effect */}
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  </Card>
                </HoverCardTrigger>

                <HoverCardContent className="w-80 p-4" side={isMobile ? "top" : "right"}>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-base">{builder.title} Details</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {builder.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>Earn {builder.points} credits</span>
                    </div>
                    {builder.bonus && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-green-500" />
                        <span>{builder.bonus} bonus available</span>
                      </div>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>

        {/* Tradeline Products Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Premium Tradelines
            </div>
            <h2 className="text-3xl font-bold mb-4">Accelerate Your Credit Growth</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
              Professional tradeline services to dramatically improve your credit score. Authorized user accounts from major banks with proven results.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg max-w-3xl mx-auto">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">How Tradelines Work:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Add positive payment history to your credit report</li>
                <li>• Increase total available credit (lower utilization)</li>
                <li>• Strengthen account age and credit mix</li>
                <li>• Improve FICO and VantageScore calculations</li>
              </ul>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tradelineProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${product.gradient}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{product.logo}</div>
                    <Badge variant="outline" className="text-xs">
                      {product.limit}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                    {product.bank} • {product.accountAge}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-green-600">${product.price}</span>
                      <span className="text-sm text-slate-500 line-through">${product.originalPrice + 100}</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Save ${(product.originalPrice + 100) - product.price}</div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full bg-gradient-to-r ${product.gradient} hover:opacity-90 text-white font-semibold h-10`}
                    onClick={() => handleTradelineInterest(product)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                Start Your Credit Journey
              </div>
              <h3 className="text-2xl font-bold mb-6">Ready to Transform Your Credit?</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Whether you choose free credit building or premium tradeline services, we're here to help you achieve your financial goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-12">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Explore Free Options
                </Button>
                <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 h-12">
                  <Phone className="w-5 h-5 mr-2" />
                  Schedule Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Questionnaire Modal */}
      <Dialog open={showQuestionnaire} onOpenChange={setShowQuestionnaire}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Credit Building Questionnaire</DialogTitle>
            <DialogDescription>
              Help us understand your credit goals so we can recommend the best tradeline solution for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {questionnaireStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 1: Basic Information</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={questionnaireData.name}
                      onChange={(e) => setQuestionnaireData({...questionnaireData, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={questionnaireData.email}
                      onChange={(e) => setQuestionnaireData({...questionnaireData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={questionnaireData.phone}
                      onChange={(e) => setQuestionnaireData({...questionnaireData, phone: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>
            )}

            {questionnaireStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 2: Credit Profile</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Current Credit Score Range</Label>
                    <RadioGroup
                      value={questionnaireData.creditScore}
                      onValueChange={(value) => setQuestionnaireData({...questionnaireData, creditScore: value})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="under-500" id="under-500" />
                        <Label htmlFor="under-500">Under 500</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="500-600" id="500-600" />
                        <Label htmlFor="500-600">500-600</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="600-700" id="600-700" />
                        <Label htmlFor="600-700">600-700</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="over-700" id="over-700" />
                        <Label htmlFor="over-700">Over 700</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="goals">Credit Goals *</Label>
                    <Textarea
                      id="goals"
                      value={questionnaireData.goals}
                      onChange={(e) => setQuestionnaireData({...questionnaireData, goals: e.target.value})}
                      placeholder="What are your credit goals? (e.g., buy a home, get better loan rates, etc.)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Timeline</Label>
                    <RadioGroup
                      value={questionnaireData.timeline}
                      onValueChange={(value) => setQuestionnaireData({...questionnaireData, timeline: value})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="asap" id="asap" />
                        <Label htmlFor="asap">As soon as possible</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3-months" id="3-months" />
                        <Label htmlFor="3-months">Within 3 months</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6-months" id="6-months" />
                        <Label htmlFor="6-months">Within 6 months</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="flexible" id="flexible" />
                        <Label htmlFor="flexible">Flexible timeline</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {questionnaireStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 3: Experience & Budget</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Previous Credit Building Experience</Label>
                    <RadioGroup
                      value={questionnaireData.experience}
                      onValueChange={(value) => setQuestionnaireData({...questionnaireData, experience: value})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none">No experience</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="some" id="some" />
                        <Label htmlFor="some">Some experience</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="experienced" id="experienced" />
                        <Label htmlFor="experienced">Very experienced</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Budget Range</Label>
                    <RadioGroup
                      value={questionnaireData.budget}
                      onValueChange={(value) => setQuestionnaireData({...questionnaireData, budget: value})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="under-500" id="budget-under-500" />
                        <Label htmlFor="budget-under-500">Under $500</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="500-1000" id="500-1000" />
                        <Label htmlFor="500-1000">$500 - $1,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="over-1000" id="over-1000" />
                        <Label htmlFor="over-1000">Over $1,000</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      value={questionnaireData.additionalInfo}
                      onChange={(e) => setQuestionnaireData({...questionnaireData, additionalInfo: e.target.value})}
                      placeholder="Any additional information or specific questions?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={questionnaireStep === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                Step {questionnaireStep} of 3
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${
                      step <= questionnaireStep ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button onClick={nextStep}>
              {questionnaireStep === 3 ? 'Submit & Book Call' : 'Next'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ElevenLabsChatbot />
    </div>
  );
}