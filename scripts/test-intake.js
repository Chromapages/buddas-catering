/**
 * E2E Test Script for Buddas Catering CRM Intake
 * 
 * Run this from the project root while the Next.js dev server is running.
 * `node scripts/test-intake.js`
 * 
 * Simulates a landing page form submission with UTM attribution,
 * and will duplicate the request to verify duplicate handling logic.
 */

const API_URL = 'http://localhost:3000/api/catering-lead';

const mockPayload = {
  name: "Bruce Wayne",
  email: "bruce@wayne.enterprises",
  phone: "555-0199",
  company: "Wayne Enterprises",
  eventType: "Corporate Lunch",
  cateringNeed: "Full spread for board meeting.",
  estimatedGroupSize: 12,
  preferredDate: "2024-06-01",
  source: "google",
  medium: "cpc",
  campaign: "summer_catering_b2b",
  content: "ad_variation_1",
  referringUrl: "https://google.com?q=corporate+catering+utah",
  landingPageSlug: "/"
};

async function runTest() {
  console.log("🚀 Starting E2E Intake Test...");

  try {
    // 1. First Submission (New Lead)
    console.log(`\n📦 Submitting new lead for ${mockPayload.email}...`);
    const res1 = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockPayload)
    });
    
    const data1 = await res1.json();
    if (res1.ok) {
      console.log("✅ Success! First lead created.");
      console.log("   Lead ID:", data1.leadId);
    } else {
      console.error("❌ Failed to create lead:", data1);
      return; 
    }

    // 2. Second Submission (Duplicate Detection)
    console.log(`\n📦 Submitting duplicate lead for ${mockPayload.email}...`);
    const res2 = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...mockPayload,
        name: "Batman", // Changed name to test update
        cateringNeed: "Need midnight snacks instead."
      })
    });

    const data2 = await res2.json();
    if (res2.ok) {
      console.log("✅ Success! Duplicate lead request processed.");
      console.log("   Lead ID:", data2.leadId);
      console.log("   Note: You should see 'isDuplicate: true' flag in the Firestore Lead document.");
      console.log("   And the Contact should be updated with 'Batman'.");
    } else {
      console.error("❌ Failed on duplicate request:", data2);
    }

    console.log("\n🎉 E2E Intake Simulation Complete! Go check Firestore to verify the 5 interconnected records.");

  } catch (err) {
    console.error("💥 Network/Fetch error. Make sure the dev server is running on localhost:3000:");
    console.error(err.message);
  }
}

runTest();
