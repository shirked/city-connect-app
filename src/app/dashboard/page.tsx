"use client";

import { ReportList } from "@/components/reports/report-list";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/use-reports";
import { Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();
  const { reports, isLoading } = useReports();

  const userReports = reports.filter(report => report.userId === user?.id);

  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">My Reports</h1>
            <p className="text-muted-foreground">Here are the issues you've reported.</p>
        </div>
        <Button asChild className="hidden md:flex">
            <Link href="/new"><PlusCircle className="mr-2 h-4 w-4" /> New Report</Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ReportList reports={userReports} />
      )}
    </div>
  );
}
