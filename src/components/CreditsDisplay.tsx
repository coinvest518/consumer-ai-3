import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles, TrendingUp, Calendar, Gift } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CreditNotification from '@/components/CreditNotification';

interface CreditsDisplayProps {
  compact?: boolean;
}

export default function CreditsDisplay({ compact = false }: CreditsDisplayProps) {
  const { user } = useAuth();
  const {
    userCredits,
    notifications,
    dailyLoginStatus,
    claimDailyLoginBonus,
    removeNotification
  } = useCredits();

  const [earnedCredits, setEarnedCredits] = useState(0);
  const [paidCredits, setPaidCredits] = useState(0);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [claimingBonus, setClaimingBonus] = useState(false);

  // Calculate earned vs paid credits
  useEffect(() => {
    const calculateCreditBreakdown = async () => {
      if (!user) return;

      try {
        // Get paid credits from purchases only (avoid RLS issues with other tables)
        const { data: purchases, error: purchasesError } = await supabase
          .from('purchases')
          .select('credits')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (purchasesError) {
          console.error('Error fetching purchases:', purchasesError);
          // Fallback: assume all credits are earned
          setEarnedCredits(userCredits);
          setPaidCredits(0);
          return;
        }

        const totalPaidCredits = purchases?.reduce((sum, purchase) => sum + (purchase.credits || 0), 0) || 0;

        // For now, assume remaining credits are earned (avoid direct queries to problematic tables)
        // The API endpoints handle credit awarding properly with service role permissions
        const calculatedEarnedCredits = Math.max(0, userCredits - totalPaidCredits);

        setPaidCredits(totalPaidCredits);
        setEarnedCredits(calculatedEarnedCredits);
      } catch (error) {
        console.error('Error calculating credit breakdown:', error);
        setEarnedCredits(userCredits);
        setPaidCredits(0);
      }
    };

    calculateCreditBreakdown();
  }, [user, userCredits]);

  const handleClaimDailyBonus = async () => {
    setClaimingBonus(true);
    try {
      await claimDailyLoginBonus();
    } finally {
      setClaimingBonus(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span className="font-semibold text-gray-900 dark:text-white">
            {userCredits}
          </span>
        </div>

        {!dailyLoginStatus.claimedToday && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleClaimDailyBonus}
            disabled={claimingBonus}
            className="h-6 px-2 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            <Gift className="w-3 h-3 mr-1" />
            {claimingBonus ? '...' : 'Daily'}
          </Button>
        )}

        {/* Notifications */}
        {notifications.map((notification) => (
          <CreditNotification
            key={notification.id}
            credits={notification.credits}
            source={notification.source}
            streakCount={notification.streakCount}
            onComplete={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <Card className="mb-4 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Your Credits
              </span>
            </div>

            {!dailyLoginStatus.claimedToday && (
              <Button
                size="sm"
                onClick={handleClaimDailyBonus}
                disabled={claimingBonus}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0"
              >
                <Calendar className="w-4 h-4 mr-1" />
                {claimingBonus ? 'Claiming...' : 'Daily Bonus'}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {userCredits}
              </span>
              <div className="text-right text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Earned: {earnedCredits}</span>
                </div>
                {paidCredits > 0 && (
                  <div className="flex items-center gap-1 text-purple-600">
                    <Sparkles className="w-3 h-3" />
                    <span>Paid: {paidCredits}</span>
                  </div>
                )}
              </div>
            </div>

            {dailyLoginStatus.streakCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span>🔥</span>
                  <span>{dailyLoginStatus.streakCount} day streak</span>
                </div>
                {dailyLoginStatus.claimedToday && (
                  <span className="text-green-600">✓ Today claimed</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.map((notification) => (
        <CreditNotification
          key={notification.id}
          credits={notification.credits}
          source={notification.source}
          streakCount={notification.streakCount}
          onComplete={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
}