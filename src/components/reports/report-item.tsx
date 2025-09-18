"use client";

import type { Report } from "@/lib/types";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { formatDate } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { ReportDialog } from "./report-dialog";

interface ReportItemProps {
  report: Report;
}

export function ReportItem({ report }: ReportItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card
        onClick={() => setIsDialogOpen(true)}
        className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      >
        <CardHeader className="p-0">
          <div className="aspect-video relative">
            <Image
              src={report.photoUrl}
              alt={report.description}
              fill
              className="object-cover"
              data-ai-hint={report.photoHint}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <StatusBadge status={report.status} />
          <p className="mt-3 text-sm font-semibold leading-tight line-clamp-2">
            {report.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
          <span>{formatDate(report.createdAt)}</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>
              {report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}
            </span>
          </div>
        </CardFooter>
      </Card>
      {isDialogOpen && (
        <ReportDialog
          report={report}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}
