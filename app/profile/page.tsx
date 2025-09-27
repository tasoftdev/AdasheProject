'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import ProfileManagement from '@/components/profiles/profile-management';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/members');
          if (response.ok) {
            const data = await response.json();
            // Find the member associated with the current user
            const userMember = data.members?.find((member: any) => member.userId === session.user.id);
            if (userMember) {
              setMemberId(userMember.id);
            }
          }
        } catch (error) {
          console.error('Error fetching member data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (session) {
      fetchMemberData();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
  }

  if (!memberId) {
    return <div>Member profile not found</div>;
  }

  return <ProfileManagement memberId={memberId} isOwnProfile={true} />;
}