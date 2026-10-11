// ESM-модули для npm и одна IIFE-сборка для подключения через <script>
import { rmSync } from 'node:fs'
import { build } from 'esbuild'

// Чистим dist: иначе остаются чанки прошлых сборок с другими хешами
rmSync('dist', { recursive: true, force: true })

const common = { bundle: true, target: 'es2019', sourcemap: true, logLevel: 'info' }

await build({ ...common, entryPoints: ['src/index.ts', 'src/host.ts'], outdir: 'dist', format: 'esm', splitting: true })
await build({ ...common, entryPoints: ['src/iife.ts'], outfile: 'dist/ni-sdk.js', format: 'iife', minify: true })
