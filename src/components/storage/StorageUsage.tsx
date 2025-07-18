import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { formatBytes } from '@/lib/storageUtils';

interface StorageQuotaData {
  used: number;
  total: number;
  filesUsed: number;
  filesTotal: number;
  percentUsed: number;
  isPremium: boolean;
  tier: string;
}

export function StorageUsage() {
  const { user } = useAuth();
  const [quota, setQuota] = useState<StorageQuotaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadQuota();
    }
  }, [user?.id]);

  const loadQuota = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const quotaData = await api.getStorageQuota(user.id);
      setQuota(quotaData);
    } catch (err) {
      console.error('Error loading storage quota:', err);
      setError('Failed to load storage information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    if (!user?.id) return;
    try {
      setUpgrading(true);
      setError(null);
      const response = await api.upgradeStorage(plan, user.id);
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Error upgrading storage:', err);
      setError('Failed to start upgrade process');
    } finally {
      setUpgrading(false);
    }
  };

  if (!user) {
    return <div className="p-4 text-center">Please log in to view storage information</div>;
  }

  if (loading) {
    return <div className="p-4 text-center">Loading storage information...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={loadQuota}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!quota) {
    return <div className="p-4 text-center">No storage information available</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Storage Usage</h2>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Used Space</span>
          <span>{formatBytes(quota.used)} / {formatBytes(quota.total)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${quota.percentUsed > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, quota.percentUsed)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Files</span>
          <span>{quota.filesUsed} / {quota.filesTotal}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${(quota.filesUsed / quota.filesTotal) > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, (quota.filesUsed / quota.filesTotal) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Current Plan: <span className="font-semibold">{quota.tier.charAt(0).toUpperCase() + quota.tier.slice(1)}</span>
        </p>
      </div>
      
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleUpgrade('basic')}
          disabled={upgrading || quota.tier === 'basic'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {upgrading ? 'Processing...' : 'Upgrade to Basic ($5/mo)'}
        </button>
        
        <button
          onClick={() => handleUpgrade('pro')}
          disabled={upgrading || quota.tier === 'pro'}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {upgrading ? 'Processing...' : 'Upgrade to Pro ($10/mo)'}
        </button>
        
        <button
          onClick={() => handleUpgrade('enterprise')}
          disabled={upgrading || quota.tier === 'enterprise'}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {upgrading ? 'Processing...' : 'Upgrade to Enterprise ($25/mo)'}
        </button>
      </div>
    </div>
  );
}