import { Context } from './context';
import { v4 as uuidv4 } from 'uuid/dist/esm-browser';

declare global {
  interface Window { eval: CallableFunction, vmEval: (code, scope) => any, vmEvalAsync: (code, scope) => Promise<any> }
}

export class VM {

  iframe: HTMLIFrameElement
  iframeId: string

  eval: any
  vmEvalSync: (code, scope) => any
  vmEvalAsync: (code, scope) => Promise<any>
  frameWindow: Window
  private nonDeletableKeys: string[] = []

  init() {
    this.setupIframe()
    this.setupIframeContext()
  }

  private setupIframe() {
    this.iframeId = uuidv4()
    this.iframe = document.createElement("iframe")
    this.iframe.setAttribute("sandbox", "allow-same-origin")
    this.iframe.setAttribute("name", this.iframeId)
    this.iframe.style.display = "none"
    document.body.appendChild(this.iframe)
  }

  private setupIframeContext() {
    this.frameWindow = this.iframe.contentWindow
    const frameKeys = Object.keys(this.frameWindow)
    this.eval = this.frameWindow.eval
    const customEvalFunctions = `
      function vmEvalSync(code, contextAsScope) {
        //# Return the results of the in-line anonymous function we .call with the passed context
        return function() { return Function(code).bind(this)(); }.call(contextAsScope);
      }
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      function vmEvalAsync(code, contextAsScope) {
        //# Return the results of the in-line anonymous function we .call with the passed context
        return function() { return AsyncFunction(code).bind(this)(); }.call(contextAsScope);
      }
    `
    for (const key of frameKeys) {
      try {
        delete this.frameWindow[key]
      } catch { }
    }
    this.nonDeletableKeys = Object.keys(this.frameWindow)
    delete this.frameWindow.eval
    this.eval(customEvalFunctions)
    this.vmEvalSync = this.frameWindow.vmEval
    this.vmEvalAsync = this.frameWindow.vmEvalAsync
  }

  createContext(data: Record<string, any> = {}, excludeKeys = []) {
    return new Context(data, this, { excludeKeys: [...this.nonDeletableKeys, ...excludeKeys] });
  }

  destroy() {
    // console.log("Destroy VM")
  }

}