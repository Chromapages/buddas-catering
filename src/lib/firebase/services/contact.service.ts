import { db } from "../config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { Contact } from "@/types/crm";
import { logActivity } from "./base";

export async function createContact(contactData: Partial<Contact>, actorId: string, actorName: string): Promise<string> {
  try {
    const contactsRef = collection(db, "contacts");
    
    // If this is the first contact for the company, make it primary
    const existing = await getContactsByCompany(contactData.companyId!);
    const isPrimary = existing.length === 0;

    const docRef = await addDoc(contactsRef, {
      ...contactData,
      isPrimary: contactData.isPrimary ?? isPrimary,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logActivity(
      "CONTACT",
      docRef.id,
      "STATUS_CHANGE",
      { newValue: "Created", companyId: contactData.companyId },
      actorId,
      actorName,
      "CONTACT_CREATED"
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

export async function getContactsByCompany(companyId: string): Promise<Contact[]> {
  try {
    const contactsRef = collection(db, "contacts");
    const q = query(
      contactsRef, 
      where("companyId", "==", companyId),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

export async function setPrimaryContact(companyId: string, contactId: string, actorId: string, actorName: string) {
  try {
    const batch = writeBatch(db);
    const contacts = await getContactsByCompany(companyId);

    contacts.forEach(contact => {
      const contactRef = doc(db, "contacts", contact.id);
      batch.update(contactRef, {
        isPrimary: contact.id === contactId,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();

    await logActivity(
      "COMPANY",
      companyId,
      "STATUS_CHANGE",
      { contactId, reason: "New primary contact set" },
      actorId,
      actorName,
      "PRIMARY_CONTACT_CHANGED"
    );
  } catch (error) {
    console.error("Error setting primary contact:", error);
    throw error;
  }
}

export async function getContactById(contactId: string): Promise<Contact | null> {
  try {
    const contactRef = doc(db, "contacts", contactId);
    const snap = await getDoc(contactRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Contact;
  } catch (error) {
    console.error("Error fetching contact by ID:", error);
    return null;
  }
}

export async function updateContact(contactId: string, updateData: Partial<Contact>, actorId: string, actorName: string) {
  try {
    const contactRef = doc(db, "contacts", contactId);
    const oldSnap = await getDoc(contactRef);
    const oldData = oldSnap.data();

    await updateDoc(contactRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    await logActivity(
      "CONTACT",
      contactId,
      "NOTE_ADDED", // Use generic note for updates
      { previousValue: oldData, newValue: updateData },
      actorId,
      actorName,
      "CONTACT_UPDATED"
    );
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

export async function getAllContacts(): Promise<Contact[]> {
  try {
    const contactsRef = collection(db, "contacts");
    const q = query(contactsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
  } catch (error) {
    console.error("Error fetching all contacts:", error);
    return [];
  }
}
