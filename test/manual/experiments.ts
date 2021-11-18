import { VM, Script, Context } from '../../src';

export class Experiments {

  vm: VM
  context: Context

  setupVM() {
    this.vm = new VM()
    this.vm.init()
  }

  destroyVM() {
    this.vm.destroy()
  }

  setupContext() {
    this.context = this.vm.createContext({ hello: () => 5, world: 5 }, ["Date"])
  }

  executeScript(code: string) {
    const script = new Script(code)
    return script.runInContextSync(this.context)
  }

}

window.addEventListener('DOMContentLoaded', async (event) => {
  const experiments = new Experiments();
  experiments.setupVM();
  experiments.setupContext()

  let startTime = Date.now()
  let i = 0
  while(true) {
    experiments.executeScript("hello()")
    i += 1
    if (i > 10000) break
  }
  console.log(Date.now() - startTime, i)

  
  experiments.destroyVM();
});