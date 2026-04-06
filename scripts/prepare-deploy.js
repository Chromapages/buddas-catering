const fs = require('fs').promises;
const path = require('path');

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function prepareDeploy() {
  const root = path.resolve(__dirname, '..');
  const standalone = path.join(root, '.next', 'standalone');
  
  try {
    const stats = await fs.stat(standalone);
    if (!stats.isDirectory()) {
      throw new Error('Standalone directory not found.');
    }
  } catch (err) {
    console.error('Standalone directory not found. Did the build fail?');
    process.exit(1);
  }

  try {
    console.log('Copying public directory to standalone...');
    await copyDir(path.join(root, 'public'), path.join(standalone, 'public'));

    console.log('Copying static directory to standalone/.next/static...');
    await copyDir(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'));

    console.log('Deployment preparation complete!');
  } catch (err) {
    console.error('Error during deployment preparation:', err);
    process.exit(1);
  }
}

prepareDeploy();
