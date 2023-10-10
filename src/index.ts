// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import libQ from 'kew';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import vconf from 'v-conf';

import pm from './lib/PeppyMeterContext';
import { jsPromiseToKew, kewToJSPromise } from './lib/utils/Misc';
import MeterTemplateMonitor from './lib/MeterTemplateMonitor';
import PeppyMeterConfig from './lib/config/PeppyMeterConfig';
import UIConfigHelper from './lib/config/UIConfigHelper';
import { UIConfigSelect } from './lib/config/UIConfig';
import PeppyMeter from './lib/PeppyMeter';
import { PeppyAlsaPipePluginListener } from './lib/config/PeppyAlsaPipePluginListener';
import { FontConfig } from './lib/config/PluginConfig';
import { PREDEFINED_FONTS } from './lib/utils/Constants';
import { FontHelper } from './lib/utils/FontHelper';

class ControllerPeppyAlsaPipe {

  #context: any;
  #config: any;
  #commandRouter: any;
  #meterTemplateMonitor: MeterTemplateMonitor | null;
  #peppyAlsaPipePluginListener: PeppyAlsaPipePluginListener | null;

  constructor(context: any) {
    this.#context = context;
    this.#commandRouter = this.#context.coreCommand;
    this.#meterTemplateMonitor = null;
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
    if (!this.#meterTemplateMonitor) {
      throw Error('MeterTemplateMonitor not initialized');
    }

    const langCode = this.#commandRouter.sharedVars.get('language_code');
    const _uiconf = await kewToJSPromise(this.#commandRouter.i18nJson(
      `${__dirname}/i18n/strings_${langCode}.json`,
      `${__dirname}/i18n/strings_en.json`,
      `${__dirname}/UIConfig.json`));
    const uiconf = UIConfigHelper.observe(_uiconf);

    const meterUIConf = uiconf.section_meter_settings;

    /**
     * Meter conf
     */
    if (this.#meterTemplateMonitor.status === 'initializing' || this.#meterTemplateMonitor.status === 'updating') {
      pm.toast('warning', pm.getI18n('PEPPYMETER_METER_MONITOR_UPDATING'));
    }

    const template = pm.getConfigValue('template');
    const meter = pm.getConfigValue('meter');
    const fontConfig = pm.getConfigValue('font');
    const fifoPathConfig = pm.getConfigValue('fifoPath');

    meterUIConf.content.startDelay.value = pm.getConfigValue('startDelay');
    meterUIConf.content.template.value = {
      value: template,
      label: template
    };
    meterUIConf.content.randomInterval.value = pm.getConfigValue('randomInterval');
    meterUIConf.content.useCache.value = pm.getConfigValue('useCache');
    meterUIConf.content.smoothBufferSize.value = pm.getConfigValue('smoothBufferSize');
    meterUIConf.content.mouseSupport.value = pm.getConfigValue('mouseSupport');

    const selectedFont = FontHelper.getFontDefByConfig(fontConfig) || PREDEFINED_FONTS[0];
    meterUIConf.content.font.value = {
      value: `${selectedFont.type}.${selectedFont.id}`,
      label: selectedFont.name
    };
    meterUIConf.content.font.options = PREDEFINED_FONTS.map((f) => ({
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
    meterUIConf.content.fifoPathType.value = {
      value: fifoPathConfig.type,
      label: fifoPathTypeLabel
    };
    meterUIConf.content.fifoPath.value = fifoPathConfig.path;

    const meterTemplates = this.#meterTemplateMonitor.getTemplates();
    if (meterTemplates.length > 0) {

      const meterSelectElements: UIConfigSelect<any>[] = [];

      meterTemplates.forEach((t) => {
        meterUIConf.content.template.options.push({
          value: t.name,
          label: t.name
        });

        // Create UIConfig `select` element for template's meters
        const meterSelectElement: UIConfigSelect<any> = {
          id: `${t.name}.meter` as any,
          element: 'select',
          label: pm.getI18n('PEPPYMETER_METER'),
          options: [],
          value: {
            value: '',
            label: ''
          },
          visibleIf: {
            field: 'template',
            value: t.name
          }
        };
        let selectedMeter = '';
        if (t.name === template && t.meters.find((m) => m === meter)) {
          selectedMeter = meter.toString();
        }
        if (selectedMeter) {
          meterSelectElement.value = ({
            value: selectedMeter,
            label: selectedMeter
          });
        }
        else {
          meterSelectElement.value = ({
            value: 'random',
            label: pm.getI18n('PEPPYMETER_RANDOM')
          });
        }

        meterSelectElement.options.push(
          {
            value: 'random',
            label: pm.getI18n('PEPPYMETER_RANDOM')
          },
          {
            value: '/SEPARATOR/',
            label: '-'.repeat(pm.getI18n('PEPPYMETER_RANDOM').length)
          },
          ...t.meters.map((m) => ({
            value: m,
            label: m
          }))
        );

        meterSelectElements.push(meterSelectElement);

        if (meterUIConf.saveButton) {
          meterUIConf.saveButton.data.push(meterSelectElement.id as any);
        }
      });
      const insertIndex = meterUIConf.content.findIndex((c: any) => c.id === 'template') + 1;
      meterUIConf.content.splice(insertIndex, 0, ...meterSelectElements);
    }

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
      this.#meterTemplateMonitor = new MeterTemplateMonitor();
      this.#meterTemplateMonitor.start();
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
      if (this.#meterTemplateMonitor) {
        await this.#meterTemplateMonitor.stop();
        this.#meterTemplateMonitor = null;
      }
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

  async configSaveMeterSettings(data: Record<string, any>) {
    const parsed = this.#parseConfigSaveData(data);

    if (parsed.startDelay < 0) {
      pm.toast('error', pm.getI18n('PEPPYMETER_ERR_INVALID_START_DELAY'));
      return;
    }
    const meterKey = `${parsed.template}.meter`;
    if (parsed[meterKey] === '/SEPARATOR/') {
      pm.toast('error', pm.getI18n('PEPPYMETER_ERR_INVALID_METER'));
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

    try {
      PeppyMeterConfig.set('template', parsed.template);
      PeppyMeterConfig.set('meter', parsed[meterKey]);
      PeppyMeterConfig.set('randomInterval', parsed.randomInterval);
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
    pm.setConfigValue('meter', parsed[meterKey]);
    pm.setConfigValue('randomInterval', parsed.randomInterval);
    pm.setConfigValue('useCache', parsed.useCache);
    pm.setConfigValue('smoothBufferSize', parsed.smoothBufferSize);
    pm.setConfigValue('mouseSupport', parsed.mouseSupport);
    pm.setConfigValue('font', fontConfig);
    pm.setConfigValue('fifoPath', fifoPathConfig);

    pm.toast('success', pm.getI18n('PEPPYMETER_SETTINGS_SAVED'));

    if (PeppyMeter.isRunning()) {
      await PeppyMeter.restart({ policy: 'configChanged' });
    }
  }

}

export = ControllerPeppyAlsaPipe;
