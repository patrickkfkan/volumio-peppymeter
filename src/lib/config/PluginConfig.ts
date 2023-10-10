import { FONT_LATO } from '../utils/Constants';

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
  type: 'predefined' | 'user'; // Type 'user' not yet implemented
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

const defaultFontConfig: FontConfig = {
  id: FONT_LATO.id,
  type: FONT_LATO.type
};

export const PLUGIN_CONFIG_SCHEMA: PluginConfigSchema = {
  startDelay: { defaultValue: 3, json: false },
  template: { defaultValue: '', json: false },
  meter: { defaultValue: 'random', json: false},
  randomInterval: { defaultValue: 60, json: false},
  useCache: { defaultValue: false, json: false},
  smoothBufferSize: { defaultValue: 8, json: false},
  mouseSupport: { defaultValue: true, json: false },
  font: { defaultValue: defaultFontConfig, json: true },
  fifoPath: { defaultValue: { type: 'peppyAlsaPlugin', path: '' }, json: true}
};
