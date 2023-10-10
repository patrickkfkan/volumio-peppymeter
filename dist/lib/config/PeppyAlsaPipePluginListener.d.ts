/// <reference types="node" />
import EventEmitter from 'events';
export declare class PeppyAlsaPipePluginListener extends EventEmitter {
    #private;
    constructor();
    static getFIFOPath(): string | null;
    start(): void;
    stop(): void;
    on(event: 'fifoPathChange', listener: (fifoPath: string | null) => void): this;
}
//# sourceMappingURL=PeppyAlsaPipePluginListener.d.ts.map