import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const swPath = path.join(distDir, 'sw.js');

if (!fs.existsSync(swPath)) {
  console.error("Service worker not found in dist/sw.js");
  process.exit(1);
}

// Function to recursively get files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      // Get relative path starting with /
      const relPath = '/' + path.relative(distDir, filePath).replace(/\\/g, '/');
      // Do not cache sw.js, html, or map files twice or map files at all
      if (relPath !== '/sw.js' && !relPath.endsWith('.map') && relPath !== '/index.html') {
        fileList.push(relPath);
      }
    }
  });
  return fileList;
}

const assets = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/dr_doom_bg.jpg',
  '/iron_man_bg.jpg',
  '/logo.png'
];

try {
  const buildAssets = getFiles(distDir);
  const allAssets = [...new Set([...assets, ...buildAssets])];
  
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Replace the placeholder const PRECACHE_ASSETS = [...]
  const placeholder = 'const PRECACHE_ASSETS = [';
  if (swContent.includes(placeholder)) {
    const assetsString = `const PRECACHE_ASSETS = ${JSON.stringify(allAssets, null, 2)};`;
    swContent = swContent.replace(/const PRECACHE_ASSETS = \[\s*[\s\S]*?\];/g, assetsString);
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log(`[SW Post-Build] Injected ${allAssets.length} assets into dist/sw.js successfully!`);
  } else {
    console.warn("Could not find PRECACHE_ASSETS placeholder in dist/sw.js");
  }
} catch (error) {
  console.error("Failed to inject assets into sw.js:", error);
}
