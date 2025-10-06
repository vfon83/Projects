"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, X } from "lucide-react";
import type { Document } from "@/lib/types";

interface DocumentDetailModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onAddAnnotation: (documentId: string, annotationText: string) => void;
  onEditAnnotation: (documentId: string, annotationId: string, newText: string) => void;
}

export function DocumentDetailModal({ document, isOpen, onClose, onAddAnnotation, onEditAnnotation }: DocumentDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">File Type</h3>
              <p className="mt-1 text-sm text-white-900">{document.fileType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Upload Date</h3>
              <p className="mt-1 text-sm text-white-900">
                {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {document.extractedInfo && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Extracted Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                  {JSON.stringify(document.extractedInfo, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {document.annotations && document.annotations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Annotations</h3>
              <div className="space-y-2">
                {document.annotations.map((annotation, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{annotation.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By {annotation.user.name} on {new Date(annotation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/api/documents/${document.id}`, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
