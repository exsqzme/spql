import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import resolve from 'rollup-plugin-node-resolve'

import pkg from './package.json'

export default [
    // CommonJS
    {
        input: 'src/index.js',
        output: { file: 'lib/spql.js', format: 'cjs', indent: false },
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {})
        ],
        plugins: [resolve(), babel()]
    },

    // UMD Production
    {
        input: 'src/index.js',
        output: {
            file: 'dist/spql.min.js',
            format: 'umd',
            name: 'spql',
            indent: false
        },
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {})
        ],
        plugins: [
            resolve(),
            babel({
                exclude: 'node_modules/**'
            }),
            terser({
                compress: {
                    unsafe: true,
                    unsafe_comps: true
                }
            })
        ]
    }

]