
"use client";

import { useReports } from "@/hooks/use-reports";
import { AlertTriangle, CheckCircle, Loader2, Wrench } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Report } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

const ReportsMap = dynamic(() => import('@/components/reports/reports-map').then(mod => mod.ReportsMap), {
  loading: () => <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false,
});

export default function HomePage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [isReportsLoading, setIsReportsLoading] = useState(true);
  
    useEffect(() => {
      // This effect used to redirect to /login, it's no longer needed.
      // We will now fetch reports directly as the user is mocked.
      if(user) {
        setIsReportsLoading(true);
        const q = query(
          collection(db, 'reports'),
          orderBy('createdAt', 'desc')
        );
    
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const reportsData: Report[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            reportsData.push({ 
                id: doc.id, 
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                history: data.history.map((h: any) => ({
                    ...h,
                    date: (h.date as Timestamp).toDate().toISOString(),
                }))
            } as Report);
          });
          setAllReports(reportsData);
          setIsReportsLoading(false);
        }, (error) => {
          console.error("Error fetching all reports: ", error);
          setIsReportsLoading(false);
        });
    
        return () => unsubscribe();
      }
    }, [user]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline text-primary">सर्वे भवन्तु सुखिनः</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              "May all be prosperous and happy, may all be free from illness, may all see what is spiritually uplifting, may no one suffer."
            </p>
        </div>

        <div className="flex justify-center gap-12 my-8">
          <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <p className="font-semibold text-muted-foreground">Report</p>
          </div>
          <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chart-4/20">
                  <Wrench className="h-8 w-8 text-chart-4" />
              </div>
              <p className="font-semibold text-muted-foreground">Track</p>
          </div>
          <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <p className="font-semibold text-muted-foreground">Resolve</p>
          </div>
        </div>

        <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Community Issue Map
            </h2>
            <p className="text-muted-foreground">
              A live map of all reported issues in the community.
            </p>
        </div>

        <div className="relative w-full aspect-video rounded-lg bg-muted border overflow-hidden">
          {isReportsLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReportsMap reports={allReports} />
          )}
        </div>
      </div>
    </main>
  );
}
