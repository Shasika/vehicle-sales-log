import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { fileService } from '@/lib/file-service';
import path from 'path';
import { stat } from 'fs/promises';

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Allow public access to uploaded files since user is already authenticated on the page
    // This enables img tags to load images without needing authentication headers
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join('/');
    const fileUrl = `/api/files/${filePath}`;
    
    const exists = await fileService.fileExists(fileUrl);
    if (!exists) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stream = fileService.getFileStream(fileUrl);
    const fullPath = path.join(process.cwd(), 'public/uploads', filePath);
    const stats = await stat(fullPath);
    
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    contentType = mimeTypes[ext] || contentType;
    
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: string | Buffer) => {
          const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
          controller.enqueue(new Uint8Array(buffer));
        });
        
        stream.on('end', () => {
          controller.close();
        });
        
        stream.on('error', (error) => {
          controller.error(error);
        });
      },
    });

    return new NextResponse(readableStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'private, max-age=31536000',
      },
    });
    
  } catch (error) {
    console.error('File serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}