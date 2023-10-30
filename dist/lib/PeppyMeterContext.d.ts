import I18nSchema from '../i18n/strings_en.json';
import winston from 'winston';
import { PluginConfigKey, PluginConfigValue } from './config/PluginConfig';
export type I18nKey = keyof typeof I18nSchema;
export declare enum PluginType {
    AudioInterface = "audio_interface",
    MusicService = "music_service",
    SystemController = "system_controller",
    SystemHardware = "system_hardware",
    UserInterface = "user_interface"
}
declare class PeppyMeterContext {
    #private;
    constructor();
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | null;
    get<T>(key: string, defaultValue: T): T;
    delete(key: string): void;
    init(pluginContext: any, pluginConfig: any): void;
    toast(type: 'success' | 'info' | 'error' | 'warning', message: string, title?: string): void;
    refreshUIConfig(): void;
    getLogger(): winston.Logger;
    getErrorMessage(message: string, error: any, stack?: boolean): string;
    hasConfigKey<T extends PluginConfigKey>(key: T): boolean;
    getConfigValue<T extends PluginConfigKey>(key: T): PluginConfigValue<T>;
    deleteConfigValue(key: string): void;
    setConfigValue<T extends PluginConfigKey>(key: T, value: PluginConfigValue<T>): void;
    getVolumioState(): any;
    getPlugin(pluginType: PluginType, pluginName: string): any;
    callPluginMethod(type: string, name: string, method: string, data?: any): any;
    getVolumioSharedVars(): any;
    reset(): void;
    getI18n(key: I18nKey, ...formatValues: any[]): string;
    get volumioCoreCommand(): any;
}
declare const _default: PeppyMeterContext;
export default _default;
//# sourceMappingURL=PeppyMeterContext.d.ts.map