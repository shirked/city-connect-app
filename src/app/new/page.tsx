import { NewReportForm } from "@/components/reports/new-report-form";

export default function NewReportPage() {
  return (
    <div className="container max-w-2xl py-8 md:py-12">
        <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Submit a New Report</h1>
            <p className="text-muted-foreground">Help us by reporting an issue in your community.</p>
        </div>
        <NewReportForm />
    </div>
  );
}
