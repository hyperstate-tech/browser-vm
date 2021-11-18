import { Context } from './context';

export class Script {

  private _compiledCode = null

  constructor(protected code: string) { }

  get compiledCode() {
    if (!this._compiledCode) {
      this._compiledCode = this.code
    }
    return this._compiledCode
  }

  async runInContext(context: Context, extraContext: Record<string, any> = {}) {
    return await context.execute(this)
  }

  runInContextSync(context: Context, extraContext: Record<string, any> = {}) {
    return context.executeSync(this)
  }

}