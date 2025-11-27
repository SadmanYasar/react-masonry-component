const esbuild = require('esbuild');
const { execSync } = require('child_process');
const fs = require('fs');

async function build() {
  // Clean dist directory
  if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true });
  }
  fs.mkdirSync('./dist');

  // Common build options
  // We define 'define' as undefined to prevent AMD module detection in bundled code
  // This fixes issues with Next.js and other bundlers that try to resolve AMD paths
  const commonOptions = {
    entryPoints: ['./lib/index.tsx'],
    bundle: true,
    platform: 'browser',
    target: 'es2020',
    external: ['react', 'react-dom'],
    sourcemap: true,
    minify: false,
    // Disable AMD define detection to prevent bundlers from trying to resolve
    // relative AMD paths like './item' in the outlayer library
    define: {
      'define.amd': 'undefined',
    },
  };

  // Build ESM
  await esbuild.build({
    ...commonOptions,
    outfile: './dist/index.mjs',
    format: 'esm',
  });

  // Build CJS
  await esbuild.build({
    ...commonOptions,
    outfile: './dist/index.js',
    format: 'cjs',
  });

  // Generate type declarations using tsconfig.build.json
  execSync('npx tsc --project tsconfig.build.json', { stdio: 'inherit' });

  console.log('Build complete!');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
