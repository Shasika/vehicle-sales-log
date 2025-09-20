'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    url: string;
    isPrimary?: boolean;
    uploadedAt?: Date;
  }>;
  initialIndex?: number;
  title?: string;
}

export default function ImageViewer({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title = "Vehicle Images"
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `vehicle-image-${currentIndex + 1}.jpg`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black dark:bg-black bg-opacity-90 dark:bg-opacity-95 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 dark:from-black/70 to-transparent">
        <div className="flex items-center justify-between p-4 text-white dark:text-gray-100">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-300 dark:text-gray-400">
              Image {currentIndex + 1} of {images.length}
              {currentImage.isPrimary && <span className="ml-2 bg-blue-600 dark:bg-blue-500 px-2 py-1 rounded-full text-xs">Primary</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 dark:hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 dark:bg-black/70 hover:bg-black/70 dark:hover:bg-black/80 text-white dark:text-gray-100 rounded-full transition-colors z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 dark:bg-black/70 hover:bg-black/70 dark:hover:bg-black/80 text-white dark:text-gray-100 rounded-full transition-colors z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image */}
      <div className="flex items-center justify-center w-full h-full p-16">
        <img
          src={currentImage.url}
          alt={`Vehicle image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 dark:from-black/70 to-transparent">
        <div className="flex items-center justify-center space-x-4 p-4">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 bg-black/50 dark:bg-black/70 hover:bg-black/70 dark:hover:bg-black/80 text-white dark:text-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="text-white dark:text-gray-100 text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-2 bg-black/50 dark:bg-black/70 hover:bg-black/70 dark:hover:bg-black/80 text-white dark:text-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-white/30 dark:bg-gray-400/30" />

          <button
            onClick={handleDownload}
            className="p-2 bg-black/50 dark:bg-black/70 hover:bg-black/70 dark:hover:bg-black/80 text-white dark:text-gray-100 rounded-full transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex items-center justify-center space-x-2 p-4">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                className={`w-12 h-8 rounded border-2 overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'border-white dark:border-gray-200 shadow-lg'
                    : 'border-white/30 dark:border-gray-400/30 hover:border-white/60 dark:hover:border-gray-300/60'
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}