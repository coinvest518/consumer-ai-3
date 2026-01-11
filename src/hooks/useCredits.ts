import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import socket from '@/lib/socket';

interface CreditNotification {
  id: string;
  credits: number;
  source: 'credit-builder' | 'daily-login' | 'purchase';
  streakCount?: number;
  timestamp: number;
}

interface DailyLoginStatus {
  claimedToday: boolean;
  streakCount: number;
  lastLoginDate: string | null;
}

export function useCredits() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<CreditNotification[]>([]);
  const [dailyLoginStatus, setDailyLoginStatus] = useState<DailyLoginStatus>({
    claimedToday: false,
    streakCount: 0,
    lastLoginDate: null
  });
  const [userCredits, setUserCredits] = useState<number>(0);

  // Fetch user credits
  const fetchCredits = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching credits:', error);
        return;
      }

      setUserCredits(data?.credits || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  }, [user]);

  // Check daily login status  
  const checkDailyLoginStatus = useCallback(async () => {
    if (!user) return;

    try {
      // Instead of direct database query, use a simple date check
      // The actual status will be confirmed when user tries to claim
      const lastClaimedDate = localStorage.getItem(`lastDailyLogin_${user.id}`);
      const today = new Date().toISOString().split('T')[0];
      
      setDailyLoginStatus({
        claimedToday: lastClaimedDate === today,
        streakCount: 0, // Will be updated when claiming
        lastLoginDate: lastClaimedDate
      });
    } catch (error) {
      console.error('Error checking daily login status:', error);
    }
  }, [user]);

  // Claim daily login bonus
  const claimDailyLoginBonus = useCallback(async () => {
    if (!user || dailyLoginStatus.claimedToday) return null;

    try {
      const response = await fetch('/api/daily-login-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.success && !data.alreadyClaimed) {
        // Add notification
        const notification: CreditNotification = {
          id: `daily-login-${Date.now()}`,
          credits: data.creditsAwarded,
          source: 'daily-login',
          streakCount: data.streakCount,
          timestamp: Date.now()
        };

        setNotifications(prev => [...prev, notification]);

        // Update local state
        setUserCredits(prev => prev + data.creditsAwarded);
        setDailyLoginStatus(prev => ({
          ...prev,
          claimedToday: true,
          streakCount: data.streakCount
        }));

        // Store in localStorage for persistent checking
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`lastDailyLogin_${user.id}`, today);

        return data;
      }

      return data;
    } catch (error) {
      console.error('Error claiming daily login bonus:', error);
      return null;
    }
  }, [user, dailyLoginStatus.claimedToday]);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Listen for credit updates via socket
  useEffect(() => {
    if (!user) return;

    const handleCreditUpdate = (data: any) => {
      if (data.userId === user.id) {
        // Update credits
        setUserCredits(data.data.totalCredits);

        // Add notification if credits were awarded
        if (data.data.creditsAwarded > 0) {
          const notification: CreditNotification = {
            id: `${data.event}-${Date.now()}`,
            credits: data.data.creditsAwarded,
            source: data.data.source,
            streakCount: data.data.streakCount,
            timestamp: Date.now()
          };

          setNotifications(prev => [...prev, notification]);
        }
      }
    };

    socket.on('credits-updated', handleCreditUpdate);

    return () => {
      socket.off('credits-updated', handleCreditUpdate);
    };
  }, [user]);

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      fetchCredits();
      checkDailyLoginStatus();
    }
  }, [user, fetchCredits, checkDailyLoginStatus]);

  return {
    userCredits,
    notifications,
    dailyLoginStatus,
    claimDailyLoginBonus,
    removeNotification,
    refreshCredits: fetchCredits,
    refreshDailyLoginStatus: checkDailyLoginStatus
  };
}