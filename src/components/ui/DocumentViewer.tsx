'use client';

import { useState } from 'react';
import { X, Download, Eye, FileText, Image as ImageIcon, File } from 'lucide-react';
import Button from './Button';

interface Document {
  type: string;
  url: string;
  filename: string;
  uploadedAt?: string;
  caption?: string;
}

interface DocumentViewerProps {
  documents: Document[];
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentViewer({ documents, title = 'Documents', isOpen, onClose }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon className="h-6 w-6 text-green-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const isImage = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleView = (doc: Document) => {
    if (isImage(doc.filename)) {
      setSelectedDoc(doc);
    } else {
      // Open in new tab for PDFs and other documents
      window.open(doc.url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:max-w-4xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                No documents have been uploaded yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    {getFileIcon(doc.filename)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {doc.type}
                      </p>
                    </div>
                  </div>

                  {doc.caption && (
                    <p className="text-sm text-gray-600 mb-3">{doc.caption}</p>
                  )}

                  {doc.uploadedAt && (
                    <p className="text-xs text-gray-500 mb-3">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(doc)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc)}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedDoc && isImage(selectedDoc.filename) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedDoc.url}
              alt={selectedDoc.filename}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <p className="font-medium">{selectedDoc.filename}</p>
              {selectedDoc.caption && (
                <p className="text-sm opacity-75">{selectedDoc.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}