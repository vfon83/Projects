"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "@/components/Providers";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Upload, Search, Grid, List, Tag, PlusCircle, ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import Link from "next/link";
import { DocumentCard } from "@/components/DocumentCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { Document, PlanType } from "@/lib/types";
import { DocumentDetailModal } from "@/components/DocumentDetailModal";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

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

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { session, isLoading } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterClassification, setFilterClassification] = useState<PlanType | "All">("All");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }
      const data = await response.json();
      setProject(data);
      setNotes(data.notes || []);
    } catch (error) {
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
    formData.append('classification', 'Construction'); // Default classification

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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim() || !project) return;

    try {
      const response = await fetch(`/api/projects/${project.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: note }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setNote("");
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editingContent.trim() || !project) return;

    try {
      const response = await fetch(`/api/projects/${project.id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId, content: editingContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      setEditingNoteId(null);
      setEditingContent("");
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${project.id}/notes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(notes.filter(n => n.id !== noteId));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!project) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      await fetchProjectDetails();
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleAddAnnotation = (documentId: string, annotationText: string) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        documents: prevProject.documents.map((doc) => {
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
        }),
      };
    });
    toast({ title: "Annotation added", description: "Your annotation has been saved." });
  };

  const handleEditAnnotation = (documentId: string, annotationId: string, newText: string) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        documents: prevProject.documents.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              annotations: doc.annotations.map((ann) =>
                ann.id === annotationId ? { ...ann, text: newText } : ann
              ),
            };
          }
          return doc;
        }),
      };
    });
    toast({ title: "Annotation updated", description: "Your annotation has been updated." });
  };

  const filteredDocuments = useMemo(() => {
    if (!project) return [];
    
    return project.documents.filter(doc => {
      const matchesSearchTerm = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClassification = filterClassification === "All" || doc.classification === filterClassification;
      return matchesSearchTerm && matchesClassification;
    });
  }, [project, searchTerm, filterClassification]);

  if (isLoading || isLoadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session || !project) {
    return null;
  }

  const isTeamLead = project.teamLead.id === session.user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4 text-white hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
        </div>
        {isTeamLead && (
          <Button
            onClick={() => router.push(`/projects/${project.id}/edit`)}
            className="bg-white text-cyan-700 hover:bg-white/90"
          >
            Edit Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-cyan-700 to-green-600 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Project Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-white/70">Status</dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  project.status === 'Pending' ? 'bg-yellow-500' :
                  project.status === 'In Progress' ? 'bg-blue-600' :
                  'bg-green-500'
                }`}></span>
                <span className="text-white capitalize">{project.status.replace('_', ' ')}</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-white/70">Start Date</dt>
              <dd className="mt-1 text-white">
                {new Date(project.startDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-white/70">End Date</dt>
              <dd className="mt-1 text-white">
                {new Date(project.endDate).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-950 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Team Members</h2>
          <ul className="space-y-4">
            <li className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{project.teamLead.name}</p>
                <p className="text-white/70 text-sm">Team Lead</p>
              </div>
            </li>
            {project.teamMembers.map((member) => (
              <li key={member.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-white/70 text-sm">Team Member</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-950 p-6 sm:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Documents</h3>
              <Link href={`/projects/${project.id}/upload`}>
                <Button className="bg-white text-cyan-700 hover:bg-white/90">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-grow w-full md:w-auto">
                <Input
                  type="search"
                  placeholder="Search documents by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              </div>
              <Select 
                value={filterClassification} 
                onValueChange={(value) => {
                  setFilterClassification(value as PlanType | "All");
                }}
              >
                <SelectTrigger className="w-full md:w-[200px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white/10 border-white/20 text-white">
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="MEP">MEP</SelectItem>
                  <SelectItem value="Code/Specification">Code/Specification</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'text-white bg-white/10' : 'text-white/50'}
                >
                  <Grid className="h-5 w-5"/>
                  <span className="sr-only">Grid View</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'text-white bg-white/10' : 'text-white/50'}
                >
                  <List className="h-5 w-5"/>
                  <span className="sr-only">List View</span>
                </Button>
              </div>
            </div>

            {project.documents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/50">No documents created for this project yet</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <p className="text-center text-white/50 py-8">No documents match your current search or filter criteria.</p>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onViewDetails={() => handleViewDetails(doc.id)}
                    onDelete={() => handleDeleteDocument(doc.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="p-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <h3 className="font-semibold text-white">{doc.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-white/50" />
                        <span className="text-sm text-white/50">
                          {doc.classification || "Construction"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(doc.id)}
                        className="text-white hover:text-gray-200"
                      >
                        Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-950 p-6 sm:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                onClick={handleAddNote}
                disabled={!note.trim()}
                className="bg-white text-cyan-700 hover:bg-white/90"
              >
                Add Note
              </Button>
            </div>
            <ul className="space-y-4">
              {notes.map((note) => (
                <li key={note.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{note.user.name}</p>
                    <p className="text-white/50 text-sm">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full bg-white/10 border-white/20 text-white"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={cancelEditing}
                          className="text-white hover:text-gray-200"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleEditNote(note.id)}
                          disabled={!editingContent.trim()}
                          className="bg-white text-cyan-700 hover:bg-white/90"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-white">{note.content}</p>
                      {note.user.id === session.user.id && (
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-white hover:text-gray-200"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white/10 border-white/20 text-white">
                              <DropdownMenuItem 
                                onClick={() => startEditing(note)}
                                className="hover:bg-white/20"
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 hover:text-red-300 hover:bg-white/20"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {selectedDocumentId && (
        <DocumentDetailModal
          document={project?.documents.find((doc) => doc.id === selectedDocumentId)!}
          onClose={() => setSelectedDocumentId(null)}
          onAddAnnotation={handleAddAnnotation}
          onEditAnnotation={handleEditAnnotation}
          isOpen={true}
        />
      )}
    </div>
  );
} 