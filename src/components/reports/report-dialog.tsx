"use client";

import type { Report } from "@/lib/types";
import Image from "next/image";
import { StatusBadge } from "./status-badge";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MapPin, RefreshCw } from "lucide-react";
import { useReports } from "@/hooks/use-reports";
import { issueStatusUpdate } from "@/ai/flows/issue-status-update";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface ReportDialogProps {
  report: Report;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ report, open, onOpenChange }: ReportDialogProps) {
  const { updateReport } = useReports();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const mockEmail = {
        subject: `Update on your report: ${report.description.substring(0, 30)}...`,
        body: `Dear Citizen, we are writing to inform you that the issue you reported about "${report.description}" has been reviewed. A team has been dispatched and the issue is now being actively worked on. Thank you for your contribution to our community.`,
      };

      const result = await issueStatusUpdate({
        emailSubject: mockEmail.subject,
        emailBody: mockEmail.body,
        issueDescription: report.description,
        currentStatus: report.status,
        updateHistory: report.history.map(h => `${formatDate(h.date)}: ${h.status} - ${h.notes}`).join('\n'),
      });

      const newStatus = result.updatedStatus as Report['status'];
      if (newStatus !== report.status) {
        const newHistoryEntry = {
          status: newStatus,
          date: new Date().toISOString(),
          notes: `Status updated to "${newStatus}" by AI based on a simulated email update.`,
        };
        await updateReport(report.id, {
          status: newStatus,
          history: [...report.history, newHistoryEntry],
        });
        toast({
          title: "Status Updated!",
          description: `The status for your report has been updated to "${newStatus}".`,
        });
      } else {
        toast({
          title: "No Change in Status",
          description: "The AI determined no status change was necessary at this time.",
        });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not get a status update from the AI service.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full">
            <div className="grid gap-4 p-6">
              <Dialog>
                <DialogTrigger asChild>
                    <div className="aspect-video relative rounded-md overflow-hidden cursor-zoom-in">
                        <Image
                        src={report.photoUrl}
                        alt={report.description}
                        fill
                        className="object-cover"
                        data-ai-hint={report.photoHint}
                        />
                    </div>
                </DialogTrigger>
                <DialogContent className="p-0 border-0 max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="sr-only">Report Image: {report.description}</DialogTitle>
                    </DialogHeader>
                    <Image
                        src={report.photoUrl}
                        alt={report.description}
                        width={1200}
                        height={800}
                        className="object-contain rounded-lg w-full h-full"
                    />
                </DialogContent>
              </Dialog>
                <div>
                    <StatusBadge status={report.status} />
                    <p className="mt-2 text-base">{report.description}</p>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Reported on {formatDate(report.createdAt)} at {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                    </p>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold mb-2">Update History</h4>
                    <div className="space-y-4">
                        {report.history.slice().reverse().map((item, index) => (
                        <div key={index} className="flex gap-3">
                            <div className="flex flex-col items-center">
                            <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                            {index < report.history.length - 1 && <div className="w-px h-full bg-border flex-grow" />}
                            </div>
                            <div>
                            <p className="font-semibold text-sm">{item.status}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                            <p className="text-sm mt-1">{item.notes}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
        <div className="p-6 pt-0">
            <Button onClick={handleStatusUpdate} disabled={isUpdating} className="w-full">
                <RefreshCw className={cn("mr-2 h-4 w-4", isUpdating && "animate-spin")} />
                {isUpdating ? "Checking for updates..." : "Check for AI Status Update"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
