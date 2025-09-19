#!/usr/bin/env node

/**
 * Post-build script to inject version from package.json into compiled output
 * Replaces __SIGIL_VERSION__ placeholder with actual version
 */

const fs = require('fs');
const path = require('path');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

console.log(`🔧 Injecting version ${version} into build output...`);

// Path to compiled index.js
const indexPath = path.join('dist', 'src', 'index.js');

try {
    // Read the compiled file
    let content = fs.readFileSync(indexPath, 'utf8');

    // Replace the placeholder with actual version
    const updatedContent = content.replace(/__SIGIL_VERSION__/g, version);

    // Write back the updated content
    fs.writeFileSync(indexPath, updatedContent, 'utf8');

    console.log(`✅ Version ${version} successfully injected into ${indexPath}`);
} catch (error) {
    console.error('❌ Error injecting version:', error.message);
    process.exit(1);
}