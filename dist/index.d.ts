declare class ControllerPeppyAlsaPipe {
    #private;
    constructor(context: any);
    getUIConfig(): any;
    getConfigurationFiles(): string[];
    /**
     * Plugin lifecycle
     */
    onVolumioStart(): any;
    onStart(): any;
    onStop(): any;
    configSaveMeterSettings(data: Record<string, any>): Promise<void>;
}
export = ControllerPeppyAlsaPipe;
//# sourceMappingURL=index.d.ts.map