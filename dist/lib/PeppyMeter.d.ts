export interface PeppyMeterRestartOptions {
    policy?: 'always' | 'configChanged';
}
export default class PeppyMeterManager {
    #private;
    static enable(): void;
    static disable(): Promise<void>;
    static isEnabled(): boolean;
    static stop(): Promise<void>;
    static restart(options?: PeppyMeterRestartOptions): Promise<void>;
    static isRunning(): boolean;
}
//# sourceMappingURL=PeppyMeter.d.ts.map