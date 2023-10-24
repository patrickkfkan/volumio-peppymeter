// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import libQ from 'kew';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import vconf from 'v-conf';

import pm from './lib/PeppyMeterContext';
import { jsPromiseToKew, kewToJSPromise } from './lib/utils/Misc';
import PeppyMeterConfig from './lib/config/PeppyMeterConfig';
import UIConfigHelper from './lib/config/UIConfigHelper';
import PeppyMeter from './lib/PeppyMeter';
import { PeppyAlsaPipePluginListener } from './lib/config/PeppyAlsaPipePluginListener';
import { FontConfig, ScreenSizeConfig } from './lib/config/PluginConfig';
import { PREDEFINED_FONTS } from './lib/utils/Constants';
import { FontHelper } from './lib/utils/FontHelper';
import { getMeterList, getTemplateFolderList } from './lib/utils/MeterTemplate';

class ControllerPeppyAlsaPipe {

  #context: any;
  #config: any;
  #commandRouter: any;
  #peppyAlsaPipePluginListener: PeppyAlsaPipePluginListener | null;

  constructor(context: any) {
    this.#context = context;
    this.#commandRouter = this.#context.coreCommand;
    this.#peppyAlsaPipePluginListener = null;
  }

  getUIConfig() {
    return jsPromiseToKew(this.#doGetUIConfig())
      .fail((error: any) => {
        pm.getLogger().error(
          pm.getErrorMessage('[peppymeter] getUIConfig(): Cannot populate configuration:', error));
        throw error;
      });
  }

  async #doGetUIConfig() {
    const langCode = this.#commandRouter.sharedVars.get('language_code');
    const _uiconf = await kewToJSPromise(this.#commandRouter.i18nJson(
      `${__dirname}/i18n/strings_${langCode}.json`,
      `${__dirname}/i18n/strings_en.json`,
      `${__dirname}/UIConfig.json`));
    const uiconf = UIConfigHelper.observe(_uiconf);

    const generalUIConf = uiconf.section_general_settings;
    const meterUIConf = uiconf.section_meter_settings;

    const meterTemplates = await getTemplateFolderList();

    /**
     * General conf
     */
    const template = pm.getConfigValue('template');
    const screenSize = pm.getConfigValue('screenSize');
    const fontConfig = pm.getConfigValue('font');
    const fifoPathConfig = pm.getConfigValue('fifoPath');

    generalUIConf.content.startDelay.value = pm.getConfigValue('startDelay');
    generalUIConf.content.template.value = {
      value: template,
      label: template
    };
    generalUIConf.content.template.options = meterTemplates.map((t) => ({
      value: t,
      label: t
    }));

    if (screenSize.type === 'auto') {
      generalUIConf.content.screenSize.value = {
        value: 'auto',
        label: pm.getI18n('PEPPYMETER_AUTO')
      };
    }
    else {
      generalUIConf.content.screenSize.value = {
        value: 'manual',
        label: pm.getI18n('PEPPYMETER_MANUAL')
      };
    }
    generalUIConf.content.screenWidth.value = screenSize.width > 0 ? screenSize.width : '';
    generalUIConf.content.screenHeight.value = screenSize.height > 0 ? screenSize.height : '';

    generalUIConf.content.useCache.value = pm.getConfigValue('useCache');
    generalUIConf.content.smoothBufferSize.value = pm.getConfigValue('smoothBufferSize');
    generalUIConf.content.mouseSupport.value = pm.getConfigValue('mouseSupport');

    const selectedFont = FontHelper.getFontDefByConfig(fontConfig) || PREDEFINED_FONTS[0];
    generalUIConf.content.font.value = {
      value: `${selectedFont.type}.${selectedFont.id}`,
      label: selectedFont.name
    };
    generalUIConf.content.font.options = PREDEFINED_FONTS.map((f) => ({
      value: `${f.type}.${f.id}`,
      label: f.name
    }));

    let fifoPathTypeLabel = '';
    switch (fifoPathConfig.type) {
      case 'peppyAlsaPlugin':
        fifoPathTypeLabel = pm.getI18n('PEPPYMETER_FIFO_PATH_TYPE_PAP');
        break;
      case 'manual':
        fifoPathTypeLabel = pm.getI18n('PEPPYMETER_FIFO_PATH_TYPE_MANUAL');
        break;
    }
    generalUIConf.content.fifoPathType.value = {
      value: fifoPathConfig.type,
      label: fifoPathTypeLabel
    };
    generalUIConf.content.fifoPath.value = fifoPathConfig.path;

