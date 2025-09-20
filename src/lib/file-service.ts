import { writeFile, mkdir, unlink, access } from 'fs/promises';
import { createReadStream, constants } from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { env } from './env';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface FileUploadOptions {
  entityType: 'vehicles' | 'persons' | 'deals' | 'expenses';
  entityId: string;
  allowedMimeTypes?: string[];
  maxSize?: number;
  generateThumbnail?: boolean;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ...ALLOWED_IMAGE_TYPES,
];

export class FileService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = env.UPLOAD_DIR;
  }

  private generateFileName(originalName: string, entityId: string): string {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString('hex');
    return `${entityId}-${hash}${ext}`;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await access(dirPath, constants.F_OK);
    } catch {
      await mkdir(dirPath, { recursive: true });
    }
  }

  private getEntityPath(entityType: string, entityId: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return path.join(this.uploadDir, entityType, year.toString(), month);
  }

  private async generateThumbnail(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    await sharp(inputPath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  }

  async uploadFile(
    file: Buffer,
    originalName: string,
    mimetype: string,
    options: FileUploadOptions
  ): Promise<UploadedFile> {
    const { entityType, entityId, allowedMimeTypes, maxSize, generateThumbnail } = options;

    if (maxSize && file.length > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    const allowedTypes = allowedMimeTypes || ALLOWED_DOCUMENT_TYPES;
    if (!allowedTypes.includes(mimetype)) {
      throw new Error(`File type ${mimetype} is not allowed`);
    }

    const entityPath = this.getEntityPath(entityType, entityId);
    await this.ensureDirectoryExists(entityPath);

    const fileName = this.generateFileName(originalName, entityId);
    const filePath = path.join(entityPath, fileName);
    
    await writeFile(filePath, file);

    const relativePath = path.relative(this.uploadDir, filePath);
    const url = `/api/files/${relativePath.replace(/\\/g, '/')}`;

    const result: UploadedFile = {
      filename: fileName,
      originalName,
      mimetype,
      size: file.length,
      url,
    };

    if (generateThumbnail && ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      const thumbnailFileName = `thumb_${fileName}`;
      const thumbnailPath = path.join(entityPath, thumbnailFileName);
      
      try {
        await this.generateThumbnail(filePath, thumbnailPath);
        const thumbnailRelativePath = path.relative(this.uploadDir, thumbnailPath);
        result.thumbnailUrl = `/api/files/${thumbnailRelativePath.replace(/\\/g, '/')}`;
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }

    return result;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const relativePath = fileUrl.replace('/api/files/', '');
    const fullPath = path.join(this.uploadDir, relativePath);

    try {
      await unlink(fullPath);
      
      if (relativePath.includes('thumb_')) {
        const originalPath = fullPath.replace('thumb_', '');
        try {
          await unlink(originalPath);
        } catch (error) {
          console.error('Failed to delete original file:', error);
        }
      } else {
        const thumbnailPath = path.join(
          path.dirname(fullPath),
          `thumb_${path.basename(fullPath)}`
        );
        try {
          await unlink(thumbnailPath);
        } catch (error) {
        }
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  getFileStream(fileUrl: string) {
    const relativePath = fileUrl.replace('/api/files/', '');
    const fullPath = path.join(this.uploadDir, relativePath);
    return createReadStream(fullPath);
  }

  async fileExists(fileUrl: string): Promise<boolean> {
    const relativePath = fileUrl.replace('/api/files/', '');
    const fullPath = path.join(this.uploadDir, relativePath);
    
    try {
      await access(fullPath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async cleanupOrphanedFiles(entityType: string, validUrls: string[]): Promise<number> {
    let cleanedCount = 0;
    
    try {
      const entityDir = path.join(this.uploadDir, entityType);
      const validPaths = validUrls.map(url => {
        const relativePath = url.replace('/api/files/', '');
        return path.join(this.uploadDir, relativePath);
      });

      cleanedCount = 0;
    } catch (error) {
      console.error('Failed to cleanup orphaned files:', error);
    }

    return cleanedCount;
  }
}

export const fileService = new FileService();