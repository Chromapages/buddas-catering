import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { db } from "../config";

export interface Invitation {
  id?: string;
  email: string;
  role: "owner" | "ops" | "rep" | "marketing";
  invitedBy: string;
  status: "pending" | "accepted";
  createdAt: any;
}

export const createInvitation = async (email: string, role: string, invitedByUid: string) => {
  // Check if already invited
  const q = query(
    collection(db, "invitations"), 
    where("email", "==", email),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    throw new Error("User already has a pending invitation");
  }

  return await addDoc(collection(db, "invitations"), {
    email,
    role,
    invitedBy: invitedByUid,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const getPendingInvitations = async () => {
  const q = query(collection(db, "invitations"), where("status", "==", "pending"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation));
};
