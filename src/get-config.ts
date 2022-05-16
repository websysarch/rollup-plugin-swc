import deepMerge from 'deepmerge'
import { ParserConfig, Options, JscTarget } from '@swc/core'
import { extname } from 'path'
import { readTsCompilerOptions } from './utils'

export async function getSwcOptions(
  options: Omit<Options, 'filename'>,
  tsConfigPath?: string | boolean | null,
): Promise<Omit<Options, 'filename'>> {
  if (typeof tsConfigPath === 'string') {
    const tsConfig = await readTsCompilerOptions(tsConfigPath)
    const config: Options = {
      jsc: {
        externalHelpers: tsConfig.importHelpers,
        parser: {
          syntax: 'typescript', // would be overridden by options or transform options
          decorators: tsConfig.experimentalDecorators,
        },
        transform: {
          decoratorMetadata: tsConfig.emitDecoratorMetadata,
          react: {
            pragma: tsConfig.jsxFactory,
            pragmaFrag: tsConfig.jsxFragmentFactory,
          },
        },
        target: tsConfig.target?.toLowerCase() as JscTarget | undefined,
        baseUrl: tsConfig.baseUrl,
        paths: tsConfig.paths,
      },
    }
    return deepMerge<Omit<Options, 'filename'>>(config, options)
  }
  return options
}

function getDefaultParserConfig(ext: string): ParserConfig {
  const config: ParserConfig = {
    syntax: ext === '.ts' || ext === '.tsx' ? 'typescript' : 'ecmascript',
  }
  if (config.syntax === 'typescript') {
    config.tsx = ext === '.tsx'
  } else {
    config.jsx = ext === '.jsx'
  }

  return config
}

export function getSwcTransformOptions(
  filename: string,
  options: Omit<Options, 'filename'>,
): Options {
  return deepMerge<Options>(
    {
      filename,
      jsc: {
        parser: getDefaultParserConfig(extname(filename)),
        minify: undefined,
      },
      minify: false,
    },
    options,
  )
}
