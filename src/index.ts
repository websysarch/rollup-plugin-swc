import { Options, transform, minify as swcMinify, JsMinifyOptions } from '@swc/core'
import { Plugin } from 'rollup'
import { createFilter, FilterPattern } from '@rollup/pluginutils'
import { dirname, extname, resolve } from 'path'
import { resolveFilePath } from './utils'
import { getSwcOptions, getSwcTransformOptions } from './get-config'

const INCLUDE_REGEXP = /\.m?[jt]sx?$/
const EXCLUDE_REGEXP = /node_modules/
const EXTENSIONS = ['.ts', '.mjs', '.js', '.tsx', '.jsx']

type RollupOptions = {
  rollup?: {
    include: FilterPattern
    exclude: FilterPattern
  }
  tsConfigPath?: string | false
  extensions?: string[]
}

type PluginOptions = Omit<Options, 'filename'> & RollupOptions

export function swc(pluginOptions: PluginOptions = {}): Plugin {
  const {
    rollup,
    extensions = EXTENSIONS,
    tsConfigPath = resolve('tsconfig.json'),
    ...swcOptions
  } = pluginOptions
  const filter = createFilter(rollup?.include || INCLUDE_REGEXP, rollup?.exclude || EXCLUDE_REGEXP)
  const validExt = new Set(extensions)
  const promisedOptions = getSwcOptions(swcOptions, tsConfigPath)
  return {
    name: 'swc',
    async resolveId(source: string, importer: string | undefined) {
      try {
        if (importer && source[0] === '.') {
          const fileOrFolderPath = resolve(importer ? dirname(importer) : process.cwd(), source)
          return resolveFilePath(fileOrFolderPath, extensions)
        }
      } catch (e) {}
      return null
    },
    async transform(code, filename) {
      if (!filter(filename)) return null
      const ext = extname(filename)
      if (!validExt.has(ext)) return null
      const options = await promisedOptions
      const transformOptions = getSwcTransformOptions(filename, options)
      return transform(code, transformOptions)
    },
    renderChunk(code: string) {
      if (swcOptions.minify || swcOptions.jsc?.minify?.mangle || swcOptions.jsc?.minify?.compress) {
        return swcMinify(code, swcOptions.jsc?.minify)
      }
      return null
    },
  }
}

export function minify(options?: JsMinifyOptions): Plugin {
  return {
    name: 'swc-minify',
    renderChunk(code: string) {
      return swcMinify(code, options)
    },
  }
}

export default swc
