/**
 * Script to disable static exports for the entire application
 * This creates a configuration file that forces all pages to be server-rendered
 */
const fs = require('fs');
const path = require('path');

console.log('Disabling static exports for the entire application...');

// Create a config file in the app directory to disable static exports
const configPath = path.join(__dirname, '..', 'app', 'config.js');
const configContent = `// This file disables static exports for the entire application
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';
export const maxDuration = 300;
`;

fs.writeFileSync(configPath, configContent);
console.log(`✓ Created app/config.js to disable static exports`);

// Create a config file in the pages directory if it exists
const pagesDir = path.join(__dirname, '..', 'pages');
if (fs.existsSync(pagesDir)) {
  const pagesConfigPath = path.join(pagesDir, '_app.js');
  
  // Only create if it doesn't exist
  if (!fs.existsSync(pagesConfigPath)) {
    const pagesConfigContent = `// This file disables static exports for the entire application
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// Force dynamic rendering
MyApp.getInitialProps = async () => {
  return { pageProps: {} };
};

export default MyApp;
`;
    
    fs.writeFileSync(pagesConfigPath, pagesConfigContent);
    console.log(`✓ Created pages/_app.js to disable static exports`);
  }
}

// Update next.config.js to disable static exports
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Check if the config already has staticPageGenerationTimeout
  if (!nextConfig.includes('staticPageGenerationTimeout')) {
    // Add the configuration to disable static exports
    nextConfig = nextConfig.replace('const nextConfig = {', `const nextConfig = {
  // Disable static exports completely - force all pages to be server-rendered
  staticPageGenerationTimeout: 1,
  `);
    
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log(`✓ Updated next.config.js to disable static exports`);
  }
}

console.log('✅ Successfully disabled static exports for the entire application'); 