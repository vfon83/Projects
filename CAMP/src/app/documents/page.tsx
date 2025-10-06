"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/Providers";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Tag } from "lucide-react";

interface Document {
  id: string;
  name: string;
  description: string;
  status: string;
  uploadDate: string;
  project: {
    id: string;
    name: string;
  };
  uploadedBy: {
    id: string;
    name: string;
  };
  classification: string;
}

export default function Documents() {
  const { session, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/auth/signin");
      return;
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!session) return;

      try {
        const response = await fetch("/api/documents");
        
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch documents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [session, router, toast]);

  if (sessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">No documents yet</h2>
          <p className="mt-2 text-gray-600">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`/documents/${document.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-900 to-green-950">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{document.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white mb-2">
                    {document.description}
                  </p>
                  <div className="flex justify-between text-sm text-white">
                    <span>Project: {document.project?.name || "Unassigned"}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white mt-2">
                    <span>Uploaded by: {document.uploadedBy?.name || "Unknown"}</span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {document.classification}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-white mt-2">
                    <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 