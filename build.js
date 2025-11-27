const esbuild = require('esbuild');
const { execSync } = require('child_process');
const fs = require('fs');

async function build() {
  // Clean dist directory
  if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true });
  }
  fs.mkdirSync('./dist');

  // Build ESM
  await esbuild.build({
    entryPoints: ['./lib/index.tsx'],
    bundle: true,
    outfile: './dist/index.mjs',
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    external: ['react', 'react-dom'],
    sourcemap: true,
    minify: false,
  });

  // Build CJS
  await esbuild.build({
    entryPoints: ['./lib/index.tsx'],
    bundle: true,
    outfile: './dist/index.js',
    format: 'cjs',
    platform: 'browser',
    target: 'es2020',
    external: ['react', 'react-dom'],
    sourcemap: true,
    minify: false,
  });

  // Generate type declarations using tsconfig.build.json
  execSync('npx tsc --project tsconfig.build.json', { stdio: 'inherit' });

  console.log('Build complete!');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
