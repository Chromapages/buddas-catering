const { spawn } = require('child_process');
const path = require('path');

// Logger to see exactly what is happening in Hostinger's console
function log(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [HOSTINGER-WRAPPER] ${msg}`);
}

log('Starting Buddas Catering Deployment Wrapper...');

// 1. Diagnostic Checks
log(`Node Version: ${process.version}`);
log(`Platform: ${process.platform}`);
log(`Current Directory: ${process.cwd()}`);
log(`Standalone Server Path: ${path.join(__dirname, '.next', 'standalone', 'server.js')}`);

// 2. Identify Port (Crucial for Hostinger)
const port = process.env.PORT || 3000;
log(`Target Port from Environment: ${port}`);

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
log('Spawning Next.js standalone process...');

const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');

const nextProcess = spawn('node', [serverPath], {
  env: { ...process.env, PORT: port, HOSTNAME: '0.0.0.0' },
  stdio: 'inherit'
});

nextProcess.on('error', (err) => {
  log(`FAILED to spawn Next.js: ${err.message}`);
});

nextProcess.on('exit', (code, signal) => {
  log(`Next.js process exited with code ${code} and signal ${signal}`);
  process.exit(code || 1);
});

// Handle termination signals
process.on('SIGTERM', () => {
  log('SIGTERM received. Shutting down...');
  nextProcess.kill();
});

process.on('SIGINT', () => {
  log('SIGINT received. Shutting down...');
  nextProcess.kill();
});
