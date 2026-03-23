import * as admin from 'firebase-admin';
import * as fs from 'fs';
import path from 'path';

// Manual .env.local parser
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error("❌ Error: Missing Admin SDK environment variables in .env.local");
  process.exit(1);
}

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = admin.auth();

async function promoteUser(email: string) {
  try {
    console.log(`⏳ Finding user ${email}...`);
    const user = await auth.getUserByEmail(email);

    console.log(`⏳ Setting 'owner' role claim for ${user.uid}...`);
    await auth.setCustomUserClaims(user.uid, { role: 'owner' });

    console.log(`✅ Success! User ${email} is now an owner.`);
    console.log(`👉 Please sign out and sign back in for the changes to take effect.`);
  } catch (error) {
    console.error("❌ Error promoting user:", error);
  }
}

const [,, email] = process.argv;

if (!email) {
  console.log("Usage: npx tsx scripts/promote-user.ts <email>");
  process.exit(1);
}

promoteUser(email);
