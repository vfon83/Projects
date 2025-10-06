"use client";

import React from 'react';
import type { Document, PlanType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, BrickWall, Wrench, Table, Eye, Trash2, Users, HelpCircle, Tag } from "lucide-react";
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onViewDetails: () => void;
  onDelete: () => void;
}

const getPlanTypeIcon = (planType: PlanType) => {
  switch (planType) {
    case "Construction":
      return <BrickWall className="h-5 w-5 text-primary" />;
    case "MEP":
      return <Wrench className="h-5 w-5 text-primary" />;
    case "Code/Specification":
      return <Table className="h-5 w-5 text-primary" />;
    default:
      return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

export function DocumentCard({ document, onViewDetails, onDelete }: DocumentCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-gray-400" />
          <div>
            <h3 className="font-medium text-white">{document.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {document.classification || "Construction"}
            </p>
            <p className="text-sm text-gray-500">
              {document.fileType}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
