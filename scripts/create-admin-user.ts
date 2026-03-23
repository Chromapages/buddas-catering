import * as admin from 'firebase-admin';
import * as fs from 'fs';
import path from 'path';

// Manual .env.local parser to avoid extra dependencies
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

async function createAdminUser(email: string, password: string, name: string) {
  try {
    console.log(`⏳ Creating user ${email}...`);
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });

    console.log(`⏳ Setting 'admin' custom claims for ${userRecord.uid}...`);
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

    console.log(`✅ Success! User ${email} created and promoted to admin.`);
    console.log(`👉 You can now log in at http://localhost:3000/login`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
}

// Usage: npx ts-node scripts/create-admin-user.ts <email> <password> <name>
const [,, email, password, name] = process.argv;

if (!email || !password || !name) {
  console.log("Usage: npx ts-node scripts/create-admin-user.ts <email> <password> <name>");
  process.exit(1);
}

createAdminUser(email, password, name);
