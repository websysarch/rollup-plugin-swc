import { resolve } from 'path'
import { swc } from '../dist/esm/index'

function getConfig(target) {
  return {
    input: 'src/index.ts',
    output: {
      dir: `dist/${target}`,
      format: 'es',
    },
    plugins: [
      swc({
        tsConfigPath: resolve('../config/esm.json'),
        minify: true,
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          target,
        },
      }),
    ],
  }
}

export default [getConfig('es3'), getConfig('es2020')]
