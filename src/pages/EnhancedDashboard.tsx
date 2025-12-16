import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Calendar as CalendarIcon, FileText, Package, 
  Clock, RefreshCw, Menu, Plus, Building2, Phone, MapPin, Mail as MailIcon, BookOpen, Scale, TrendingUp, Gavel, ExternalLink, Bell, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CertifiedMailTimeline, CertifiedMailEvent } from "@/components/ui/certified-mail-timeline";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";
import { disputesApi, certifiedMailApi, complaintsApi, calendarEventsApi, Dispute, CertifiedMail, Complaint, CalendarEvent } from "@/lib/dashboard-api";

import ChatList from "../components/ChatList";
import TemplateSidebar from "../components/TemplateSidebar";
import ElevenLabsChatbot from "../components/ElevenLabsChatbot";
import { useChatContext } from "../contexts/ChatContext";
import { useToast } from "@/hooks/use-toast";
import * as templateStorage from '@/lib/templateStorage';

// Credit Bureaus Contact Info
const creditBureaus = [
  { name: "Equifax", phone: "1-800-685-1111", address: "P.O. Box 740241, Atlanta, GA 30374", website: "equifax.com" },
  { name: "Experian", phone: "1-888-397-3742", address: "P.O. Box 4500, Allen, TX 75013", website: "experian.com" },
  { name: "TransUnion", phone: "1-800-916-8800", address: "P.O. Box 2000, Chester, PA 19016", website: "transunion.com" }
];

// Secondary Bureaus
const secondaryBureaus = [
  { name: "Innovis", phone: "1-800-540-2505", website: "innovis.com" },
  { name: "ChexSystems", phone: "1-800-428-9623", website: "chexsystems.com" },
  { name: "LexisNexis", phone: "1-866-897-8126", website: "lexisnexis.com" }
];

