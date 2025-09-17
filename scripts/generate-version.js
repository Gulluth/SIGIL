#!/usr/bin/env node

// Generate version.ts from package.json version
const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const versionContent = `// Auto-generated file - do not edit manually
// This file is generated from package.json during build
export const VERSION = '${packageJson.version}';
`;

const versionPath = path.join(__dirname, '..', 'src', 'version.ts');
fs.writeFileSync(versionPath, versionContent);
console.log(`Generated src/version.ts with version ${packageJson.version}`);