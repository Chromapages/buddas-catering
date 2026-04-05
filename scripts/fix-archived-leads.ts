import admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    } as any),
  });
}

const db = admin.firestore();

async function fixArchivedLeads() {
  console.log("Starting lead fix...");
  const leadsRef = db.collection("leads");
  const snapshot = await leadsRef.get();

  if (snapshot.empty) {
    console.log("No leads found.");
    return;
  }

  console.log(`Found ${snapshot.size} total leads.`);
  const batch = db.batch();
  let count = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.archived === undefined || data.archived === null) {
      batch.update(doc.ref, { archived: false });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} leads with archived: false.`);
  } else {
    console.log("No leads needed updating.");
  }
}

fixArchivedLeads().catch(console.error);
