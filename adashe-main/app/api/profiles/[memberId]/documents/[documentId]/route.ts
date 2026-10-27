import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// PUT /api/profiles/[memberId]/documents/[documentId] - Update document (verify, reject, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { memberId: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and managers can verify documents
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Only administrators and managers can verify documents' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, notes, expiryDate } = body;

    const document = await prisma.profileDocument.findUnique({
      where: { id: params.documentId },
      include: {
        profile: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                memberCode: true
              }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.profile.memberId !== params.memberId) {
      return NextResponse.json(
        { error: 'Document does not belong to this member' },
        { status: 400 }
      );
    }

    const updateData: any = {
      notes
    };

    if (status) {
      updateData.status = status;
      if (status === 'VERIFIED') {
        updateData.verifiedAt = new Date();
        updateData.verifiedBy = session.user.id;
      }
    }

    if (expiryDate) {
      updateData.expiryDate = new Date(expiryDate);
    }

    const updatedDocument = await prisma.profileDocument.update({
      where: { id: params.documentId },
      data: updateData
    });

    return NextResponse.json(updatedDocument);

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/profiles/[memberId]/documents/[documentId] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await prisma.profileDocument.findUnique({
      where: { id: params.documentId },
      include: {
        profile: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.profile.memberId !== params.memberId) {
      return NextResponse.json(
        { error: 'Document does not belong to this member' },
        { status: 400 }
      );
    }

    // Check permissions - users can delete their own documents, admins can delete any
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      });
      
      if (!member || member.id !== params.memberId) {
        return NextResponse.json(
          { error: 'You can only delete your own documents' },
          { status: 403 }
        );
      }
    }

    await prisma.profileDocument.delete({
      where: { id: params.documentId }
    });

    return NextResponse.json({ message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}