    /**
     * Meter conf
     */
    const meterType = pm.getConfigValue('meterType');
    const meter = pm.getConfigValue('meter');
    let meterValue: string;
    let meterLabel: string;
    if (meterType === 'random') {
      meterValue = 'random';
      meterLabel = pm.getI18n('PEPPYMETER_RANDOM');
    }
    else if (meterType === 'list') {
      meterValue = '/LIST/';
      meterLabel = pm.getI18n('PEPPYMETER_LIST');
    }
    else {
      meterValue = meterLabel = meter.toString();
    }
    meterUIConf.content.meter.value = {
      value: meterValue,
      label: meterLabel
    };
    const meters = getMeterList(template);
    if (meters.length > 0) {
      meterUIConf.content.meter.options.push(
        {
          value: 'random',
          label: pm.getI18n('PEPPYMETER_RANDOM')
        },
        {
          value: '/LIST/',
          label: pm.getI18n('PEPPYMETER_LIST')
        },
        {
          value: '/SEPARATOR/',
          label: '-'.repeat(pm.getI18n('PEPPYMETER_RANDOM').length)
        },
        ...meters.map((m) => ({
          value: m,
          label: m
        }))
      );
    }
    if (meterType === 'list') {
      meterUIConf.content.listMeters.value = meter.toString();
    }
    meterUIConf.content.randomChangeInterval.value = pm.getConfigValue('changeInterval');
    meterUIConf.content.listChangeInterval.value = pm.getConfigValue('changeInterval');

