
import { doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const CONVERSATIONS_COLLECTION = 'whatsapp_conversations';

export interface ConversationState {
  step: 'START' | 'AWAITING_PHOTO' | 'AWAITING_DESCRIPTION' | 'AWAITING_LOCATION' | 'COMPLETED';
  photoUrl?: string;
  description?: string;
  location?: { lat: number; lng: number };
  updatedAt?: Timestamp;
}

/**
 * Retrieves the current conversation state for a given user (phone number).
 * If no state exists, it returns the initial 'START' state.
 * @param from The user's phone number (e.g., 'whatsapp:+1...').
 * @returns The user's current conversation state.
 */
export async function getConversationState(from: string): Promise<ConversationState> {
  const docRef = doc(db, CONVERSATIONS_COLLECTION, from);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // Check if the state is too old (e.g., > 15 minutes) and reset if so
    const data = docSnap.data() as ConversationState;
    const fifteenMinutesAgo = Timestamp.now().toMillis() - 15 * 60 * 1000;
    if (data.updatedAt && data.updatedAt.toMillis() < fifteenMinutesAgo) {
        await deleteConversationState(from);
        return { step: 'START' };
    }
    return data;
  } else {
    return { step: 'START' };
  }
}

/**
 * Creates or updates the conversation state for a given user.
 * @param from The user's phone number.
 * @param state The new state to save.
 */
export async function updateConversationState(from: string, state: ConversationState): Promise<void> {
  const docRef = doc(db, CONVERSATIONS_COLLECTION, from);
  const stateWithTimestamp = {
    ...state,
    updatedAt: Timestamp.now(),
  };
  await setDoc(docRef, stateWithTimestamp, { merge: true });
}

/**
 * Deletes the conversation state for a given user.
 * This is called when a conversation is completed or cancelled.
 * @param from The user's phone number.
 */
export async function deleteConversationState(from: string): Promise<void> {
  const docRef = doc(db, CONVERSATIONS_COLLECTION, from);
  await deleteDoc(docRef);
}
