import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import del from 'rollup-plugin-delete'
import copy from 'rollup-plugin-copy'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import json from '@rollup/plugin-json'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/dvg.min.js',
        name: 'dvg',
        format: 'iife',
      },
      {
        file: 'dist/index.es.js',
        format: 'es',
      },
      {
        file: 'dist/index.js',
        format: 'cjs',
      },
    ],
    plugins: [
      del({ runOnce: true, targets: 'dist/**/*' }),
      copy({ targets: [{ src: ['src/*', '!**/*.ts'], dest: 'dist' }] }),
      json(),
      nodePolyfills(),
      nodeResolve({ browser: true }),
      commonjs(),
      typescript(),
      terser(),
    ],
  },
]
