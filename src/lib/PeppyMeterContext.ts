import I18nSchema from '../i18n/strings_en.json';
import format from 'string-format';
import fs from 'fs-extra';
import winston from 'winston';
import { PLUGIN_CONFIG_SCHEMA, PluginConfigKey, PluginConfigValue } from './config/PluginConfig';

export type I18nKey = keyof typeof I18nSchema;

export enum PluginType {
  AudioInterface = 'audio_interface',
  MusicService = 'music_service',
  SystemController = 'system_controller',
  SystemHardware = 'system_hardware',
  UserInterface = 'user_interface'
}

class PeppyMeterContext {

  #data: Record<string, any>;
  #pluginContext?: any;
  #pluginConfig?: any;

  #i18n: Record<string, string | Record<string, string>>;
  #i18nDefaults: Record<string, string | Record<string, string>>;
  #i18CallbackRegistered: boolean;

  constructor() {
    this.#data = {};
    this.#i18n = {};
    this.#i18nDefaults = {};
    this.#i18CallbackRegistered = false;
  }

  set<T>(key: string, value: T) {
    this.#data[key] = value;
  }

  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | null {
    return (this.#data[key] !== undefined) ? this.#data[key] : (defaultValue || null);
  }

  delete(key: string) {
    delete this.#data[key];
  }

  init(pluginContext: any, pluginConfig: any) {
    this.#pluginContext = pluginContext;
    this.#pluginConfig = pluginConfig;

    this.#loadI18n();
    if (!this.#i18CallbackRegistered) {
      this.getVolumioSharedVars().registerCallback('language_code', this.#onSystemLanguageChanged.bind(this));
      this.#i18CallbackRegistered = true;
    }
  }

  toast(type: 'success' | 'info' | 'error' | 'warning', message: string, title = 'PeppyMeter') {
    this.#pluginContext.coreCommand.pushToastMessage(type, title, message);
  }

  refreshUIConfig() {
    this.#pluginContext.coreCommand.getUIConfigOnPlugin('user_interface', 'peppymeter', {}).then((config: any) => {
      this.#pluginContext.coreCommand.broadcastMessage('pushUiConfig', config);
    });
  }

  getLogger(): winston.Logger {
    return this.#pluginContext.logger;
  }

  getErrorMessage(message: string, error: any, stack = true): string {
    let result = message;
    if (typeof error == 'object') {
      if (error.message) {
        result += ` ${error.message}`;
      }
      if (stack && error.stack) {
        result += ` ${error.stack}`;
      }
    }
    else if (typeof error == 'string') {
      result += ` ${error}`;
    }
    return result.trim();
  }

  hasConfigKey<T extends PluginConfigKey>(key: T): boolean {
    return this.#pluginConfig.has(key);
  }

  getConfigValue<T extends PluginConfigKey>(key: T): PluginConfigValue<T> {
    const schema = PLUGIN_CONFIG_SCHEMA[key];
    if (this.#pluginConfig.has(key)) {
      const val = this.#pluginConfig.get(key);
      if (schema.json) {
        try {
          return JSON.parse(val);
        }
        catch (e) {
          return schema.defaultValue;
        }
      }
      else {
        return val;
      }
    }
    else {
      return schema.defaultValue;
    }
  }

  deleteConfigValue(key: string) {
    this.#pluginConfig.delete(key);
  }

  setConfigValue<T extends PluginConfigKey>(key: T, value: PluginConfigValue<T>) {
    const schema = PLUGIN_CONFIG_SCHEMA[key];
    this.#pluginConfig.set(key, schema.json ? JSON.stringify(value) : value);
  }

  getVolumioState() {
    return this.#pluginContext.coreCommand.volumioGetState();
  }

  getPlugin(pluginType: PluginType, pluginName: string) {
    return this.#pluginContext.coreCommand.pluginManager.getPlugin(pluginType, pluginName);
  }

  callPluginMethod(type: string, name: string, method: string, data: any = undefined) {
    return this.#pluginContext.coreCommand.executeOnPlugin(type, name, method, data);
  }

  getVolumioSharedVars(): any {
    return this.#pluginContext.coreCommand.sharedVars;
  }

  reset() {
    this.#pluginContext = null;
    this.#pluginConfig = null;

    this.#data = {};
  }

  getI18n(key: I18nKey, ...formatValues: any[]): string {
    let str;
    if (key.indexOf('.') > 0) {
      const mainKey = key.split('.')[0];
      const secKey = key.split('.')[1];
      str = (this.#i18n[mainKey] as Record<string, string>)?.[secKey] ||
        (this.#i18nDefaults[mainKey] as Record<string, string>)?.[secKey] ||
        key;
    }
    else {
      str = (this.#i18n[key] || this.#i18nDefaults[key] || key) as string;
    }

    if (str && formatValues.length) {
      str = format(str, ...formatValues);
    }

    return str;
  }

  #loadI18n() {
    if (this.#pluginContext) {
      const i18nPath = `${__dirname}/../i18n`;

      try {
        this.#i18nDefaults = fs.readJsonSync(`${i18nPath}/strings_en.json`);
      }
      catch (e) {
        this.#i18nDefaults = {};
      }

      try {
        const language_code = this.getVolumioSharedVars().get('language_code');
        this.#i18n = fs.readJsonSync(`${i18nPath}/strings_${language_code}.json`);
      }
      catch (e) {
        this.#i18n = this.#i18nDefaults;
      }
    }
  }

  #onSystemLanguageChanged() {
    this.#loadI18n();
  }

  get volumioCoreCommand(): any {
    return this.#pluginContext?.coreCommand || null;
  }
}

export default new PeppyMeterContext();
