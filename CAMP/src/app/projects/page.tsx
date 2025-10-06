"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  teamLead: {
    id: string;
    name: string;
  };
  _count: {
    documents: number;
  };
  startDate: string;
  endDate: string;
  status: string;
}

export default function Projects() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/signin');
    } else if (session) {
      fetchProjects();
    }
  }, [session, isLoading, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <Button onClick={() => router.push('/projects/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">No projects yet</h2>
          <p className="mt-2 text-gray-600">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
                    <span>Team Lead: {project.teamLead?.name || "Unassigned"}</span>
                    <span>{project._count?.documents || 0} documents</span>
                  </div>
                  <div className="flex justify-between text-sm text-white mt-2">
                    <span>Status: {project.status || 'pending'}</span>
                    <span>{new Date(project.startDate).toLocaleDateString()}</span>
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