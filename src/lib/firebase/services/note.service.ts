import { db } from "../config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { logActivity } from "./base";

export interface Note {
  id?: string;
  entityType: "LEAD" | "COMPANY" | "CONTACT" | "REQUEST";
  entityId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt?: any;
}

/**
 * Creates a persistent note for a CRM entity.
 */
export async function createNote(noteData: Note) {
  try {
    const notesRef = collection(db, "notes");
    const docRef = await addDoc(notesRef, {
      ...noteData,
      createdAt: serverTimestamp()
    });

    await logActivity(
      noteData.entityType,
      noteData.entityId,
      "NOTE_ADDED",
      { noteId: docRef.id, excerpt: noteData.content.substring(0, 50) },
      noteData.authorId,
      noteData.authorName,
      "MANUAL_NOTE"
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
}

/**
 * Fetches all notes for a specific entity.
 */
export async function getNotesByEntity(
  entityType: Note["entityType"], 
  entityId: string
): Promise<Note[]> {
  try {
    const notesRef = collection(db, "notes");
    const q = query(
      notesRef, 
      where("entityType", "==", entityType), 
      where("entityId", "==", entityId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
}

/**
 * Fetches recent note-taking activity by reps over the last X days.
 */
export async function getRecentRepActivity(days: number = 7) {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);
    
    const repsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "rep")));
    const repNames: Record<string, string> = {};
    const stats: Record<string, number> = {};
    
    repsSnap.forEach(doc => {
      repNames[doc.id] = doc.data().displayName || doc.data().email || doc.id;
      stats[doc.id] = 0;
    });

    const notesRef = collection(db, "notes");
    const q = query(notesRef, where("createdAt", ">=", thresholdDate));
    const snap = await getDocs(q);
    
    snap.forEach(doc => {
      const data = doc.data();
      if (data.authorId && stats[data.authorId] !== undefined) {
        stats[data.authorId]++;
      } else if (data.authorId) {
        stats[data.authorId] = 1;
        repNames[data.authorId] = data.authorName || data.authorId;
      }
    });

    return Object.entries(stats).map(([id, count]) => ({
      name: repNames[id] || "Unknown Rep",
      count
    })).sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching recent rep activity:", error);
    return [];
  }
}
