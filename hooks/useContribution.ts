
'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface SecureContribution {
  validateOwnership: (targetMemberId: string) => boolean;
  processOwnContribution: (contributionData: any) => Promise<boolean>;
  getMemberContributionAccounts: () => Promise<any[]>;
}

export function useSecureContributions(): SecureContribution {
  const { data: session } = useSession();
  const [userMemberId, setUserMemberId] = useState<string | null>(null);

  const fetchUserMemberId = useCallback(async (): Promise<string | null> => {
    if (!session?.user?.id) return null;
    
    try {
      const response = await fetch(`/api/members/user/${session.user.id}`);
      if (response.ok) {
        const member = await response.json();
        return member.id;
      }
    } catch (error) {
      console.error('Error fetching user member ID:', error);
    }
    return null;
  }, [session]);

  const validateOwnership = useCallback((targetMemberId: string): boolean => {
  
    return userMemberId === targetMemberId;
  }, [userMemberId]);

  const processOwnContribution = useCallback(async (contributionData: any): Promise<boolean> => {
    try {
  
      if (!validateOwnership(contributionData.memberId)) {
        toast.error('You can only contribute to your own account');
        return false;
      }

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contributionData,
          source: 'SELF_CONTRIBUTION',
          verifiedBy: 'SYSTEM'
        })
      });

      if (response.ok) {
        toast.success('Contribution added to your account successfully');
        return true;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to process contribution');
        return false;
      }
    } catch (error) {
      console.error('Contribution processing error:', error);
      toast.error('Failed to process contribution');
      return false;
    }
  }, [validateOwnership]);

  const getMemberContributionAccounts = useCallback(async (): Promise<any[]> => {
    if (!userMemberId) return [];
    
    try {
      const response = await fetch(`/api/members/${userMemberId}/accounts`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching member accounts:', error);
    }
    return [];
  }, [userMemberId]);

  return {
    validateOwnership,
    processOwnContribution,
    getMemberContributionAccounts
  };
}