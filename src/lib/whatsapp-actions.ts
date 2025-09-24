
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { suggestIcon } from '@/ai/flows/suggest-icon-flow';

interface ReportData {
    description: string;
    photoUrl: string;
    location?: { lat: number; lng: number };
    reporterPhone: string;
}

// This user ID is a placeholder for reports coming from an unauthenticated source like WhatsApp.
// In a real application, you might create a generic 'WhatsApp User' in your users collection.
const WHATSAPP_USER_ID = 'whatsapp-user'; 

/**
 * Creates a new report in Firestore from a WhatsApp message.
 * This function is intended to be called from a server-side flow.
 */
export async function addReportFromWhatsapp(reportData: ReportData) {
    // 1. Get icon suggestion from the description
    const { iconName } = await suggestIcon({ description: reportData.description });

    // 2. Prepare the report document for Firestore
    const now = Timestamp.now();
    
    // Fallback location if none is provided via WhatsApp location sharing
    const location = reportData.location || {
        lat: 23.61, // Default latitude (e.g., city center)
        lng: 85.27, // Default longitude
    };

    const reportForDb = {
        userId: WHATSAPP_USER_ID,
        description: reportData.description,
        location: location,
        createdAt: now,
        status: 'Submitted',
        iconName: iconName || 'HelpCircle',
        history: [{ status: 'Submitted', date: now, notes: `Report submitted via WhatsApp by ${reportData.reporterPhone}.` }],
        photoHint: 'whatsapp upload', // A hint for the source
        photoUrl: reportData.photoUrl, // Using the direct URL from Twilio
    };

    // 3. Add the document to Firestore
    const docRef = await addDoc(collection(db, 'reports'), reportForDb);
    
    // Return the new report's ID
    return docRef.id;
}
