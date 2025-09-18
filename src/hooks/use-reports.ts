
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Report } from '@/lib/types';
import { useAuth } from './use-auth';
import { suggestIcon } from '@/ai/flows/suggest-icon-flow';
import { db, uploadDataUrl } from '@/lib/firebase';
import { collection, addDoc, query, onSnapshot, orderBy, Timestamp, doc, updateDoc, where } from 'firebase/firestore';

export const useReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setReports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Query reports for the current user
    const q = query(
      collection(db, 'reports'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: Report[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const report = { 
            id: doc.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            history: data.history.map((h: any) => ({
                ...h,
                date: (h.date as Timestamp).toDate().toISOString(),
            }))
        } as Report;
        reportsData.push(report);
      });
      setReports(reportsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reports: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const addReport = useCallback(async (newReportData: {
      description: string;
      location: { lat: number; lng: number };
      photoDataUrl: string;
      photoHint: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // 1. Get icon suggestion
      const { iconName } = await suggestIcon({ description: newReportData.description });
      
      // 2. Upload image to Cloud Storage
      const imagePath = `reports/${user.id}/${Date.now()}.jpg`;
      const photoUrl = await uploadDataUrl(imagePath, newReportData.photoDataUrl);

      // 3. Create report document in Firestore
      const now = Timestamp.now();
      const reportForDb = {
        userId: user.id,
        description: newReportData.description,
        location: newReportData.location,
        createdAt: now,
        status: 'Submitted',
        iconName: iconName || 'HelpCircle',
        history: [{ status: 'Submitted', date: now, notes: 'Report submitted by user.' }],
        photoHint: newReportData.photoHint,
        photoUrl: photoUrl, // Use the public URL from Cloud Storage
      };

      await addDoc(collection(db, 'reports'), reportForDb);

  }, [user]);

  const updateReport = useCallback(async (reportId: string, updatedData: Partial<Omit<Report, 'id'>>) => {
    if (!user) throw new Error("User not authenticated");
    const reportDocRef = doc(db, 'reports', reportId);
    
    const dataForFirestore: {[key: string]: any} = { ...updatedData };
    if (dataForFirestore.createdAt && typeof dataForFirestore.createdAt === 'string') {
        dataForFirestore.createdAt = Timestamp.fromDate(new Date(dataForFirestore.createdAt));
    }

    if (dataForFirestore.history) {
        dataForFirestore.history = dataForFirestore.history.map((h: any) => ({
            ...h,
            date: Timestamp.fromDate(new Date(h.date))
        }));
    }

    await updateDoc(reportDocRef, dataForFirestore);
  }, [user]);
  
  return { reports, isLoading, addReport, updateReport };
};
