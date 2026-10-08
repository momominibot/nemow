#!/usr/bin/env node
/**
 * Ovuluna Page Validator — runs before every deploy.
 * Checks: HTML structure, broken links, JS syntax, CSS includes, nav consistency, persona badges.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const errors = [];
const warnings = [];
const passed = [];

function log(type, msg) {
  if (type === 'error') errors.push(msg);
  else if (type === 'warn') warnings.push(msg);
  else passed.push(msg);
}

// 1. Get all HTML files
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
console.log(`\n📋 Validating ${htmlFiles.length} HTML pages...\n`);

// 2. Check each page
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  
  // 2a. Basic HTML structure
  if (!content.includes('<!doctype html>') && !content.includes('<!DOCTYPE html>')) {
    log('error', `${file}: Missing doctype`);
  }
  if (!content.includes('<html')) log('error', `${file}: Missing <html> tag`);
  if (!content.includes('<head>')) log('error', `${file}: Missing <head> tag`);
  if (!content.includes('<body>')) log('error', `${file}: Missing <body> tag`);
  
  // 2b. Required CSS includes
  if (!content.includes('theme.css')) log('warn', `${file}: Missing theme.css`);
  if (!content.includes('darkmode.css')) log('warn', `${file}: Missing darkmode.css`);
  
  // 2c. Fonts
  if (!content.includes('Newsreader') && !content.includes('newsreader')) {
    log('warn', `${file}: Missing Newsreader font`);
  }
  if (!content.includes('Manrope') && !content.includes('manrope')) {
    log('warn', `${file}: Missing Manrope font`);
  }
  
  // 2d. Check for Nunito (forbidden font)
  if (content.includes('Nunito') || content.includes('nunito')) {
    log('error', `${file}: Contains forbidden Nunito font`);
  }
  
  // 2e. Check for Unicode escapes in text content
  const unicodeEscapes = content.match(/\\u[0-9a-fA-F]{4}/g);
  if (unicodeEscapes && unicodeEscapes.length > 0) {
    log('warn', `${file}: Contains ${unicodeEscapes.length} Unicode escape sequences`);
  }
  
  // 2f. Check for broken internal links
  const links = content.match(/href="([^"]+\.html[^"]*)"/g);
  if (links) {
    for (const link of links) {
      const href = link.match(/href="([^"]+)"/)[1];
      const targetFile = href.split('#')[0].split('?')[0];
      if (targetFile && !fs.existsSync(path.join(ROOT, targetFile))) {
        log('error', `${file}: Broken link -> ${targetFile}`);
      }
    }
  }
  
  // 2g. Check for broken image references
  const imgs = content.match(/src="(assets\/[^"]+)"/g);
  if (imgs) {
    for (const img of imgs) {
      const src = img.match(/src="([^"]+)"/)[1];
      const imgFile = src.split('?')[0];
      if (!fs.existsSync(path.join(ROOT, imgFile))) {
        log('error', `${file}: Missing image -> ${imgFile}`);
      }
    }
  }
  
  // 2h. Check for broken JS includes
  const scripts = content.match(/src="([^"]+\.js[^"]*)"/g);
  if (scripts) {
    for (const script of scripts) {
      const src = script.match(/src="([^"]+)"/)[1];
      if (src.startsWith('http') || src.startsWith('//')) continue;
      const jsFile = src.split('?')[0];
      if (!fs.existsSync(path.join(ROOT, jsFile))) {
        log('error', `${file}: Missing JS -> ${jsFile}`);
      }
    }
  }
  
  // 2i. Check inline script syntax
  const inlineScripts = content.match(/<script>([\s\S]*?)<\/script>/g);
  if (inlineScripts) {
    for (let i = 0; i < inlineScripts.length; i++) {
      const code = inlineScripts[i].replace(/<\/?script>/g, '');
      try {
        new Function(code);
      } catch (e) {
        log('error', `${file}: Inline script #${i+1} syntax error: ${e.message}`);
      }
    }
  }
  
  // 2j. Check for bottom-nav (forbidden class)
  if (content.includes('bottom-nav')) {
    log('error', `${file}: Uses forbidden 'bottom-nav' class (should be 'nav')`);
  }
  
  // 2k. Check for material-symbols-outlined in nav (forbidden in nav only)
  const navMatch = content.match(/<nav[^>]*>[\s\S]*?<\/nav>/i);
  if (navMatch && navMatch[0].includes('material-symbols-outlined')) {
    log('error', `${file}: Uses material-symbols-outlined in nav (should be n-ic class)`);
  }
}

// 3. Validate all JS files syntax
const jsFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.js') && !f.includes('backup'));
console.log(`\n🔍 Validating ${jsFiles.length} JS files...\n`);
for (const file of jsFiles) {
  try {
    execSync(`node -c "${path.join(ROOT, file)}"`, { stdio: 'pipe' });
  } catch (e) {
    log('error', `${file}: JS syntax error: ${e.stderr?.toString()?.split('\n')[0] || e.message}`);
  }
}

// 4. Check critical pages have shared layout
const criticalPages = ['home.html', 'learn.html', 'tcm-hub.html', 'foods.html', 'profile.html', 'daily-tracker.html', 'mental-health.html', 'community.html', 'ppg.html', 'journal.html'];
for (const page of criticalPages) {
  if (fs.existsSync(path.join(ROOT, page))) {
    const content = fs.readFileSync(path.join(ROOT, page), 'utf8');
    if (!content.includes('app-header') && !content.includes('persona-badge')) {
      log('warn', `${page}: Missing shared layout header placeholder`);
    }
    if (!content.includes('app-nav') && !content.includes('<nav class="nav">')) {
      log('warn', `${page}: Missing shared layout nav placeholder`);
    }
  }
}

// 5. Summary
console.log('\n' + '='.repeat(60));
console.log(`✅ PASSED: ${passed.length} checks`);
if (warnings.length > 0) {
  console.log(`⚠️  WARNINGS: ${warnings.length}`);
  warnings.forEach(w => console.log(`   ⚠️  ${w}`));
}
if (errors.length > 0) {
  console.log(`❌ ERRORS: ${errors.length}`);
  errors.forEach(e => console.log(`   ❌ ${e}`));
  console.log('\n❌ VALIDATION FAILED — fix errors before deploying\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL CRITICAL CHECKS PASSED — safe to deploy\n');
  process.exit(0);
}
