"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/components/Providers";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Folder, FileText, Users, Tag } from "lucide-react";
import Link from "next/link";
import { Project, Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { session, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace('/auth/signin');
      return;
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      try {
        // Fetch projects and documents in parallel
        const [projectsResponse, documentsResponse] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/documents")
        ]);
        
        if (projectsResponse.status === 401 || documentsResponse.status === 401) {
          router.replace('/auth/signin');
          return;
        }

        if (!projectsResponse.ok || !documentsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [projectsData, documentsData] = await Promise.all([
          projectsResponse.json(),
          documentsResponse.json()
        ]);

        setProjects(projectsData);
        setDocuments(documentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const userProjects = projects.filter(
    (project) =>
      project.teamLeadId === session.user.id ||
      project.teamMembers?.some((member) => member.id === session.user.id)
  );

  const totalProjects = projects.length;
  const pendingDocuments = documents.filter((doc) => doc.status === "pending").length;
  const teamMembers = new Set(
    projects.flatMap((project) => [
      project.teamLeadId,
      ...(project.teamMembers?.map((member) => member.id) || []),
    ])
  ).size;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.user_metadata?.name || session.user.email}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-900 to-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Projects</CardTitle>
            <Folder className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingDocuments}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Team Members</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{teamMembers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
          <Link href="/projects/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-cyan-700 to-green-600">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white mb-2">
                    {project.description}
                  </p>
                  <div className="flex justify-between text-sm text-white">
                    <span>
                      Team Lead: {project.teamLead?.name || "Unassigned"}
                    </span>
                    <span>{project._count?.documents || 0} documents</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.slice(0, 6).map((document) => (
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
                    <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
