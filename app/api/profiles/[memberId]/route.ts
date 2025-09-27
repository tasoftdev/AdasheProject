import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// GET /api/profiles/[memberId] - Get member's profile
export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can view this profile
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      });
      
      if (!member || member.id !== params.memberId) {
        return NextResponse.json(
          { error: 'You can only view your own profile' },
          { status: 403 }
        );
      }
    }

    const profile = await prisma.profile.findUnique({
      where: { memberId: params.memberId },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            memberCode: true,
            dateOfBirth: true,
            address: true,
            occupation: true,
            status: true,
            joinDate: true,
            avatar: true
          }
        },
        documents: {
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!profile) {
      // Create a new profile if it doesn't exist
      const newProfile = await prisma.profile.create({
        data: {
          memberId: params.memberId
        },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              memberCode: true,
              dateOfBirth: true,
              address: true,
              occupation: true,
              status: true,
              joinDate: true,
              avatar: true
            }
          },
          documents: true
        }
      });
      
      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT /api/profiles/[memberId] - Update member's profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can update this profile
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      });
      
      if (!member || member.id !== params.memberId) {
        return NextResponse.json(
          { error: 'You can only update your own profile' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      // Personal Information
      middleName,
      gender,
      maritalStatus,
      nationality,
      stateOfOrigin,
      localGovernment,
      religion,
      bloodGroup,
      
      // Contact Information
      alternatePhone,
      alternateEmail,
      residentialAddress,
      permanentAddress,
      city,
      state,
      postalCode,
      country,
      
      // Professional Information
      employer,
      jobTitle,
      workAddress,
      workPhone,
      workEmail,
      monthlyIncome,
      yearsOfExperience,
      
      // Emergency Contact
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactEmail,
      emergencyContactRelation,
      emergencyContactAddress,
      
      // Next of Kin
      nextOfKinName,
      nextOfKinPhone,
      nextOfKinEmail,
      nextOfKinRelation,
      nextOfKinAddress,
      nextOfKinDateOfBirth,
      
      // Banking Information
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankBranch,
      bankSortCode,
      bvn,
      
      // Additional Information
      languages,
      skills,
      hobbies,
      socialMedia,
      preferredCommunication
    } = body;

    // Check if profile exists, create if not
    let profile = await prisma.profile.findUnique({
      where: { memberId: params.memberId }
    });

    const profileData = {
      middleName,
      gender,
      maritalStatus,
      nationality,
      stateOfOrigin,
      localGovernment,
      religion,
      bloodGroup,
      alternatePhone,
      alternateEmail,
      residentialAddress,
      permanentAddress,
      city,
      state,
      postalCode,
      country,
      employer,
      jobTitle,
      workAddress,
      workPhone,
      workEmail,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
      yearsOfExperience,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactEmail,
      emergencyContactRelation,
      emergencyContactAddress,
      nextOfKinName,
      nextOfKinPhone,
      nextOfKinEmail,
      nextOfKinRelation,
      nextOfKinAddress,
      nextOfKinDateOfBirth: nextOfKinDateOfBirth ? new Date(nextOfKinDateOfBirth) : null,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankBranch,
      bankSortCode,
      bvn,
      languages: languages ? JSON.stringify(languages) : null,
      skills: skills ? JSON.stringify(skills) : null,
      hobbies: hobbies ? JSON.stringify(hobbies) : null,
      socialMedia: socialMedia ? JSON.stringify(socialMedia) : null,
      preferredCommunication
    };

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          memberId: params.memberId,
          ...profileData
        },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              memberCode: true
            }
          },
          documents: true
        }
      });
    } else {
      profile = await prisma.profile.update({
        where: { memberId: params.memberId },
        data: profileData,
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              memberCode: true
            }
          },
          documents: true
        }
      });
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}