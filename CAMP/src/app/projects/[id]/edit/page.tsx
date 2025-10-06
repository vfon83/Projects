"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/components/Providers";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, UploadCloud, ArrowLeft, MoreVertical, Grid, List, Search } from "lucide-react";
import type { Document, PlanType } from "@/lib/types";
import { DocumentCard } from "@/components/DocumentCard";
import { DocumentDetailModal } from "@/components/DocumentDetailModal";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  teamLead: {
    id: string;
    name: string;
  };
  teamMembers: {
    id: string;
    name: string;
  }[];
  documents: Document[];
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { session, isLoading } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassification, setFilterClassification] = useState<PlanType | "All">("All");
  const [startDateValue, setStartDateValue] = useState(project?.startDate?.split('T')[0] || '');

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }
      const data = await response.json();
      setProject(data);
      setStartDateValue(data.startDate?.split('T')[0] || '');
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch project details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProject(false);
    }
  };

  useEffect(() => {
    if (resolvedParams.id) {
      fetchProjectDetails();
    }
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !project) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const projectData = {
      name: formData.get('name'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      status: formData.get('status'),
    };

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !project) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('projectId', project.id);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      await fetchProjectDetails();
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setProject(prev => ({
        ...prev!,
        documents: prev!.documents.filter(doc => doc.id !== documentId)
      }));

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleAddAnnotation = async (documentId: string, annotation: string) => {
    try {
      if (!project) return;
      
      const updatedProject = {
        ...project,
        documents: project.documents.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              annotations: [
                ...doc.annotations,
                {
                  id: crypto.randomUUID(),
                  text: annotation,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]
            };
          }
          return doc;
        })
      };

      setProject(updatedProject);
      toast({
        title: "Success",
        description: "Annotation added successfully",
      });
    } catch (error) {
      console.error('Error adding annotation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add annotation",
        variant: "destructive",
      });
    }
  };

  const handleEditAnnotation = async (documentId: string, annotationId: string, newText: string) => {
    try {
      if (!project) return;

      const updatedProject = {
        ...project,
        documents: project.documents.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              annotations: doc.annotations.map(annotation => {
                if (annotation.id === annotationId) {
                  return {
                    ...annotation,
                    text: newText,
                    updatedAt: new Date().toISOString()
                  };
                }
                return annotation;
              })
            };
          }
          return doc;
        })
      };

      setProject(updatedProject);
      toast({
        title: "Success",
        description: "Annotation updated successfully",
      });
    } catch (error) {
      console.error('Error updating annotation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update annotation",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleCloseModal = () => {
    setSelectedDocumentId(null);
  };

  if (isLoading || isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || !project) {
    return null;
  }

  const isTeamLead = project.teamLead.id === session.user.id;
  if (!isTeamLead) {
    router.push(`/projects/${project.id}`);
    return null;
  }

  const selectedDocument = project.documents.find((doc) => doc.id === selectedDocumentId) || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4 text-white hover:text-gray-200 focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">{project?.name}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:text-gray-200 focus:outline-none">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/projects/${project?.id}`)}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-cyan-700 to-green-600 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Project Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={project?.name}
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
                    name="description"
                    defaultValue={project?.description}
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
                      name="startDate"
                      type="date"
                      defaultValue={project?.startDate?.split('T')[0]}
                      onChange={(e) => setStartDateValue(e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className="bg-white/10 border-white/20 text-white cursor-pointer"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-white mb-2">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      defaultValue={project?.endDate?.split('T')[0]}
                      min={startDateValue}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className="bg-white/10 border-white/20 text-white cursor-pointer"
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
                      name="status"
                      defaultValue={project?.status}
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
                      project?.status === 'pending' ? 'bg-yellow-500' :
                      project?.status === 'in_progress' ? 'bg-blue-600' :
                      'bg-green-500'
                    }`}></span>
                    <span className="text-sm text-white/70">
                      {project?.status === 'pending' ? 'Project is pending' :
                       project?.status === 'in_progress' ? 'Project is in progress' :
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
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-br from-green-900 to-green-950 p-6 h-full">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Team Members</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {project?.teamLead.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{project?.teamLead.name}</p>
                    <p className="text-white/50 text-sm">Team Lead</p>
                  </div>
                </div>

                {project?.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-white/50 text-sm">Team Member</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>



      {selectedDocumentId && (
        <DocumentDetailModal
          document={project?.documents.find((doc) => doc.id === selectedDocumentId)!}
          onClose={handleCloseModal}
          onAddAnnotation={handleAddAnnotation}
          onEditAnnotation={handleEditAnnotation}
          isOpen={true}
        />
      )}
    </div>
  );
} 