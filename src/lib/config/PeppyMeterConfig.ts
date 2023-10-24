import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { dirExists, fifoExists, fileExists } from '../utils/System';
import imageSize from 'image-size';
import deepEqual from 'deep-equal';
import pm from '../PeppyMeterContext';
import path from 'path';
import { FIFOPathConfig, PluginConfigSchema, ScreenSizeConfig } from './PluginConfig';
import { METER_TEMPLATE_DIR, PEPPYMETER_CONFIG_FILE, PEPPYMETER_CONFIG_TEMPLATE_FILE } from '../utils/Constants';
import { PeppyAlsaPipePluginListener } from './PeppyAlsaPipePluginListener';
import { FontHelper } from '../utils/FontHelper';

type ConfigKey =
  'template' |
  'meter' |
  'changeInterval' |
  'screenSize' |
  'useCache' |
  'smoothBufferSize' |
  'mouseSupport' |
  'font' |
  'fifoPath';

const CONFIG_KEYS: Array<ConfigKey> = [
  'template',
  'meter',
  'changeInterval',
  'screenSize',
  'useCache',
  'smoothBufferSize',
  'mouseSupport',
  'font',
  'fifoPath'
];

interface ConfigValues {
  template: PluginConfigSchema['template']['defaultValue'],
  meter: PluginConfigSchema['meter']['defaultValue'],
  changeInterval: PluginConfigSchema['changeInterval']['defaultValue'],
  screenSize: PluginConfigSchema['screenSize']['defaultValue'],
  useCache: PluginConfigSchema['useCache']['defaultValue'],
  smoothBufferSize: PluginConfigSchema['smoothBufferSize']['defaultValue'],
  mouseSupport: PluginConfigSchema['mouseSupport']['defaultValue'],
  font: PluginConfigSchema['font']['defaultValue'],
  fifoPath: PluginConfigSchema['fifoPath']['defaultValue']
}

interface Dimensions {
  width?: number;
  height?: number;
}

interface CommitValues {
  template: string;
  meter: string;
  changeInterval: number;
  screenWidth: number;
  screenHeight: number;
  useCache: boolean;
  smoothBufferSize: number;
  mouseSupport: boolean;
  fontPath: string;
  fontLight: string;
  fontRegular: string;
  fontBold: string;
  fifoPath: string;
}

const CONFIG_TMPL_KEY_MAP: Record<keyof CommitValues, string> = {
  template: 'TEMPLATE',
  meter: 'METER',
  changeInterval: 'RANDOM_INTERVAL',
  screenWidth: 'SCREEN_WIDTH',
  screenHeight: 'SCREEN_HEIGHT',
  useCache: 'USE_CACHE',
  smoothBufferSize: 'SMOOTH_BUFFER_SIZE',
  mouseSupport: 'MOUSE_SUPPORT',
  fontPath: 'FONT_PATH',
  fontLight: 'FONT_LIGHT',
  fontRegular: 'FONT_REGULAR',
  fontBold: 'FONT_BOLD',
  fifoPath: 'FIFO_PATH'
} as const;

export default class PeppyMeterConfig {

  static #configTmpl: string | null = null;
  static #configValues: Partial<ConfigValues> = {};
  static #validationErrors: Partial<Record<ConfigKey, string>> = {};
  static #lastCommitedValues: CommitValues | null = null;

  static load() {
    this.#validationErrors = {};

    if (!fileExists(PEPPYMETER_CONFIG_TEMPLATE_FILE)) {
      throw Error('PeppyMeter config template missing');
    }
    this.#configTmpl = readFileSync(PEPPYMETER_CONFIG_TEMPLATE_FILE, { encoding: 'utf-8' });

    this.#assertConfigTmplLoaded();
    this.set('template', pm.getConfigValue('template'), true);
    this.set('meter', pm.getConfigValue('meter'), true);
    this.set('changeInterval', pm.getConfigValue('changeInterval'), true);
    this.set('screenSize', pm.getConfigValue('screenSize'), true);
    this.set('useCache', pm.getConfigValue('useCache'), true);
    this.set('smoothBufferSize', pm.getConfigValue('smoothBufferSize'), true);
    this.set('mouseSupport', pm.getConfigValue('mouseSupport'), true);
    this.set('font', pm.getConfigValue('font'), true);
    this.set('fifoPath', pm.getConfigValue('fifoPath'), true);

    if (Object.keys(this.#validationErrors).length > 0) {
      return {
        errors: this.#validationErrors
      };
    }

    return {
      errors: false
    };
  }

  static #assertConfigTmplLoaded() {
    if (this.#configTmpl === null) {
      throw Error('PeppyMeter config template not loaded');
    }
    return true;
  }

