// ESM-модули для npm и одна IIFE-сборка для подключения через <script>
import { build } from 'esbuild'

const common = { bundle: true, target: 'es2019', sourcemap: true, logLevel: 'info' }

await build({ ...common, entryPoints: ['src/index.ts', 'src/host.ts'], outdir: 'dist', format: 'esm', splitting: true })
await build({ ...common, entryPoints: ['src/iife.ts'], outfile: 'dist/ni-sdk.js', format: 'iife', minify: true })
