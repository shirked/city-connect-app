import type { Report } from "@/lib/types";
import { ReportItem } from "./report-item";
import Link from "next/link";
import { Button } from "../ui/button";

interface ReportListProps {
  reports: Report[];
}

export function ReportList({ reports }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold">No reports yet</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          Get started by submitting your first civic issue.
        </p>
        <Button asChild>
          <Link href="/new">Create a new report</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-24 md:pb-0">
      {reports.map((report) => (
        <ReportItem key={report.id} report={report} />
      ))}
    </div>
  );
}
