declare global {
    interface Window {
        eval: CallableFunction;
        vmEval: (code: any, scope: any) => any;
        vmEvalAsync: (code: any, scope: any) => Promise<any>;
    }
}
declare class VM {
    iframe: HTMLIFrameElement;
    iframeId: string;
    eval: any;
    vmEvalSync: (code: any, scope: any) => any;
    vmEvalAsync: (code: any, scope: any) => Promise<any>;
    frameWindow: Window;
    private nonDeletableKeys;
    init(): void;
    private setupIframe;
    private setupIframeContext;
    createContext(data?: Record<string, any>, excludeKeys?: any[]): Context;
    destroy(): void;
}

declare class Script {
    protected code: string;
    private _compiledCode;
    constructor(code: string);
    get compiledCode(): any;
    runInContext(context: Context, extraContext?: Record<string, any>): Promise<unknown>;
    runInContextSync(context: Context, extraContext?: Record<string, any>): unknown;
}

interface ContextOptions {
    excludeKeys: string[];
}
declare class Context {
    private contextData;
    private vm;
    options: ContextOptions;
    constructor(contextData: Record<string, any>, vm: VM, options?: ContextOptions);
    executeSync<T extends unknown = unknown>(script: Script, extraContext?: Record<string, any>): T | void;
    execute<T extends unknown = unknown>(script: Script, extraContext?: Record<string, any>): Promise<T | void>;
}

export { Context, Script, VM };
