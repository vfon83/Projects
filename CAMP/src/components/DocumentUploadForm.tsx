"use client";

import type { ChangeEvent } from "react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { classifyConstructionDocument, type ClassifyConstructionDocumentInput, type ClassifyConstructionDocumentOutput } from "@/ai/flows/classify-document";
import { extractInformation, type ExtractInformationInput, type ExtractInformationOutput } from "@/ai/flows/extract-information";
import type { Document, PlanType, ExtractedInformation } from "@/lib/types";
import { Loader2, UploadCloud } from "lucide-react";

interface DocumentUploadFormProps {
  onDocumentProcessed: (document: Document) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function DocumentUploadForm({ onDocumentProcessed, isProcessing, setIsProcessing }: DocumentUploadFormProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a document to upload.",
        variant: "destructive",
      });
      return;
    }

    // Check for supported file types
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!supportedTypes.includes(selectedFile.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF or image file (JPEG, PNG, GIF). DOCX files are not supported.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const dataUri = await fileToDataUri(selectedFile);

      toast({ title: "Processing document...", description: "Classifying document type." });
      const classificationInput: ClassifyConstructionDocumentInput = { documentDataUri: dataUri };
      const classificationResult: ClassifyConstructionDocumentOutput = await classifyConstructionDocument(classificationInput);
      const planType = classificationResult.category as PlanType;

      toast({ title: "Extracting information...", description: `Document classified as ${planType}.` });
      const extractionInput: ExtractInformationInput = { planDataUri: dataUri, planType };
      const extractionResult: ExtractInformationOutput = await extractInformation(extractionInput);

      const newDocument: Document = {
        id: crypto.randomUUID(),
        name: selectedFile.name,
        fileType: selectedFile.type,
        dataUri,
        classification: planType,
        extractedInfo: extractionResult as ExtractedInformation,
        annotations: [],
        size: selectedFile.size,
        status: "pending",
        reviewers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "",
        projectId: ""
      };

      onDocumentProcessed(newDocument);
      toast({
        title: "Document processed successfully!",
        description: `${selectedFile.name} has been classified and information extracted.`,
      });
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error("Error processing document:", error);
      let errorMessage = "An unknown error occurred.";
      
      if (error instanceof Error) {
        if (error.message.includes("mimeType parameter")) {
          errorMessage = "This file type is not supported. Please upload a PDF or image file (JPEG, PNG, GIF).";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error processing document",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-card shadow-lg rounded-lg border border-border">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Upload Construction Document</h2>
      <div className="space-y-4">
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="file:text-primary file:font-semibold file:bg-primary-foreground hover:file:bg-accent/10"
          disabled={isProcessing}
        />
        <Button type="submit" className="w-full" disabled={!selectedFile || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload and Process
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
