#!/usr/bin/env node
/**
 * Ovuluna Layout Migration Script
 * Replaces duplicated <div class="top"> headers and <nav class="nav"> footers
 * with shared placeholders that app-layout.js injects.
 * Run once: node migrate-layout.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

let migrated = 0;
let skipped = 0;
let errors = [];

for (const file of htmlFiles) {
  // Skip index.html and login.html (they have their own landing page design)
  if (file === 'index.html' || file === 'login.html') {
    skipped++;
    continue;
  }

  const filePath = path.join(ROOT, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace <div class="top">...</div> with placeholder
  // The top div contains persona-badge and t-icon links
  const topRegex = /<div class="top">[\s\S]*?<\/div>\s*(?=<div class="scroll">|<main>|<div class="app">|<div class="content")/;
  if (topRegex.test(content)) {
    content = content.replace(topRegex, '<div id="app-header"></div>\n\n  ');
    changed = true;
  }

  // Also try simpler pattern: <div class="top">...</div> (first occurrence only)
  if (!changed) {
    const simpleTopRegex = /<div class="top">[\s\S]*?<\/div>/;
    if (simpleTopRegex.test(content)) {
      const match = content.match(simpleTopRegex);
      if (match && match[0].includes('OVULUNA') || match[0].includes('persona') || match[0].includes('t-icon')) {
        content = content.replace(simpleTopRegex, '<div id="app-header"></div>');
        changed = true;
      }
    }
  }

  // Replace <nav class="nav">...</nav> with placeholder
  const navRegex = /<nav class="nav">[\s\S]*?<\/nav>/;
  if (navRegex.test(content)) {
    content = content.replace(navRegex, '<div id="app-nav"></div>');
    changed = true;
  }

  // Add app-layout.js script if not present and page has placeholders
  if (changed && !content.includes('app-layout.js')) {
    content = content.replace('</body>', '  <script src="app-layout.js"></script>\n</body>');
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    migrated++;
    console.log(`  ✓ ${file}`);
  } else {
    skipped++;
  }
}

console.log(`\n✅ Migrated ${migrated} pages to shared layout`);
console.log(`⏭️  Skipped ${skipped} pages (no matching structure or landing pages)`);
if (errors.length > 0) {
  console.log(`❌ Errors: ${errors.length}`);
  errors.forEach(e => console.log(`   ${e}`));
}
