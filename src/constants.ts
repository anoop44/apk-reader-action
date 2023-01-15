export enum Inputs {
    Name = 'name',
    Path = 'path',
  }

export enum Outputs {
  VersionName = 'version-name',
  VersionCode = 'version-code'
}
  
  export enum NoFileOptions {
    /**
     * Default. Output a warning but do not fail the action
     */
    warn = 'warn',
  
    /**
     * Fail the action with an error message
     */
    error = 'error',
  
    /**
     * Do not output any warnings or errors, the action does not fail
     */
    ignore = 'ignore'
  }