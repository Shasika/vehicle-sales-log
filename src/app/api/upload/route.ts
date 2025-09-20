import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { fileService } from '@/lib/file-service';
import { z } from 'zod';

const uploadSchema = z.object({
  entityType: z.enum(['vehicles', 'persons', 'deals', 'expenses']),
  entityId: z.string().min(1),
  generateThumbnail: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;
    const generateThumbnail = formData.get('generateThumbnail') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validation = uploadSchema.safeParse({
      entityType,
      entityId,
      generateThumbnail,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const uploadedFile = await fileService.uploadFile(
      buffer,
      file.name,
      file.type,
      {
        entityType: validation.data.entityType,
        entityId: validation.data.entityId,
        generateThumbnail: validation.data.generateThumbnail,
        maxSize: 10 * 1024 * 1024, // 10MB
      }
    );

    return NextResponse.json({
      success: true,
      data: uploadedFile,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL required' }, { status: 400 });
    }

    await fileService.deleteFile(fileUrl);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}