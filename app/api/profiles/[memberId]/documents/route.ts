import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// POST /api/profiles/[memberId]/documents - Upload profile document
export async function POST(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can upload documents for this profile
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      });
      
      if (!member || member.id !== params.memberId) {
        return NextResponse.json(
          { error: 'You can only upload documents for your own profile' },
          { status: 403 }
        );
      }
    }

    // Check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { memberId: params.memberId }
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await prisma.profile.create({
        data: { memberId: params.memberId }
      });
    }

    const body = await request.json();
    const {
      type,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      expiryDate,
      notes
    } = body;

    // Validate required fields
    if (!type || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: type, fileName, fileUrl' },
        { status: 400 }
      );
    }

    const document = await prisma.profileDocument.create({
      data: {
        profileId: profile.id,
        type,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes
      }
    });

    return NextResponse.json(document, { status: 201 });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// GET /api/profiles/[memberId]/documents - Get all documents for a profile
export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can view documents for this profile
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      });
      
      if (!member || member.id !== params.memberId) {
        return NextResponse.json(
          { error: 'You can only view documents for your own profile' },
          { status: 403 }
        );
      }
    }

    const profile = await prisma.profile.findUnique({
      where: { memberId: params.memberId },
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile.documents);

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}