    return uiconf;
  }

  getConfigurationFiles() {
    return [ 'config.json' ];
  }

  /**
   * Plugin lifecycle
   */

  onVolumioStart() {
    const configFile = this.#commandRouter.pluginManager.getConfigurationFile(this.#context, 'config.json');
    this.#config = new vconf();
    this.#config.loadFile(configFile);
    return libQ.resolve(true);
  }

  onStart() {
    return jsPromiseToKew<void>((async () => {
      pm.init(this.#context, this.#config);
      PeppyMeterConfig.load();
      PeppyMeter.enable();
      this.#initPeppyAlsaPipePluginListener();
    })());
  }

  onStop() {
    return jsPromiseToKew<void>((async () => {
      this.#destroyPeppyAlsaPipePluginListener();
      await PeppyMeter.disable();
      PeppyMeterConfig.unload();
      pm.reset();
    })());
  }

  #initPeppyAlsaPipePluginListener() {
    if (this.#peppyAlsaPipePluginListener) {
      this.#destroyPeppyAlsaPipePluginListener();
    }
    this.#peppyAlsaPipePluginListener = new PeppyAlsaPipePluginListener();
    this.#peppyAlsaPipePluginListener.on('fifoPathChange', async () => {
      if (pm.getConfigValue('fifoPath').type === 'peppyAlsaPlugin') {
        await PeppyMeter.restart({ policy: 'configChanged' });
      }
    });
    this.#peppyAlsaPipePluginListener.start();
  }

  #destroyPeppyAlsaPipePluginListener() {
    if (this.#peppyAlsaPipePluginListener) {
      this.#peppyAlsaPipePluginListener.removeAllListeners();
      this.#peppyAlsaPipePluginListener.stop();
      this.#peppyAlsaPipePluginListener = null;
    }
  }

  /**
   * Config
   */

  #parseConfigSaveData(data: object) {
    const parsed: Record<string, any> = {};
    for (const [ key, value ] of Object.entries(data)) {
      // Check if dropdown selection
      if (typeof value === 'object' && value && Reflect.has(value, 'value')) {
        parsed[key] = value.value;
      }
      else {
        parsed[key] = value;
      }
    }
    return parsed;
  }

  async configSaveGeneralSettings(data: Record<string, any>) {
    const parsed = this.#parseConfigSaveData(data);

    if (parsed.startDelay < 0) {
      pm.toast('error', pm.getI18n('PEPPYMETER_ERR_INVALID_START_DELAY'));
      return;
    }
    const font = parsed.font as string;
    const fontType = font.startsWith('user.') ? 'user' : 'predefined';
    const fontId = font.substring(fontType.length + 1);
    const fontConfig: FontConfig = {
      type: fontType,
      id: fontId
    };

    const fifoPathConfig = {
      type: parsed.fifoPathType,
      path: parsed.fifoPath
    };

    const screenSizeConfig: ScreenSizeConfig = {
      type: parsed.screenSize,
      width: parsed.screenWidth !== '' ? parseInt(parsed.screenWidth, 10) : 0,
      height: parsed.screenHeight !== '' ? parseInt(parsed.screenHeight, 10) : 0
    };

    const templateChanged = pm.getConfigValue('template') !== parsed.template;
    try {
      PeppyMeterConfig.set('template', parsed.template);
      if (templateChanged) {
        PeppyMeterConfig.set('meter', 'random');
      }
      PeppyMeterConfig.set('screenSize', screenSizeConfig);
      PeppyMeterConfig.set('useCache', parsed.useCache);
      PeppyMeterConfig.set('smoothBufferSize', parsed.smoothBufferSize);
      PeppyMeterConfig.set('mouseSupport', parsed.mouseSupport);
      PeppyMeterConfig.set('font', fontConfig);
      PeppyMeterConfig.set('fifoPath', fifoPathConfig);
    }
    catch (error) {
      pm.toast('error', pm.getErrorMessage('', error, false));
      return;
    }

    pm.setConfigValue('startDelay', parsed.startDelay);
    pm.setConfigValue('template', parsed.template);
    if (templateChanged) {
      pm.setConfigValue('meterType', 'random');
      pm.setConfigValue('meter', 'random');
    }
    pm.setConfigValue('screenSize', screenSizeConfig);
    pm.setConfigValue('useCache', parsed.useCache);
    pm.setConfigValue('smoothBufferSize', parsed.smoothBufferSize);
    pm.setConfigValue('mouseSupport', parsed.mouseSupport);
    pm.setConfigValue('font', fontConfig);
    pm.setConfigValue('fifoPath', fifoPathConfig);

    pm.toast('success', pm.getI18n('PEPPYMETER_SETTINGS_SAVED'));

    if (templateChanged) {
      pm.refreshUIConfig();
    }

    if (PeppyMeter.isRunning()) {
      await PeppyMeter.restart({ policy: 'configChanged' });
    }
  }

  async configSaveMeterSettings(data: Record<string, any>) {
    const parsed = this.#parseConfigSaveData(data);

    let meterValue: string;
    let meterType: 'random' | 'list' | 'single';
    let changeInterval: number | null = null;
    switch (parsed.meter) {
      case '/SEPARATOR/':
        pm.toast('error', pm.getI18n('PEPPYMETER_ERR_INVALID_METER'));
        return;
      case 'random':
        meterValue = 'random';
        meterType = 'random';
        changeInterval = parsed.randomChangeInterval;
        break;
      case '/LIST/':
        meterValue = parsed.listMeters.trim();
        meterType = 'list';
        changeInterval = parsed.listChangeInterval;
        break;
      default:
        meterValue = parsed.meter;
        meterType = 'single';
    }

    if (meterType === 'list') {
      let validate = !!meterValue;
      let invalidEntry: string | null = null;
      if (validate) {
        const meters = getMeterList(pm.getConfigValue('template'));
        const entries = meterValue.split(',').map((m) => m.trim());
        for (const entry of entries) {
          if (!meters.find((m) => m === entry)) {
            invalidEntry = entry;
            validate = false;
            break;
          }
        }
      }
      if (!validate) {
        pm.toast('error', pm.getI18n('PEPPYMETER_ERR_INVALID_LIST_METERS', invalidEntry ? ` (${invalidEntry})` : ''));
      }
      return;
    }

    try {
      PeppyMeterConfig.set('meter', meterValue);
      if (changeInterval !== null) {
        PeppyMeterConfig.set('changeInterval', changeInterval);
      }
    }
    catch (error) {
      pm.toast('error', pm.getErrorMessage('', error, false));
      return;
    }

    pm.setConfigValue('meterType', meterType);
    pm.setConfigValue('meter', meterValue);
    if (changeInterval !== null) {
      pm.setConfigValue('changeInterval', changeInterval);
    }

    pm.toast('success', pm.getI18n('PEPPYMETER_SETTINGS_SAVED'));

    if (PeppyMeter.isRunning()) {
      await PeppyMeter.restart({ policy: 'configChanged' });
    }
  }
}

export = ControllerPeppyAlsaPipe;
