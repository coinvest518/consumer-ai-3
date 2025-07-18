import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { Package, Search, AlertCircle, CheckCircle, Truck, Clock } from 'lucide-react';

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  expectedDeliveryDate?: string;
  expectedDeliveryTime?: string;
  eventSummaries?: string[];
  lastUpdated?: string;
}

interface TrackingDisplayProps {
  trackingNumber?: string;
}

export function TrackingDisplay({ trackingNumber: initialTrackingNumber }: TrackingDisplayProps) {
  const { user } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingInfo[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (initialTrackingNumber) {
      setTrackingNumber(initialTrackingNumber);
      fetchTrackingInfo(initialTrackingNumber);
    }
    
    if (user?.id) {
      fetchTrackingHistory();
    }
  }, [initialTrackingNumber, user?.id]);

  const fetchTrackingInfo = async (number: string) => {
    if (!number) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, call your API
      // const response = await api.getTrackingInfo(number);
      
      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInfo: TrackingInfo = {
        trackingNumber: number,
        status: 'In Transit',
        expectedDeliveryDate: '2023-07-15',
        expectedDeliveryTime: 'by 8:00pm',
        eventSummaries: [
          'Departed USPS Regional Facility - July 13, 2023, 11:32 pm',
          'Arrived at USPS Regional Facility - July 13, 2023, 9:21 am',
          'Accepted at USPS Origin Facility - July 12, 2023, 3:45 pm'
        ],
        lastUpdated: new Date().toISOString()
      };
      
      setTrackingInfo(mockInfo);
    } catch (err) {
      console.error('Error fetching tracking info:', err);
      setError('Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingHistory = async () => {
    if (!user?.id) return;
    
    try {
      // In a real implementation, call your API
      // const response = await api.getTrackingHistory(user.id);
      
      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockHistory: TrackingInfo[] = [
        {
          trackingNumber: '9400100000000000000001',
          status: 'Delivered',
          lastUpdated: '2023-07-10T15:30:00Z'
        },
        {
          trackingNumber: '9400100000000000000002',
          status: 'In Transit',
          lastUpdated: '2023-07-12T09:45:00Z'
        }
      ];
      
      setTrackingHistory(mockHistory);
    } catch (err) {
      console.error('Error fetching tracking history:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackingInfo(trackingNumber);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in transit':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Package className="mr-2 h-5 w-5" />
        USPS Tracking
      </h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!trackingNumber || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Loading...' : 'Track'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {trackingInfo && (
        <div className="mb-6 border border-gray-200 rounded-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Tracking #: {trackingInfo.trackingNumber}</h3>
            <div className="flex items-center">
              {getStatusIcon(trackingInfo.status)}
              <span className="ml-1 text-sm font-medium">{trackingInfo.status}</span>
            </div>
          </div>
          
          {trackingInfo.expectedDeliveryDate && (
            <p className="text-sm mb-3">
              Expected Delivery: {trackingInfo.expectedDeliveryDate} {trackingInfo.expectedDeliveryTime}
            </p>
          )}
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Tracking Events</h4>
            <div className="space-y-2">
              {trackingInfo.eventSummaries?.map((event, index) => (
                <div key={index} className="text-xs border-l-2 border-blue-500 pl-3 py-1">
                  {event}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {trackingHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
          >
            {showHistory ? 'Hide' : 'Show'} Tracking History ({trackingHistory.length})
          </button>
          
          {showHistory && (
            <div className="border border-gray-200 rounded-md divide-y">
              {trackingHistory.map((item, index) => (
                <div key={index} className="p-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">{item.trackingNumber}</p>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(item.lastUpdated || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(item.status)}
                    <span className="ml-1 text-sm">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}