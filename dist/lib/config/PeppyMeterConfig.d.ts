import { PluginConfigSchema } from './PluginConfig';
type ConfigKey = 'template' | 'meter' | 'changeInterval' | 'screenSize' | 'useCache' | 'smoothBufferSize' | 'mouseSupport' | 'font' | 'fifoPath';
interface ConfigValues {
    template: PluginConfigSchema['template']['defaultValue'];
    meter: PluginConfigSchema['meter']['defaultValue'];
    changeInterval: PluginConfigSchema['changeInterval']['defaultValue'];
    screenSize: PluginConfigSchema['screenSize']['defaultValue'];
    useCache: PluginConfigSchema['useCache']['defaultValue'];
    smoothBufferSize: PluginConfigSchema['smoothBufferSize']['defaultValue'];
    mouseSupport: PluginConfigSchema['mouseSupport']['defaultValue'];
    font: PluginConfigSchema['font']['defaultValue'];
    fifoPath: PluginConfigSchema['fifoPath']['defaultValue'];
}
export default class PeppyMeterConfig {
    #private;
    static load(): {
        errors: Partial<Record<ConfigKey, string>>;
    } | {
        errors: boolean;
    };
    static set<T extends ConfigKey>(field: T, value: ConfigValues[T], force?: boolean): void;
    static commit(dryRun?: boolean): boolean;
    static getValidationErrors(): Partial<Record<ConfigKey, string>> | null;
    static unload(): void;
}
export {};
//# sourceMappingURL=PeppyMeterConfig.d.ts.map