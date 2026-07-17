#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';
import { minify } from 'terser';
import fse from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.join(__dirname, 'src');
const BUILD = path.join(__dirname, 'build');

// Explicit list of files (relative to src/) to minify
const MINIFY_FILES = new Set([
  'lib/videojs_mod.js',
]);

function shouldMinify(relPath) {
  return MINIFY_FILES.has(relPath.replaceAll('\\', '/'));
}

async function copyTree(srcDir, destDir) {
  await fse.ensureDir(destDir);
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyTree(srcPath, destPath);
    } else if (shouldMinify(path.relative(SRC, srcPath))) {
      const code = fs.readFileSync(srcPath, 'utf8');
      const result = await minify(code, { compress: true, mangle: true });
      fs.writeFileSync(destPath, result.code, 'utf8');
    } else {
      fse.copySync(srcPath, destPath);
    }
  }
}

function readVersion(manifestPath) {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8')).version;
}

function zipDir(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const out = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    out.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(out);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function build() {
  console.log('Cleaning build directory...');
  fse.emptyDirSync(BUILD);

  // --- Chrome ---
  const chromeDir = path.join(BUILD, 'chrome');
  console.log(`\nCopying 'src' to 'chrome'`);
  await copyTree(SRC, chromeDir);
  fs.rmSync(path.join(chromeDir, 'manifest_firefox.json'));

  const chromeVersion = readVersion(path.join(chromeDir, 'manifest.json'));
  const chromeZip = path.join(BUILD, `ImagusReborn_Chrome_v${chromeVersion}.zip`);
  console.log('Zipping Chrome build...');
  await zipDir(chromeDir, chromeZip);

  // --- Firefox ---
  const firefoxDir = path.join(BUILD, 'firefox');
  console.log(`\nCopying 'src' to 'firefox'`);
  await copyTree(SRC, firefoxDir);
  fs.renameSync(
    path.join(firefoxDir, 'manifest_firefox.json'),
    path.join(firefoxDir, 'manifest.json')
  );

  const firefoxVersion = readVersion(path.join(firefoxDir, 'manifest.json'));
  const firefoxZip = path.join(BUILD, `ImagusReborn_Firefox_v${firefoxVersion}.zip`);
  console.log('Zipping Firefox build...');
  await zipDir(firefoxDir, firefoxZip);

  console.log('\nDone!');
}

build().catch(err => {
  console.error('\nError!', err.message || err);
  process.exit(1);
});
