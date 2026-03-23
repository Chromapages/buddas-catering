import { db, auth } from '../src/lib/firebase/admin';

async function seedData() {
  console.log('Seeding initial data...');

  try {
    // 1. Create a dummy test lead to test Firestore setup
    const leadRef = db.collection('leads').doc('test-lead-001');
    const companyRef = db.collection('companies').doc('test-company-001');
    const contactRef = db.collection('contacts').doc('test-contact-001');
    const requestRef = db.collection('cateringRequests').doc('test-request-001');

    await companyRef.set({
      id: 'test-company-001',
      name: 'Test Corp (SeedData)',
      companyType: 'Office',
      totalEventsCompleted: 0,
      sourceHistory: ['direct'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await contactRef.set({
      id: 'test-contact-001',
      fullName: 'Test User',
      email: 'testuser@example.com',
      companyId: 'test-company-001',
      createdAt: new Date().toISOString()
    });

    await leadRef.set({
      id: 'test-lead-001',
      companyId: 'test-company-001',
      contactId: 'test-contact-001',
      status: 'New',
      source: 'direct',
      medium: 'none',
      isDuplicate: false,
      needsReview: false,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      statusChangedAt: new Date().toISOString()
    });

    await requestRef.set({
      id: 'test-request-001',
      leadId: 'test-lead-001',
      companyId: 'test-company-001',
      contactId: 'test-contact-001',
      eventType: 'Internal Meeting',
      cateringNeed: 'Lunch',
      estimatedGroupSize: 20,
      createdAt: new Date().toISOString()
    });

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Execute if run directly from node
if (require.main === module) {
  // We need the env variables loaded
  require('dotenv').config({ path: '.env.local' });
  
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.log('Skipping seed: No Firebase credentials in .env.local yet.');
    process.exit(0);
  }

  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedData };
