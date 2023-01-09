import * as core from '@actions/core'
import {findFilesToUpload} from './search'
import {getInputs} from './input-helper'
import {NoFileOptions} from './constants'

async function run(): Promise<void> {
    try {
        const inputs = getInputs()
        const searchResult = await findFilesToUpload(inputs.searchPath)
    } catch (error) {
      if (error instanceof Error) core.setFailed(error.message)
    }
  }
  
  run()