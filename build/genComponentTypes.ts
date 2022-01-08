import * as ts from 'typescript'
import * as path from 'path'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import * as fs from 'fs'

const compile = (entryPointFiles: string[], options: ts.CompilerOptions): void => {
  const program = ts.createProgram(entryPointFiles, options)
  program.emit();
}

const entryPointFiles = [path.join(__dirname, '../components/type.ts')]
const temporaryOutDir = path.join(__dirname, './dist')

compile(entryPointFiles, {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  strict: true,  
  declaration: true,
  emitDeclarationOnly: true,
  outDir: temporaryOutDir
})

const apiExtractorJsonPath = path.join(__dirname, '../api-extractor.json')
const extractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)
const extractorResult = Extractor.invoke(extractorConfig, {
  localBuild: true,
  showVerboseMessages: true
})
if (extractorResult.succeeded) {
  console.log(`API Extractor completed successfully`)
  process.exitCode = 0
} else {
  console.error(`API Extractor completed with ${extractorResult.errorCount} errors`
    + ` and ${extractorResult.warningCount} warnings`)
  process.exitCode = 1
}

fs.rmSync(temporaryOutDir, { recursive: true, force: true })