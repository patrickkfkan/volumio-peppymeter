export type PluginConfigKey = keyof PluginConfigSchema;
export type PluginConfigValue<T extends PluginConfigKey> = PluginConfigSchema[T]['defaultValue'];
export interface FIFOPathConfig {
    type: 'peppyAlsaPlugin' | 'manual';
    path: string;
}
export interface PluginConfigSchemaEntry<T, U = false> {
    defaultValue: T;
    json: U;
}
export interface FontConfig {
    id: string;
    type: 'predefined' | 'user';
}
export interface FontDef extends FontConfig {
    name: string;
    shortName: string;
    path: string;
    light: string;
    regular: string;
    bold: string;
}
export interface PluginConfigSchema {
    startDelay: PluginConfigSchemaEntry<number>;
    template: PluginConfigSchemaEntry<string>;
    meter: PluginConfigSchemaEntry<'random' | String>;
    randomInterval: PluginConfigSchemaEntry<number>;
    useCache: PluginConfigSchemaEntry<boolean>;
    smoothBufferSize: PluginConfigSchemaEntry<number>;
    mouseSupport: PluginConfigSchemaEntry<boolean>;
    font: PluginConfigSchemaEntry<FontConfig, true>;
    fifoPath: PluginConfigSchemaEntry<FIFOPathConfig, true>;
}
export declare const PLUGIN_CONFIG_SCHEMA: PluginConfigSchema;
//# sourceMappingURL=PluginConfig.d.ts.map