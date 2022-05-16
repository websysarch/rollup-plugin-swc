import { addExtension } from '@rollup/pluginutils'
import deepmerge from 'deepmerge'
import fsp from 'fs/promises'
import { join } from 'path'

function fixPath(partialPath: string, isDirectory: boolean, ext: string) {
  return addExtension(isDirectory ? join(partialPath, 'index') : partialPath, ext)
}

async function ensureFile(filePath: string): Promise<string> {
  const stats = await fsp.stat(filePath)
  if (stats.isFile()) return filePath
  throw new Error('Not a file')
}

async function isDirectory(fileOrFolderPath: string) {
  try {
    const stats = await fsp.stat(fileOrFolderPath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

export async function resolveFilePath(fileOrFolderPath: string, extensions: string[]) {
  const isFolder = await isDirectory(fileOrFolderPath)
  return Promise.any(
    extensions.map(ext => fixPath(fileOrFolderPath, isFolder, ext)).map(ensureFile),
  )
}

export async function readJsonFile(filePath: string): Promise<Record<string, any>> {
  const content = await fsp.readFile(filePath, { encoding: 'utf-8' })
  return JSON.parse(content)
}

export async function readTsCompilerOptions(
  filePath: string | undefined,
  config: Record<string, any> = {},
): Promise<Record<string, any>> {
  if (!filePath) return config
  const baseConfig = await readJsonFile(filePath)
  return readTsCompilerOptions(
    baseConfig.extends,
    deepmerge<Record<string, any>>(baseConfig.compilerOptions, config),
  )
}
