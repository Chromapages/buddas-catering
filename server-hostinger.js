const fs = require('fs');
const path = require('path');

// Logger to see exactly what is happening in Hostinger's console
function log(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [HOSTINGER-WRAPPER] ${msg}`);
}

log('Starting Buddas Catering Deployment Wrapper (Direct Entry)...');

// 1. Diagnostic Checks
log(`Node Version: ${process.version}`);
log(`Platform: ${process.platform}`);
log(`Current Directory: ${process.cwd()}`);

// 2. Identify Port (Crucial for Hostinger)
const port = process.env.PORT || 3000;
process.env.PORT = port;
process.env.HOSTNAME = '0.0.0.0';
log(`Target Port: ${port} | Hostname: 0.0.0.0`);

// 3. Environment Variable Visibility Check
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'NEXT_PUBLIC_SANITY_PROJECT_ID'
];

requiredVars.forEach(v => {
  const isPresent = !!process.env[v];
  log(`Variable ${v}: ${isPresent ? 'PRESENT' : 'MISSING'}`);
});

// 4. Start the Standalone Next.js Server
log('Identifying Standalone Server...');

const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(serverPath)) {
  log(`Standalone Server found at: ${serverPath}`);
  log('Starting Next.js Server... (Direct Module Entry)');
  
  // By using require() we stay in the same process, which is critical 
  // for Hostinger's process manager to track health and binding.
  try {
    require(serverPath);
  } catch (err) {
    log(`CRITICAL ERROR during server start: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
} else {
  log('CRITICAL ERROR: Standalone server.js not found.');
  log('Did you run "npm run build" before deploying?');
  process.exit(1);
}

// Handle termination signals
process.on('SIGTERM', () => {
  log('SIGTERM received. Shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received. Shutting down...');
  process.exit(0);
});
