"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Tag } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { use } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";


interface Document {
  id: string;
  name: string;
  description: string;
  uploadDate: string;
  fileType: string;
  dataUri: string;
  classification: string;
  extractedInfo: {
    equipmentSpecifications?: string;
    materialSchedules?: string;
    spatialDimensions?: string;
  };
  project: {
    id: string;
    name: string;
  };
  uploadedBy: {
    id: string;
    name: string;
  };
}

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/signin");
        return;
      }
    };

    checkSession();
  }, [router, supabase]);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`/api/documents/${id}/metadata`);
        
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }

        const data = await response.json();
        setDocument(data);
      } catch (error) {
        console.error("Error fetching document:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch document",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [router, toast, id, supabase]);

  const handleDownload = () => {
    if (!document) return;

    try {
      // Create an invisible anchor element
      const link = window.document.createElement('a');
      link.href = document.dataUri;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Document not found</h2>
          <p className="mt-2 text-gray-600">The document you're looking for doesn't exist</p>
          <Button
            className="mt-4"
            onClick={() => router.push('/documents')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/documents')}
          className="hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
        <Button 
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 transition-colors"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Document
        </Button>
      </div>

      <Card className="shadow-lg bg-green-950">
        <CardHeader className="border-b border-green-900 bg-green-900/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white">{document.name}</CardTitle>
            <Badge variant="outline" className="text-sm bg-green-900 text-white border-green-800 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {document.classification}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Project Information</h3>
                <div className="pl-4 space-y-2">
                  <p className="text-sm text-gray-200">
                    <span className="font-medium text-white">Project:</span> {document.project?.name || "Unassigned"}
                  </p>
                  <p className="text-sm text-gray-200">
                    <span className="font-medium text-white">Uploaded by:</span> {document.uploadedBy?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-200">
                    <span className="font-medium text-white">Upload Date:</span> {new Date(document.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator className="bg-green-900" />

              {document.extractedInfo && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Extracted Information</h3>
                  <div className="pl-4 space-y-4">
                    {document.extractedInfo.equipmentSpecifications && (
                      <div>
                        <h4 className="text-sm font-medium text-white mb-1">Equipment Specifications</h4>
                        <p className="text-sm text-gray-200 bg-green-900 p-3 rounded-md">
                          {document.extractedInfo.equipmentSpecifications}
                        </p>
                      </div>
                    )}
                    {document.extractedInfo.materialSchedules && (
                      <div>
                        <h4 className="text-sm font-medium text-white mb-1">Material Schedules</h4>
                        <p className="text-sm text-gray-200 bg-green-900 p-3 rounded-md">
                          {document.extractedInfo.materialSchedules}
                        </p>
                      </div>
                    )}
                    {document.extractedInfo.spatialDimensions && (
                      <div>
                        <h4 className="text-sm font-medium text-white mb-1">Spatial Dimensions</h4>
                        <p className="text-sm text-gray-200 bg-green-900 p-3 rounded-md">
                          {document.extractedInfo.spatialDimensions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Document Preview</h3>
              {document.dataUri && (
                <div className="border border-green-900 rounded-lg overflow-hidden shadow-sm bg-green-900">
                  {document.fileType.startsWith('image/') ? (
                    <img
                      src={document.dataUri}
                      alt={document.name}
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <iframe
                      src={document.dataUri}
                      className="w-full h-[600px]"
                      title={document.name}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}