  static set<T extends ConfigKey>(field: T, value: ConfigValues[T], force = false) {
    this.#assertConfigTmplLoaded();
    if (deepEqual(this.#configValues[field], value)) {
      return;
    }
    if (field === 'template') {
      delete this.#validationErrors[field];
      const folder = path.resolve(METER_TEMPLATE_DIR, value as any);
      if (!folder) {
        this.#validationErrors[field] = 'No folder specified';
      }
      else if (!dirExists(folder)) {
        this.#validationErrors[field] = `Folder '${value}' does not exist`;
      }
      if (!this.#validationErrors[field] || force) {
        this.#configValues[field] = value;
      }
      else {
        throw Error(this.#validationErrors[field]);
      }
    }
    else if (field === 'changeInterval') {
      delete this.#validationErrors[field];
      if (typeof value !== 'number' || value < 10) {
        this.#validationErrors[field] = 'Meter Change Interval must be 10 or greater';
      }
      if (!this.#validationErrors[field] || force) {
        this.#configValues[field] = value;
      }
      else {
        throw Error(this.#validationErrors[field]);
      }
    }
    else if (field === 'screenSize') {
      delete this.#validationErrors[field];
      const screenSizeConfig = value as ScreenSizeConfig;
      if (screenSizeConfig.type === 'manual' && (screenSizeConfig.width <= 0 || screenSizeConfig.height <= 0)) {
        this.#validationErrors[field] = 'Invalid screen dimensions';
      }
      if (!this.#validationErrors[field] || force) {
        this.#configValues[field] = value;
      }
      else {
        throw Error(this.#validationErrors[field]);
      }
    }
    else if (field === 'fifoPath') {
      delete this.#validationErrors[field];
      const fifoPathConfig = value as FIFOPathConfig;
      if (fifoPathConfig.type === 'manual' && !fifoPathConfig.path) {
        this.#validationErrors[field] = 'FIFO path not specified';
      }
      if (!this.#validationErrors[field] || force) {
        this.#configValues[field] = value;
      }
      else {
        throw Error(this.#validationErrors[field]);
      }
    }
    else {
      this.#configValues[field] = value;
    }
  }

  static #getDimensionsFromFiles(folder: string, files: string[], pattern: string | string[]): Dimensions | null {
    if (Array.isArray(pattern)) {
      const patterns = [ ...pattern ];
      let dimensions: Dimensions | null = null;
      while (!dimensions && patterns.length > 0) {
        const p = patterns.shift();
        if (p) {
          dimensions = this.#getDimensionsFromFiles(folder, files, p);
        }
      }
      return dimensions;
    }

    let dimensions: Dimensions | null = null;
    for (const file of files) {
      if (file.indexOf(pattern) >= 0) {
        dimensions = imageSize(path.resolve(folder, file));
        if (dimensions.width && dimensions.height) {
          break;
        }
        dimensions = null;
      }
    }
    return dimensions;
  }

  static commit(dryRun = false) {
    this.#assertConfigTmplLoaded();

    const errFields = Object.keys(this.#validationErrors);
    if (errFields.length > 0) {
      throw Error(`PeppyMeter config has invalid values for: ${errFields.join(', ')}`);
    }

    const missingFields = CONFIG_KEYS.filter(
      (f) => this.#configValues[f] == undefined);
    if (missingFields.length > 0) {
      throw Error(`PeppyMeter config is missing the following fields: ${missingFields.join(', ')}`);
    }

    const checkedFieldValues = this.#configValues as ConfigValues;

    const fontConfig = checkedFieldValues['font'];
    const fontDef = FontHelper.getFontDefByConfig(fontConfig);
    if (!fontDef) {
      throw Error(`Could not obtain font definition for '${fontConfig.id}'`);
    }
    else if (!FontHelper.checkPaths(fontDef)) {
      throw Error(`Font path missing for '${fontDef.shortName}'`);
    }

    const screenSizeConfig = checkedFieldValues['screenSize'];
    const screenSize: Dimensions = {};
    if (screenSizeConfig.type === 'manual') {
      screenSize.width = screenSizeConfig.width;
      screenSize.height = screenSizeConfig.height;
    }
    else {
      const folder = path.resolve(METER_TEMPLATE_DIR, checkedFieldValues['template']);
      const files = readdirSync(folder);
      const dimensions = this.#getDimensionsFromFiles(folder, files, [ '-ext.', '_ext.', '-bgr.', '_bgr.' ]);
      if (!dimensions || !dimensions.width || !dimensions.height) {
        throw Error(`Could not obtain valid screen dimensions from ${checkedFieldValues['template']}`);
      }
      screenSize.width = dimensions.width;
      screenSize.height = dimensions.height;
    }

    const fifoPathConfig = checkedFieldValues['fifoPath'];
    let fifoPath: string | null = null;
    if (fifoPathConfig.type === 'manual') {
      fifoPath = fifoPathConfig.path;
    }
    else if (fifoPathConfig.type === 'peppyAlsaPlugin') {
      fifoPath = this.#getFIFOPathFromPeppyAlsaPipePlugin();
      if (!fifoPath) {
        throw Error('Could not obtain FIFO path from Peppy ALSA Pipe plugin');
      }
    }
    if (!fifoPath || !fifoExists(fifoPath)) {
      throw Error('FIFO path empty or does not exist');
    }

    const commitValues: CommitValues = {
      template: checkedFieldValues.template,
      meter: checkedFieldValues.meter.toString(),
      changeInterval: checkedFieldValues.changeInterval,
      screenWidth: screenSize.width as number,
      screenHeight: screenSize.height as number,
      useCache: checkedFieldValues.useCache,
      smoothBufferSize: checkedFieldValues.smoothBufferSize,
      mouseSupport: checkedFieldValues.mouseSupport,
      fontPath: fontDef.path,
      fontLight: fontDef.light,
      fontRegular: fontDef.regular,
      fontBold: fontDef.bold,
      fifoPath: fifoPath
    };

    if (this.#lastCommitedValues && deepEqual(this.#lastCommitedValues, commitValues)) {
      // Return value `false`:  config has not changed.
      return false;
    }

    if (!dryRun) {
      let out = this.#configTmpl as string;
      for (const [ key, value ] of Object.entries(commitValues)) {
        const tmplKey = `\${${CONFIG_TMPL_KEY_MAP[key as keyof CommitValues]}}`;
        let outValue;
        if (typeof value === 'boolean') {
          outValue = value ? 'True' : 'False';
        }
        else if (value == null) {
          outValue = '';
        }
        else {
          outValue = value.toString();
        }
        out = out.replace(tmplKey, outValue);
      }

      writeFileSync(PEPPYMETER_CONFIG_FILE, out, { encoding: 'utf-8' });

      this.#lastCommitedValues = commitValues;
    }

    // Return value `true`: config has changed.
    return true;
  }

  static #getFIFOPathFromPeppyAlsaPipePlugin() {
    return PeppyAlsaPipePluginListener.getFIFOPath();
  }

  static getValidationErrors() {
    if (Object.keys(this.#validationErrors).length > 0) {
      return this.#validationErrors;
    }
    return null;
  }

  static unload() {
    this.#configTmpl = null;
    this.#configValues = {};
    this.#validationErrors = {};
    this.#lastCommitedValues = null;
  }
}
