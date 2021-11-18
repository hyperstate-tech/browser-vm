import { VM } from './vm';
import { Script } from './script';

interface ContextOptions {
  excludeKeys: string[]
}

export class Context {

  constructor(private contextData: Record<string, any>, private vm: VM, public options: ContextOptions = {
    excludeKeys: []
  }) { }

  executeSync<T extends unknown = unknown>(script: Script, extraContext: Record<string, any> = {}): T | void {

    const contextString = `
    with(this) { 
      "use strict";
      return ${script.compiledCode}
    }
      `
    // console.log(this.vm.call(this.contextData, script.compiledCode))
    // return this.vm.call(this.contextData, script)
    const blacklistedKeys = {}
    for (const excludedKey of this.options.excludeKeys) {
      blacklistedKeys[excludedKey] = undefined
    }
    return this.vm.vmEval(contextString, { ...this.contextData, ...extraContext, ...blacklistedKeys })
  }

  async execute<T extends unknown = unknown>(script: Script, extraContext: Record<string, any> = {}): Promise<T | void> {
    return await this.executeSync(script, extraContext)
  }

}