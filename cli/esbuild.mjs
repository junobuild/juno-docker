import {config} from 'dotenv';
import esbuild from 'esbuild';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

config({
  path: process.env.NODE_ENV === 'development' ? `.env.development` : `.env.production`
});

const define = Object.entries(process.env).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [`process.env.${key}`]: JSON.stringify(value)
  }),
  {}
);

const dist = join(process.cwd(), 'dist');

if (!existsSync(dist)) {
  mkdirSync(dist);
}

const script = await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.mjs',
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'node',
  write: false,
  banner: {
    js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);"
  },
  define
});

writeFileSync('dist/index.js', `#!/usr/bin/env node\n${script.outputFiles[0].text}`);
