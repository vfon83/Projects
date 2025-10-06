"use client";

import React, { useState } from "react";
import { useSession } from "@/components/Providers";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, UploadCloud, Grid, List, ArrowLeft } from "lucide-react";
import type { Document, PlanType, ExtractedInformation } from "@/lib/types";
import { DocumentCard } from "@/components/DocumentCard";
import { DocumentDetailModal } from "@/components/DocumentDetailModal";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";

// Add JSX namespace declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Add Lucide icon props
declare module "lucide-react" {
  interface LucideProps {
    className?: string;
  }
}

export default function NewProjectPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);



  const handleDocumentProcessed = async (doc: Document) => {
    setDocuments((prevDocs) => [doc, ...prevDocs]);
    toast({
      title: "Document processed",
      description: "Document will be saved when project is created",
    });
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId));
    if (selectedDocumentId === documentId) {
      setSelectedDocumentId(null);
    }
    toast({ title: "Document deleted", description: "The document has been removed." });
  };

  const handleViewDetails = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleCloseModal = () => {
    setSelectedDocumentId(null);
  };

  const handleAddAnnotation = (documentId: string, annotationText: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === documentId) {
          const newAnnotation = {
            id: crypto.randomUUID(),
            text: annotationText,
            timestamp: new Date().toISOString(),
            author: session?.user?.email || "User",
          };
          return { ...doc, annotations: [...doc.annotations, newAnnotation] };
        }
        return doc;
      })
    );
    toast({ title: "Annotation added", description: "Your annotation has been saved." });
  };

  const handleEditAnnotation = (documentId: string, annotationId: string, newText: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === documentId) {
          return {
            ...doc,
            annotations: doc.annotations.map((ann) =>
              ann.id === annotationId ? { ...ann, text: newText } : ann
            ),
          };
        }
        return doc;
      })
    );
    toast({ title: "Annotation updated", description: "Your annotation has been updated." });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }

    const projectData = {
      name,
      description,
      startDate,
      endDate,
      status,
      teamLeadId: session.user.id,
      teamMembers: selectedTeamMembers,
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Failed to create project';
        throw new Error(errorMessage);
      }

      // If we have documents, save them to the database
      if (documents.length > 0) {
        for (const doc of documents) {
          const docResponse = await fetch('/api/projects/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              projectId: data.id,
              document: doc
            }),
          });

          if (!docResponse.ok) {
            toast({
              title: "Error",
              description: `Failed to save document: ${doc.name}`,
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Success",
        description: "Project created successfully",
      });
      router.push('/projects');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId) || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-8 text-white hover:text-gray-200 border-white/20"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>
      <h1 className="text-3xl font-bold text-green-600 mb-8">Create New Project</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-cyan-700 to-green-600 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Project Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                  placeholder="Enter project description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-white mb-2">
                    Start Date
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-white mb-2">
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-md bg-white/10 border-white/20 text-white p-2 appearance-none cursor-pointer"
                    required
                  >
                    <option value="pending" className="text-black">Pending</option>
                    <option value="in_progress" className="text-black">In Progress</option>
                    <option value="completed" className="text-black">Completed</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    status === 'pending' ? 'bg-yellow-500' :
                    status === 'in_progress' ? 'bg-blue-600' :
                    'bg-green-500'
                  }`}></span>
                  <span className="text-sm text-white/70">
                    {status === 'pending' ? 'Project is pending' :
                     status === 'in_progress' ? 'Project is in progress' :
                     'Project is completed'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-cyan-700 hover:bg-white/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Project...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-950 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Project Documents</h2>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'text-white bg-white/10' : 'text-white/50'}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'text-white bg-white/10' : 'text-white/50'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DocumentUploadForm
              onDocumentProcessed={handleDocumentProcessed}
              isProcessing={false}
              setIsProcessing={() => {}}
            />

            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onViewDetails={() => handleViewDetails(doc.id)}
                  onDelete={() => handleDeleteDocument(doc.id)}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {selectedDocumentId && (
        <DocumentDetailModal
          document={documents.find((doc) => doc.id === selectedDocumentId)!}
          onClose={handleCloseModal}
          onAddAnnotation={handleAddAnnotation}
          onEditAnnotation={handleEditAnnotation}
          isOpen={true}
        />
      )}
    </div>
  );
}