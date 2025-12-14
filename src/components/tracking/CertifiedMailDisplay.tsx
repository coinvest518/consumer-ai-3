import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, AlertCircle, CheckCircle, Mail, Clock, Info } from 'lucide-react';

interface CertifiedMailRecord {
  id: string;
  description: string;
  mailDate: string;
  recipient: string;
  purpose: string; // 'dispute', 'validation', 'complaint', 'other'
  legalDeadline?: string;
  status: 'sent' | 'delivered' | 'deadline-approaching' | 'overdue';
  notes?: string;
}

interface CertifiedMailDisplayProps {
  initialRecord?: CertifiedMailRecord;
}

export function CertifiedMailDisplay({ initialRecord }: CertifiedMailDisplayProps) {
  const { user } = useAuth();
  const [mailRecords, setMailRecords] = useState<CertifiedMailRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    description: '',
    mailDate: '',
    recipient: '',
    purpose: 'dispute' as const,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadMailRecords();
    }
  }, [user?.id]);

  const loadMailRecords = () => {
    // Load from localStorage for now - in production, use API
    const stored = localStorage.getItem(`certifiedMail_${user?.id}`);
    if (stored) {
      setMailRecords(JSON.parse(stored));
    }
  };

  const saveMailRecords = (records: CertifiedMailRecord[]) => {
    localStorage.setItem(`certifiedMail_${user?.id}`, JSON.stringify(records));
    setMailRecords(records);
  };

  const calculateDeadline = (mailDate: string, purpose: string): string | undefined => {
    const date = new Date(mailDate);
    // Add 3-5 business days for delivery assumption
    date.setDate(date.getDate() + 5);
    
    switch (purpose) {
      case 'dispute':
        date.setDate(date.getDate() + 30); // FCRA 30-day dispute period
        break;
      case 'validation':
        date.setDate(date.getDate() + 5); // FDCPA 5-day validation period
        break;
      default:
        return undefined;
    }
    return date.toISOString().split('T')[0];
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.description || !newRecord.mailDate || !newRecord.recipient) {
      setError('Please fill in all required fields');
      return;
    }

    const record: CertifiedMailRecord = {
      id: Date.now().toString(),
      ...newRecord,
      legalDeadline: calculateDeadline(newRecord.mailDate, newRecord.purpose),
      status: 'sent'
    };

    const updatedRecords = [...mailRecords, record];
    saveMailRecords(updatedRecords);
    
    setNewRecord({ description: '', mailDate: '', recipient: '', purpose: 'dispute', notes: '' });
    setShowAddForm(false);
    setError(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'deadline-approaching':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Mail className="h-5 w-5 text-blue-500" />;
    }
  };

  const getDaysUntilDeadline = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Certified Mail Timeline
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Mail Record
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Important: Certified Mail Legal Requirements</p>
            <p>• FCRA disputes: 30 days from when credit bureau receives your letter</p>
            <p>• FDCPA validation: 5 days from when debt collector receives your request</p>
            <p>• Certified mail is legally presumed delivered 3-5 business days after mailing</p>
          </div>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRecord} className="mb-6 p-4 border border-gray-200 rounded-md">
          <h3 className="font-medium mb-3">Add New Certified Mail Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <input
                type="text"
                value={newRecord.description}
                onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                placeholder="e.g., Credit dispute letter to Experian"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mail Date *</label>
              <input
                type="date"
                value={newRecord.mailDate}
                onChange={(e) => setNewRecord({...newRecord, mailDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipient *</label>
              <input
                type="text"
                value={newRecord.recipient}
                onChange={(e) => setNewRecord({...newRecord, recipient: e.target.value})}
                placeholder="e.g., Experian Credit Bureau"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <select
                value={newRecord.purpose}
                onChange={(e) => setNewRecord({...newRecord, purpose: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dispute">FCRA Credit Dispute</option>
                <option value="validation">FDCPA Debt Validation</option>
                <option value="complaint">Consumer Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={newRecord.notes}
              onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
              placeholder="Additional notes about this mailing..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Save Record
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {mailRecords.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No certified mail records yet.</p>
          <p className="text-sm">Add your first record to start tracking legal deadlines.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mailRecords.map((record) => {
            const daysUntilDeadline = record.legalDeadline ? getDaysUntilDeadline(record.legalDeadline) : null;
            return (
              <div key={record.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{record.description}</h3>
                  <div className="flex items-center">
                    {getStatusIcon(record.status)}
                    <span className="ml-1 text-sm font-medium capitalize">{record.status.replace('-', ' ')}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                  <p><strong>Mailed:</strong> {new Date(record.mailDate).toLocaleDateString()}</p>
                  <p><strong>To:</strong> {record.recipient}</p>
                  <p><strong>Purpose:</strong> {record.purpose.toUpperCase()}</p>
                </div>
                
                {record.legalDeadline && (
                  <div className={`p-2 rounded text-sm ${
                    daysUntilDeadline && daysUntilDeadline <= 7 
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : daysUntilDeadline && daysUntilDeadline <= 14
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    <strong>Legal Deadline:</strong> {new Date(record.legalDeadline).toLocaleDateString()}
                    {daysUntilDeadline !== null && (
                      <span className="ml-2">
                        ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days remaining` : `${Math.abs(daysUntilDeadline)} days overdue`})
                      </span>
                    )}
                  </div>
                )}
                
                {record.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">{record.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}