// Simple Calendar Component
const SimpleCalendar = ({ selectedDate, onSelectDate, onDateClick }: { selectedDate?: Date; onSelectDate?: (date: Date) => void; onDateClick?: (date: Date) => void }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-1 hover:bg-gray-100 rounded">&lt;</button>
        <div className="font-medium">{monthNames[month]} {year}</div>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-1 hover:bg-gray-100 rounded">&gt;</button>
      </div>
      <table className="w-full" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {dayNames.map(d => <th key={d} className="text-center text-sm font-medium text-gray-500 pb-2">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIdx) => (
            <tr key={weekIdx}>
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const day = days[weekIdx * 7 + dayIdx];
                const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                const isSelected = day && selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                return (
                  <td key={dayIdx} className="text-center p-1">
                    {day ? (
                      <button
                        onClick={() => {
                          const clickedDate = new Date(year, month, day);
                          onSelectDate?.(clickedDate);
                          onDateClick?.(clickedDate);
                        }}
                        className={`w-9 h-9 rounded-md hover:bg-gray-100 ${
                          isToday ? 'bg-blue-100 text-blue-600 font-semibold' : ''
                        } ${
                          isSelected ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        {day}
                      </button>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Sample certified mail data
const sampleMailEvents: CertifiedMailEvent[] = [
  {
    id: "1",
    type: "mailed",
    description: "Credit dispute letter sent to Experian",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    isCompleted: true,
    isCurrent: false
  },
  {
    id: "2",
    type: "delivered",
    description: "Letter delivered (legal presumption)",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    isCompleted: true,
    isCurrent: false
  },
  {
    id: "3",
    type: "deadline",
    description: "FCRA 30-day response deadline",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    isCompleted: false,
    isCurrent: true
  }
];

export default function EnhancedDashboard() {
  // Auth and navigation
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    dailyLimit: 5,
    chatsUsed: 0,
    remaining: 5,
    credits: 0,
    isPro: false
  });
  // Removed connectionStatus state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [certifiedMail, setCertifiedMail] = useState<CertifiedMail[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'deadline' as 'deadline' | 'mailed' | 'delivered' | 'reminder' | 'response',
    related_type: '',
    related_id: ''
  });

  // Refresh metrics and load data when user changes
  useEffect(() => {
    if (user?.id) {
      refetchMetrics();
      loadDashboardData();
    }
  }, [user?.id]);

  // Load all dashboard data
  const loadDashboardData = async () => {
    if (!user?.id) return;
    try {
      const [disputesData, mailData, complaintsData, eventsData] = await Promise.all([
        disputesApi.getAll(user.id),
        certifiedMailApi.getAll(user.id),
        complaintsApi.getAll(user.id),
        calendarEventsApi.getAll(user.id)
      ]);
      setDisputes(disputesData);
      setCertifiedMail(mailData);
      setComplaints(complaintsData);
      setCalendarEvents(eventsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // Saved templates (client-side store via localStorage)
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  useEffect(() => {
    if (!user?.id) {
      setSavedTemplates([]);
      return;
    }

    // Try to load from server first, fallback to localStorage
    (async () => {
      try {
        const resp = await api.getSavedTemplates(user.id);
        if (resp && resp.data && Array.isArray(resp.data)) {
          setSavedTemplates(resp.data.map((t: any) => ({
            id: t.template_id,
            name: t.name,
            type: t.type,
            fullContent: t.full_content,
            creditCost: t.credit_cost,
            description: t.metadata?.description || '' ,
            legalArea: t.metadata?.legalArea || ''
          })));
          return;
        }
      } catch (err) {
        console.warn('Failed to load saved templates from server, falling back to localStorage:', err);
      }

      try {
        const loaded = templateStorage.getSavedTemplates(user.id);
        setSavedTemplates(loaded || []);
      } catch (e) {
        console.warn('Failed to load saved templates:', e);
        setSavedTemplates([]);
      }
    })();

  }, [user?.id, metrics]);

  // Add new dispute
  const handleAddDispute = async () => {
    if (!user?.id) return;
    try {
      const newDispute = await disputesApi.create({
        user_id: user.id,
        title: "New Dispute",
        bureau: "Equifax",
        status: "pending",
        date_sent: new Date().toISOString()
      });
      setDisputes([newDispute, ...disputes]);
      toast({ title: 'Success', description: 'New dispute created' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create dispute', variant: 'destructive' });
    }
  };

  // Add certified mail
  const handleAddMail = async (trackingNumber: string, recipient: string, dateMailed: string) => {
    if (!user?.id) return;
    try {
      const newMail = await certifiedMailApi.create({
        user_id: user.id,
        tracking_number: trackingNumber,
        recipient,
        date_mailed: dateMailed,
        status: 'mailed'
      });
      setCertifiedMail([newMail, ...certifiedMail]);
      toast({ title: 'Success', description: 'Mail tracking added' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add tracking', variant: 'destructive' });
    }
  };

  // Add complaint
  const handleAddComplaint = async (agency: string, complaintNumber: string, dateFiled: string) => {
    if (!user?.id) return;
    try {
      const newComplaint = await complaintsApi.create({
        user_id: user.id,
        agency,
        complaint_number: complaintNumber,
        date_filed: dateFiled,
        status: 'filed',
        response_received: false
      });
      setComplaints([newComplaint, ...complaints]);
      toast({ title: 'Success', description: 'Complaint added' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add complaint', variant: 'destructive' });
    }
  };

  // Handle calendar date click
  const handleCalendarDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  // Save calendar event
  const handleSaveEvent = async () => {
    if (!user?.id || !selectedDate || !newEvent.title) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }
    try {
      const event = await calendarEventsApi.create({
        user_id: user.id,
        title: newEvent.title,
        description: newEvent.description,
        event_date: selectedDate.toISOString(),
        event_type: newEvent.event_type,
        related_id: newEvent.related_id || undefined,
        related_type: newEvent.related_type || undefined,
        is_completed: false
      });
      setCalendarEvents([event, ...calendarEvents]);
      setShowEventModal(false);
      setNewEvent({ title: '', description: '', event_type: 'deadline', related_type: '', related_id: '' });
      toast({ title: 'Success', description: 'Event added to calendar' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add event', variant: 'destructive' });
    }
  };



  // Sidebar
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleTemplateSelect = (template: any) => {
    navigate('/chat', { 
      state: { 
        template: template,
        templateContent: template.fullContent,
        templateType: template.type
      } 
    });
  };
  // Fetch user stats and credits from Supabase
  const refetchMetrics = async () => {
    try {
      if (!user) return;

      // In dev mode with bypass auth, use mock data
      if (import.meta.env.DEV && user.id === 'dev-user') {
        setMetrics((prev) => ({
          ...prev,
          dailyLimit: 5,
          chatsUsed: 0,
          remaining: Math.min(5, prev.credits),
          credits: 100,
          isPro: true
        }));
        return;
      }

      // Fetch from Supabase directly
      const [creditsData, profileData, metricsData] = await Promise.all([
        supabase.from('user_credits').select('credits').eq('user_id', user.id).single(),
        supabase.from('profiles').select('is_pro').eq('id', user.id).single(),
        supabase.from('user_metrics').select('chats_used, daily_limit').eq('user_id', user.id).single()
      ]);

      setMetrics((prev) => ({
        ...prev,
        dailyLimit: metricsData.data?.daily_limit ?? 5,
        chatsUsed: metricsData.data?.chats_used ?? prev.chatsUsed,
        remaining: Math.min(
          (metricsData.data?.daily_limit ?? 5) - (metricsData.data?.chats_used ?? 0),
          creditsData.data?.credits ?? 0
        ),
        credits: creditsData.data?.credits ?? prev.credits,
        isPro: profileData.data?.is_pro ?? prev.isPro
      }));
    } catch (err) {
      console.error('Error fetching metrics:', err);
      // In case of error, set some default values
      setMetrics((prev) => ({
        ...prev,
        dailyLimit: 5,
        chatsUsed: 0,
        remaining: Math.min(5, prev.credits),
        credits: 0,
        isPro: false
      }));
    }
  };

  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    loadChatById,
    agentState,
  } = useChatContext();

  // Removed testChatConnection function

  // Loading and error states
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-4 text-center text-red-600">
          {error}
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Sidebar */}
      <TemplateSidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onTemplateSelect={handleTemplateSelect}
        userCredits={metrics.remaining}
        onCreditUpdate={refetchMetrics}
      />

      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-96' : ''}`}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSidebarToggle}
                  className="flex items-center gap-2"
                >
                  <Menu className="w-4 h-4" />
                  <FileText className="w-4 h-4" />
                  {isSidebarOpen ? 'Close Templates' : 'Templates'}
                </Button>
                <h1 className="text-3xl font-bold">Dashboard</h1>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/chat')}>New Chat</Button>
                <Button variant="outline" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await signOut(); navigate('/', { replace: true }); }}>Logout</Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Questions Remaining:</span>
                      <span className="font-medium">{metrics.remaining}/{metrics.dailyLimit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Questions Asked:</span>
                      <span className="font-medium">{metrics.chatsUsed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paid Credits:</span>
                      <span className="font-medium">{metrics.credits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pro Status:</span>
                      <span className="font-medium">{metrics.isPro ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full mb-2"
                        onClick={() => { setIsUpgradeLoading(true); window.location.href = 'https://buy.stripe.com/9AQeYP2cUcq0eA0bIU'; setIsUpgradeLoading(false); }}
                        disabled={isUpgradeLoading}
                      >
                        {isUpgradeLoading ? 'Processing...' : 'Get 50 More Credits ($9.99)'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Chats:</span>
                      <span className="font-medium">{messages.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Joined:</span>
                      <span className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="calendar" className="mb-8">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="disputes">Disputes</TabsTrigger>
                <TabsTrigger value="tracking">Mail Tracking</TabsTrigger>
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="shop">Shop</TabsTrigger>
              </TabsList>

              {/* Calendar Tab */}
              <TabsContent value="calendar" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dispute Calendar & Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <SimpleCalendar
                          selectedDate={selectedDate}
                          onSelectDate={setSelectedDate}
                          onDateClick={handleCalendarDateClick}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
                        <div className="space-y-3">
                          {calendarEvents.length === 0 ? (
                            <p className="text-gray-500 text-sm">No upcoming deadlines</p>
                          ) : (
                            calendarEvents.slice(0, 5).map(event => (
                              <div key={event.id} className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-sm">{event.title}</span>
                                </div>
                                <p className="text-xs text-gray-500">{new Date(event.event_date).toLocaleDateString()}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Disputes Tab */}
              <TabsContent value="disputes" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Dispute Letters & Templates</CardTitle>
                    <Button size="sm" onClick={handleAddDispute}>
                      <Plus className="w-4 h-4 mr-2" /> New Dispute
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {disputes.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No disputes yet. Click "New Dispute" to start.</p>
                      ) : (
                        disputes.map(dispute => (
                          <div key={dispute.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{dispute.title}</h4>
                                <p className="text-sm text-gray-600">Bureau: {dispute.bureau}</p>
                                <p className="text-xs text-gray-500">Sent: {dispute.date_sent ? new Date(dispute.date_sent).toLocaleDateString() : 'Not sent'}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded dispute-status-${dispute.status}`}>{dispute.status}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => {
                                  toast({ title: 'Reminder Set', description: 'You\'ll receive a free email reminder for this dispute' });
                                }}
                              >
                                <Bell className="w-3 h-3 mr-1" />
                                Set Reminder (Free)
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                onClick={() => {
                                  if (metrics.credits < 3) {
                                    toast({ title: 'Insufficient Credits', description: 'You need 3 credits for AI-generated follow-up', variant: 'destructive' });
                                    return;
                                  }
                                  toast({ title: 'Generating...', description: 'AI is creating your personalized follow-up letter (3 credits)' });
                                }}
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Follow-Up (3 credits)
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mail Tracking Tab */}
              <TabsContent value="tracking" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Certified Mail Tracking</CardTitle>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Add Tracking Number
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label>Tracking Number</Label>
                          <Input placeholder="Enter USPS tracking number" />
                        </div>
                        <div>
                          <Label>Date Mailed</Label>
                          <Input type="date" />
                        </div>
                        <div>
                          <Label>Recipient</Label>
                          <Input placeholder="e.g., Equifax" />
                        </div>
                      </div>
                      <CertifiedMailTimeline
                        events={sampleMailEvents}
                        mailDescription="Credit Dispute Letter"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Complaints Tab */}
              <TabsContent value="complaints" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Complaint Tracking</CardTitle>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" /> New Complaint
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-500 text-center py-8">Track complaints filed with CFPB, FTC, and state agencies.</p>
                      <div className="grid gap-4">
                        <div>
                          <Label>Agency</Label>
                          <Input placeholder="e.g., CFPB, FTC, State AG" />
                        </div>
                        <div>
                          <Label>Complaint Number</Label>
                          <Input placeholder="Reference number" />
                        </div>
                        <div>
                          <Label>Date Filed</Label>
                          <Input type="date" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Shop Tab */}
              <TabsContent value="shop" className="mt-6">
                <div className="space-y-6">
                  {/* View All Resources Banner */}
                  <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">Browse All Resources</h2>
                          <p className="text-blue-100">Explore our complete collection of templates, guides, and legal resources</p>
                        </div>
                        <Button 
                          size="lg"
                          className="bg-white text-blue-600 hover:bg-blue-50 font-bold whitespace-nowrap"
                          onClick={() => window.open('https://buymeacoffee.com/coinvest/extras', '_blank')}
                        >
                          View All Resources <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Featured Resources & Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Free Resource */}
                        <div className="flex flex-col h-full p-5 border-2 border-green-200 rounded-lg bg-green-50">
                          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-green-600 rounded-full">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">FREE</span>
                          </div>
                          <h3 className="font-bold text-base mb-2 min-h-[3rem] flex items-center">Secondary Credit Bureaus List</h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow min-h-[4.5rem]">
                            Complete contact info for all secondary credit reporting agencies. Essential for monitoring.
                          </p>
                          <Button 
                            className="w-full mt-auto"
                            onClick={() => window.open('https://buymeacoffee.com/coinvest/e/440819', '_blank')}
                          >
                            Get Free List
                          </Button>
                        </div>

                        {/* Debt Validation Letter */}
                        <div className="flex flex-col h-full p-5 border-2 border-blue-200 rounded-lg bg-blue-50">
                          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-blue-600 rounded-full">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">$5.00</span>
                          </div>
                          <h3 className="font-bold text-base mb-2 min-h-[3rem] flex items-center">Debt Validation Letter</h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow min-h-[4.5rem]">
                            Professional template in DOC & PDF. Ready to customize and send. FDCPA compliant.
                          </p>
                          <Button 
                            className="w-full mt-auto"
                            onClick={() => window.open('https://buymeacoffee.com/coinvest/e/382307', '_blank')}
                          >
                            Download Template
                          </Button>
                        </div>

                        {/* How to Sue Debt Collectors */}
                        <div className="flex flex-col h-full p-5 border-2 border-purple-200 rounded-lg bg-purple-50">
                          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-purple-600 rounded-full">
                            <Scale className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">$125</span>
                          </div>
                          <h3 className="font-bold text-base mb-2 min-h-[3rem] flex items-center">How to Sue Debt Collectors</h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow min-h-[4.5rem]">
                            Complete eBook with legal drafts and laws. Step-by-step guide to taking action.
                          </p>
                          <Button 
                            className="w-full mt-auto"
                            onClick={() => window.open('https://buymeacoffee.com/coinvest/e/383675', '_blank')}
                          >
                            Get eBook
                          </Button>
                        </div>

                        {/* Prove Credit Violation */}
                        <div className="flex flex-col h-full p-5 border-2 border-orange-200 rounded-lg bg-orange-50">
                          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-orange-600 rounded-full">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded">PAID</span>
                          </div>
                          <h3 className="font-bold text-base mb-2 min-h-[3rem] flex items-center">Prove Credit/Debt Violation</h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow min-h-[4.5rem]">
                            Automatic win strategy for $1000. Learn how to prove violations and win your case.
                          </p>
                          <Button 
                            className="w-full mt-auto"
                            onClick={() => window.open('https://buymeacoffee.com/coinvest/e/432485', '_blank')}
                          >
                            Learn More
                          </Button>
                        </div>

                        {/* Credit Repair Planner */}
                        <div className="flex flex-col h-full p-5 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-indigo-600 rounded-full">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded">PAID</span>
                          </div>
                          <h3 className="font-bold text-base mb-2 min-h-[3rem] flex items-center">Ultimate Credit Repair Planner</h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow min-h-[4.5rem]">
                            Get your score to 700+. PDF/Digital downloadable planner with proven strategies.
                          </p>
                          <Button 
                            className="w-full mt-auto"
                            onClick={() => window.open('https://buymeacoffee.com/coinvest/e/469931', '_blank')}
                          >
                            Get Planner
                          </Button>
                        </div>

                        {/* FDCPA Lawsuit Drafts */}
                        <div className="flex flex-col h-full p-5 border-2 border-red-200 rounded-lg bg-red-50">
                          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-red-600 rounded-full">
                            <Gavel className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">$50</span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">49 Left</span>
                          </div>
                          <h3 className="font-bold text-base mb-2 min-h-[3rem] flex items-center">FDCPA Lawsuit Drafts + Consultation</h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow min-h-[4.5rem]">
                            Ready-to-file lawsuit drafts, intent to sue letter, and FREE expert consultation. Stop harassment!
                          </p>
                          <Button 
                            className="w-full mt-auto bg-red-600 hover:bg-red-700"
                            onClick={() => window.open('https://buymeacoffee.com/coinvest/e/383669', '_blank')}
                          >
                            Get Lawsuit Kit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => {
                          const element = document.querySelector('[value="contacts"]');
                          if (element) (element as HTMLElement).click();
                        }}>
                          <Building2 className="w-6 h-6" />
                          <span className="font-semibold text-sm">All Bureaus</span>
                          <span className="text-xs text-gray-500">Contact info</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => {
                          const element = document.querySelector('[value="disputes"]');
                          if (element) (element as HTMLElement).click();
                        }}>
                          <FileText className="w-6 h-6" />
                          <span className="font-semibold text-sm">My Disputes</span>
                          <span className="text-xs text-gray-500">Track disputes</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => {
                          const element = document.querySelector('[value="tracking"]');
                          if (element) (element as HTMLElement).click();
                        }}>
                          <Package className="w-6 h-6" />
                          <span className="font-semibold text-sm">Mail Tracking</span>
                          <span className="text-xs text-gray-500">USPS certified</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/chat')}>
                          <Plus className="w-6 h-6" />
                          <span className="font-semibold text-sm">New Chat</span>
                          <span className="text-xs text-gray-500">Ask AI</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Credit Bureaus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        {creditBureaus.map(bureau => (
                          <div key={bureau.name} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-3">{bureau.name}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 mt-0.5 text-gray-500" />
                                <span>{bureau.phone}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                                <span className="text-xs">{bureau.address}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Building2 className="w-4 h-4 mt-0.5 text-gray-500" />
                                <span>{bureau.website}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Secondary Bureaus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        {secondaryBureaus.map(bureau => (
                          <div key={bureau.name} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-3">{bureau.name}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 mt-0.5 text-gray-500" />
                                <span>{bureau.phone}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Building2 className="w-4 h-4 mt-0.5 text-gray-500" />
                                <span>{bureau.website}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Debt Collector Database</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input placeholder="Search debt collector by name..." />
                        <p className="text-sm text-gray-500">Search for contact information and complaint history of debt collectors.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* My Templates (saved by user) */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Templates</h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  // reload saved templates
                  if (user?.id) setSavedTemplates(templateStorage.getSavedTemplates(user.id));
                }}>
                  Refresh
                </Button>
              </div>

              {savedTemplates.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500">You haven't saved any templates yet. Use templates from the library to save them here for quick access.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {savedTemplates.map((tmpl) => (
                    <Card key={tmpl.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-sm text-gray-900">{tmpl.name}</h3>
                            <p className="text-xs text-gray-500">{tmpl.legalArea}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleTemplateSelect(tmpl)}>Apply</Button>
                            <Button size="sm" variant="outline" onClick={async () => {
                              if (!user?.id) return;
                              try {
                                // Try server delete first
                                await api.deleteSavedTemplate(tmpl.id, user.id);
                                toast({ title: 'Removed', description: `${tmpl.name} removed from saved templates.` });
                              } catch (err) {
                                // Fallback to local storage delete
                                templateStorage.removeSavedTemplate(user.id, tmpl.id);
                                toast({ title: 'Removed (local)', description: `${tmpl.name} removed from saved templates.` });
                              } finally {
                                // Refresh local view
                                try { setSavedTemplates(templateStorage.getSavedTemplates(user.id)); } catch(e) { setSavedTemplates([]); }
                              }
                            }}>Remove</Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-3">{tmpl.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>



            {/* Quick Actions */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/chat')}>
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">New Dispute</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Package className="w-6 h-6" />
                  <span className="text-sm">Track Mail</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <CalendarIcon className="w-6 h-6" />
                  <span className="text-sm">Set Reminder</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <MailIcon className="w-6 h-6" />
                  <span className="text-sm">File Complaint</span>
                </Button>
              </div>
            </section>
          </div>
        </div>
        {/* Floating Tavus Customer Support Chatbot */}
        <ElevenLabsChatbot />

        {/* Calendar Event Modal */}
        <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Event for {selectedDate?.toLocaleDateString()}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="event-title">Event Title *</Label>
                <Input
                  id="event-title"
                  placeholder="e.g., FCRA 30-day deadline"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={newEvent.event_type} onValueChange={(value: any) => setNewEvent({ ...newEvent, event_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="mailed">Mail Sent</SelectItem>
                    <SelectItem value="delivered">Mail Delivered</SelectItem>
                    <SelectItem value="response">Response Received</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="related-type">Link to (Optional)</Label>
                <Select value={newEvent.related_type} onValueChange={(value) => setNewEvent({ ...newEvent, related_type: value, related_id: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="dispute">Dispute</SelectItem>
                    <SelectItem value="mail">Certified Mail</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newEvent.related_type && newEvent.related_type !== 'none' && (
                <div>
                  <Label htmlFor="related-item">Select Item</Label>
                  <Select value={newEvent.related_id} onValueChange={(value) => setNewEvent({ ...newEvent, related_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {newEvent.related_type === 'dispute' && disputes.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.title} - {d.bureau}</SelectItem>
                      ))}
                      {newEvent.related_type === 'mail' && certifiedMail.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.recipient} - {m.tracking_number}</SelectItem>
                      ))}
                      {newEvent.related_type === 'complaint' && complaints.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.agency} - {c.complaint_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="event-description">Description (Optional)</Label>
                <Textarea
                  id="event-description"
                  placeholder="Add notes or details..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEventModal(false)}>Cancel</Button>
              <Button onClick={handleSaveEvent}>Save Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}