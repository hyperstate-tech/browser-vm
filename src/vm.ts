import { Context } from './context';
import { v4 as uuidv4 } from 'uuid/dist/esm-browser';

declare global {
  interface Window { eval: CallableFunction, execScript: any, vmEval: (code, scope) => any }
}

export class VM {

  iframe: HTMLIFrameElement
  iframeId: string

  eval: any
  vmEval: (code, scope) => any
  frameWindow: Window
  private noneDeletableKeys: string[] = []

  init() {
    this.setupIframe()
    this.setupIframeContext()
  }

  private setupIframe() {
    this.iframeId = uuidv4()
    this.iframe = document.createElement("iframe")
    this.iframe.setAttribute("sandbox", "allow-same-origin")
    this.iframe.setAttribute("name", this.iframeId)
    document.body.appendChild(this.iframe)
  }

  private setupIframeContext() {
    this.frameWindow = this.iframe.contentWindow
    const frameKeys = Object.keys(this.frameWindow)
    this.eval = this.frameWindow.eval
    const customEvalCode = `
      function vmEval(code, contextAsScope) {
        //# Return the results of the in-line anonymous function we .call with the passed context
        return function() { return Function(code).bind(this)(); }.call(contextAsScope);
      }
    `
    const wExecScript = this.frameWindow.execScript;
    if (!this.eval && wExecScript) {
      // win.eval() magically appears when this is called in IE:
      wExecScript.call(this.frameWindow, 'null');
      this.eval = this.frameWindow.eval;
    }
    for (const key of frameKeys) {
      try {
        delete this.frameWindow[key]
      } catch { }
    }
    this.noneDeletableKeys = Object.keys(this.frameWindow)
    delete this.frameWindow.eval
    this.eval(customEvalCode)
    this.vmEval = this.frameWindow.vmEval
  }

  createContext(data: Record<string, any> = {}, excludeKeys = []) {
    return new Context(data, this, { excludeKeys: [...this.noneDeletableKeys, ...excludeKeys] });
  }

  destroy() {
    // console.log("Destroy VM")
  }

}