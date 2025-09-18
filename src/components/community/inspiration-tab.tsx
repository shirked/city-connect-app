
"use client";

import { useEffect, useState } from "react";
import { useReports } from "@/hooks/use-reports";
import { generateInspirationQuote } from "@/ai/flows/inspiration-quote-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sprout } from "lucide-react";

export function InspirationTab() {
  const { reports, isLoading: areReportsLoading } = useReports();
  const [quote, setQuote] = useState("");
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);

  useEffect(() => {
    if (!areReportsLoading && reports.length > 0) {
      setIsQuoteLoading(true);
      const descriptions = reports.map((r) => r.description).slice(0, 10); // Use latest 10 reports

      generateInspirationQuote({ reportDescriptions: descriptions })
        .then((result) => {
          setQuote(result.quote);
        })
        .catch((error) => {
          console.error("Failed to generate quote:", error);
          setQuote(
            "The environment is where we all meet; where we all have a mutual interest; it is the one thing all of us share. - Lady Bird Johnson"
          );
        })
        .finally(() => {
          setIsQuoteLoading(false);
        });
    } else if (!areReportsLoading && reports.length === 0) {
        setQuote("Be the change that you wish to see in the world. - Mahatma Gandhi");
        setIsQuoteLoading(false);
    }
  }, [reports, areReportsLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Inspiration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-accent/5">
            {isQuoteLoading ? (
                 <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    <p>Generating a unique quote for your community...</p>
                </div>
            ) : (
                <>
                    <Sprout className="h-12 w-12 text-accent mb-4" />
                    <blockquote className="text-xl font-semibold italic text-accent">
                       "{quote}"
                    </blockquote>
                </>
            )}
        </div>
        <p className="text-muted-foreground mt-4">
            This section will showcase successful community projects and ideas to inspire environmental action. (Coming soon)
        </p>
      </CardContent>
    </Card>
  );
}
