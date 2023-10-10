export interface ShellCommandOptions {
    sudo?: boolean;
    logging?: boolean;
}
export declare class ShellCommand {
    #private;
    constructor(cmd: string, options?: ShellCommandOptions);
    exec(): Promise<string>;
    setLogging(value: boolean): void;
    kill(): Promise<void>;
    get status(): "ready" | "running" | "killing";
}
//# sourceMappingURL=ShellCommand.d.ts.map