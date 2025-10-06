"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { DocumentUploadForm } from "@/components/DocumentUploadForm"
import type { Document } from "@/lib/types"
import { DocumentCard } from "@/components/DocumentCard"
import { DocumentDetailModal } from "@/components/DocumentDetailModal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Grid, List } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function UploadPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterClassification, setFilterClassification] = useState<string>("All")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleDocumentProcessed = async (doc: Document) => {
    try {
      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: params.id,
          document: doc
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      const data = await response.json();
      setDocuments(prev => [...prev, data.document]);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save document",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  }

  const handleCloseModal = () => {
    setSelectedDocumentId(null)
  }

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    if (selectedDocumentId === documentId) {
      setSelectedDocumentId(null)
    }
    toast({ title: "Document deleted", description: "The document has been removed." })
  }

  const handleAddAnnotation = async (documentId: string, annotationText: string) => {
    const newAnnotation = {
      id: crypto.randomUUID(),
      text: annotationText,
      timestamp: new Date().toISOString(),
      author: "User"
    };

    setDocuments(prevDocs => prevDocs.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          annotations: [...(doc.annotations || []), newAnnotation]
        };
      }
      return doc;
    }));

    toast({
      title: "Success",
      description: "Annotation added successfully",
    });
  };

  const handleEditAnnotation = async (documentId: string, annotationId: string, newText: string) => {
    setDocuments(prevDocs => prevDocs.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          annotations: doc.annotations?.map(ann => 
            ann.id === annotationId ? { ...ann, text: newText } : ann
          ) || []
        };
      }
      return doc;
    }));

    toast({
      title: "Success",
      description: "Annotation updated successfully",
    });
  };

  const selectedDocument = useMemo(
    () => documents.find(doc => doc.id === selectedDocumentId) || null,
    [documents, selectedDocumentId]
  )

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClassification = filterClassification === "All" || doc.classification === filterClassification;
      return matchesSearch && matchesClassification;
    });
  }, [documents, searchTerm, filterClassification]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <DocumentUploadForm
          onDocumentProcessed={handleDocumentProcessed}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />

        <section className="p-6 bg-card shadow-lg rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Manage Recent Uploads</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <Input
                type="search"
                placeholder="Search documents by name or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Select value={filterClassification} onValueChange={setFilterClassification}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="MEP">MEP</SelectItem>
                <SelectItem value="Code/Specification">Code/Specification</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                <Grid className="h-5 w-5"/>
                <span className="sr-only">Grid View</span>
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-5 w-5"/>
                <span className="sr-only">List View</span>
              </Button>
            </div>
          </div>

          {isProcessing && documents.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Processing initial document...</p>
          )}

          {!isProcessing && documents.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No documents uploaded yet. Use the form above to get started.</p>
          )}

          {filteredDocuments.length === 0 && documents.length > 0 && (
            <p className="text-center text-muted-foreground py-8">No documents match your current search or filter criteria.</p>
          )}
          
          {viewMode === 'grid' ? (
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
                <Card key={doc.id} className="p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-semibold text-primary">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.classification}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(doc.id)}>Details</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteDocument(doc.id)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          isOpen={!!selectedDocumentId}
          onClose={handleCloseModal}
          onAddAnnotation={handleAddAnnotation}
          onEditAnnotation={handleEditAnnotation}
        />
      )}
    </div>
  )
}