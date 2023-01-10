import * as core from '@actions/core'
import {findFilesToUpload} from './search'
import {getInputs} from './input-helper'
import {NoFileOptions} from './constants'
import {inspect} from 'util'

async function run(): Promise<void> {
    try {
        const inputs = getInputs()
        const searchResult = await findFilesToUpload(inputs.searchPath)
        if(searchResult.file.length > 1) {
          const apk_reader = require('node-apk-parser')
          apk_reader.readFile(searchResult.file)
          const manifest = apk_reader.readManifestSync()
          console.log(inspect(manifest, { depth: null }))
        } else {
          throw new Error("apk file not found in mentioned path")
        }
    } catch (error) {
      if (error instanceof Error) core.setFailed(error.message)
    }
  }
  
  run()