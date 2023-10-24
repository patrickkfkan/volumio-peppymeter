"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _ControllerPeppyAlsaPipe_instances, _ControllerPeppyAlsaPipe_context, _ControllerPeppyAlsaPipe_config, _ControllerPeppyAlsaPipe_commandRouter, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, _ControllerPeppyAlsaPipe_doGetUIConfig, _ControllerPeppyAlsaPipe_initPeppyAlsaPipePluginListener, _ControllerPeppyAlsaPipe_destroyPeppyAlsaPipePluginListener, _ControllerPeppyAlsaPipe_parseConfigSaveData;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const kew_1 = __importDefault(require("kew"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const v_conf_1 = __importDefault(require("v-conf"));
const PeppyMeterContext_1 = __importDefault(require("./lib/PeppyMeterContext"));
const Misc_1 = require("./lib/utils/Misc");
const PeppyMeterConfig_1 = __importDefault(require("./lib/config/PeppyMeterConfig"));
const UIConfigHelper_1 = __importDefault(require("./lib/config/UIConfigHelper"));
const PeppyMeter_1 = __importDefault(require("./lib/PeppyMeter"));
const PeppyAlsaPipePluginListener_1 = require("./lib/config/PeppyAlsaPipePluginListener");
const Constants_1 = require("./lib/utils/Constants");
const FontHelper_1 = require("./lib/utils/FontHelper");
const MeterTemplate_1 = require("./lib/utils/MeterTemplate");
class ControllerPeppyAlsaPipe {
    constructor(context) {
        _ControllerPeppyAlsaPipe_instances.add(this);
        _ControllerPeppyAlsaPipe_context.set(this, void 0);
        _ControllerPeppyAlsaPipe_config.set(this, void 0);
        _ControllerPeppyAlsaPipe_commandRouter.set(this, void 0);
        _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener.set(this, void 0);
        __classPrivateFieldSet(this, _ControllerPeppyAlsaPipe_context, context, "f");
        __classPrivateFieldSet(this, _ControllerPeppyAlsaPipe_commandRouter, __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_context, "f").coreCommand, "f");
        __classPrivateFieldSet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, null, "f");
    }
    getUIConfig() {
        return (0, Misc_1.jsPromiseToKew)(__classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_instances, "m", _ControllerPeppyAlsaPipe_doGetUIConfig).call(this))
            .fail((error) => {
            PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage('[peppymeter] getUIConfig(): Cannot populate configuration:', error));
            throw error;
        });
    }
    getConfigurationFiles() {
        return ['config.json'];
    }
    /**
     * Plugin lifecycle
     */
    onVolumioStart() {
        const configFile = __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_commandRouter, "f").pluginManager.getConfigurationFile(__classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_context, "f"), 'config.json');
        __classPrivateFieldSet(this, _ControllerPeppyAlsaPipe_config, new v_conf_1.default(), "f");
        __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_config, "f").loadFile(configFile);
        return kew_1.default.resolve(true);
    }
    onStart() {
        return (0, Misc_1.jsPromiseToKew)((async () => {
            PeppyMeterContext_1.default.init(__classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_context, "f"), __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_config, "f"));
            PeppyMeterConfig_1.default.load();
            PeppyMeter_1.default.enable();
            __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_instances, "m", _ControllerPeppyAlsaPipe_initPeppyAlsaPipePluginListener).call(this);
        })());
    }
    onStop() {
        return (0, Misc_1.jsPromiseToKew)((async () => {
            __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_instances, "m", _ControllerPeppyAlsaPipe_destroyPeppyAlsaPipePluginListener).call(this);
            await PeppyMeter_1.default.disable();
            PeppyMeterConfig_1.default.unload();
            PeppyMeterContext_1.default.reset();
        })());
    }
    async configSaveGeneralSettings(data) {
        const parsed = __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_instances, "m", _ControllerPeppyAlsaPipe_parseConfigSaveData).call(this, data);
        if (parsed.startDelay < 0) {
            PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_INVALID_START_DELAY'));
            return;
        }
        const font = parsed.font;
        const fontType = font.startsWith('user.') ? 'user' : 'predefined';
        const fontId = font.substring(fontType.length + 1);
        const fontConfig = {
            type: fontType,
            id: fontId
        };
        const fifoPathConfig = {
            type: parsed.fifoPathType,
            path: parsed.fifoPath
        };
        const screenSizeConfig = {
            type: parsed.screenSize,
            width: parsed.screenWidth !== '' ? parseInt(parsed.screenWidth, 10) : 0,
            height: parsed.screenHeight !== '' ? parseInt(parsed.screenHeight, 10) : 0
        };
        const templateChanged = PeppyMeterContext_1.default.getConfigValue('template') !== parsed.template;
        try {
            PeppyMeterConfig_1.default.set('template', parsed.template);
            if (templateChanged) {
                PeppyMeterConfig_1.default.set('meter', 'random');
            }
            PeppyMeterConfig_1.default.set('screenSize', screenSizeConfig);
            PeppyMeterConfig_1.default.set('useCache', parsed.useCache);
            PeppyMeterConfig_1.default.set('smoothBufferSize', parsed.smoothBufferSize);
            PeppyMeterConfig_1.default.set('mouseSupport', parsed.mouseSupport);
            PeppyMeterConfig_1.default.set('font', fontConfig);
            PeppyMeterConfig_1.default.set('fifoPath', fifoPathConfig);
        }
        catch (error) {
            PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getErrorMessage('', error, false));
            return;
        }
        PeppyMeterContext_1.default.setConfigValue('startDelay', parsed.startDelay);
        PeppyMeterContext_1.default.setConfigValue('template', parsed.template);
        if (templateChanged) {
            PeppyMeterContext_1.default.setConfigValue('meterType', 'random');
            PeppyMeterContext_1.default.setConfigValue('meter', 'random');
        }
        PeppyMeterContext_1.default.setConfigValue('screenSize', screenSizeConfig);
        PeppyMeterContext_1.default.setConfigValue('useCache', parsed.useCache);
        PeppyMeterContext_1.default.setConfigValue('smoothBufferSize', parsed.smoothBufferSize);
        PeppyMeterContext_1.default.setConfigValue('mouseSupport', parsed.mouseSupport);
        PeppyMeterContext_1.default.setConfigValue('font', fontConfig);
        PeppyMeterContext_1.default.setConfigValue('fifoPath', fifoPathConfig);
        PeppyMeterContext_1.default.toast('success', PeppyMeterContext_1.default.getI18n('PEPPYMETER_SETTINGS_SAVED'));
        if (templateChanged) {
            PeppyMeterContext_1.default.refreshUIConfig();
        }
        if (PeppyMeter_1.default.isRunning()) {
            await PeppyMeter_1.default.restart({ policy: 'configChanged' });
        }
    }
    async configSaveMeterSettings(data) {
        const parsed = __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_instances, "m", _ControllerPeppyAlsaPipe_parseConfigSaveData).call(this, data);
        let meterValue;
        let meterType;
        let changeInterval = null;
        switch (parsed.meter) {
            case '/SEPARATOR/':
                PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_INVALID_METER'));
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
            let invalidEntry = null;
            if (validate) {
                const meters = (0, MeterTemplate_1.getMeterList)(PeppyMeterContext_1.default.getConfigValue('template'));
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
                PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_INVALID_LIST_METERS', invalidEntry ? ` (${invalidEntry})` : ''));
                return;
            }
        }
        try {
            PeppyMeterConfig_1.default.set('meter', meterValue);
            if (changeInterval !== null) {
                PeppyMeterConfig_1.default.set('changeInterval', changeInterval);
            }
        }
        catch (error) {
            PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getErrorMessage('', error, false));
            return;
        }
        PeppyMeterContext_1.default.setConfigValue('meterType', meterType);
        PeppyMeterContext_1.default.setConfigValue('meter', meterValue);
        if (changeInterval !== null) {
            PeppyMeterContext_1.default.setConfigValue('changeInterval', changeInterval);
        }
        PeppyMeterContext_1.default.toast('success', PeppyMeterContext_1.default.getI18n('PEPPYMETER_SETTINGS_SAVED'));
        if (PeppyMeter_1.default.isRunning()) {
            await PeppyMeter_1.default.restart({ policy: 'configChanged' });
        }
    }
}
_ControllerPeppyAlsaPipe_context = new WeakMap(), _ControllerPeppyAlsaPipe_config = new WeakMap(), _ControllerPeppyAlsaPipe_commandRouter = new WeakMap(), _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener = new WeakMap(), _ControllerPeppyAlsaPipe_instances = new WeakSet(), _ControllerPeppyAlsaPipe_doGetUIConfig = async function _ControllerPeppyAlsaPipe_doGetUIConfig() {
    const langCode = __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_commandRouter, "f").sharedVars.get('language_code');
    const _uiconf = await (0, Misc_1.kewToJSPromise)(__classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_commandRouter, "f").i18nJson(`${__dirname}/i18n/strings_${langCode}.json`, `${__dirname}/i18n/strings_en.json`, `${__dirname}/UIConfig.json`));
    const uiconf = UIConfigHelper_1.default.observe(_uiconf);
    const generalUIConf = uiconf.section_general_settings;
    const meterUIConf = uiconf.section_meter_settings;
    const meterTemplates = await (0, MeterTemplate_1.getTemplateFolderList)();
    /**
     * General conf
     */
    const template = PeppyMeterContext_1.default.getConfigValue('template');
    const screenSize = PeppyMeterContext_1.default.getConfigValue('screenSize');
    const fontConfig = PeppyMeterContext_1.default.getConfigValue('font');
    const fifoPathConfig = PeppyMeterContext_1.default.getConfigValue('fifoPath');
    generalUIConf.content.startDelay.value = PeppyMeterContext_1.default.getConfigValue('startDelay');
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
            label: PeppyMeterContext_1.default.getI18n('PEPPYMETER_AUTO')
        };
    }
    else {
        generalUIConf.content.screenSize.value = {
            value: 'manual',
            label: PeppyMeterContext_1.default.getI18n('PEPPYMETER_MANUAL')
        };
    }
    generalUIConf.content.screenWidth.value = screenSize.width > 0 ? screenSize.width : '';
    generalUIConf.content.screenHeight.value = screenSize.height > 0 ? screenSize.height : '';
    generalUIConf.content.useCache.value = PeppyMeterContext_1.default.getConfigValue('useCache');
    generalUIConf.content.smoothBufferSize.value = PeppyMeterContext_1.default.getConfigValue('smoothBufferSize');
    generalUIConf.content.mouseSupport.value = PeppyMeterContext_1.default.getConfigValue('mouseSupport');
    const selectedFont = FontHelper_1.FontHelper.getFontDefByConfig(fontConfig) || Constants_1.PREDEFINED_FONTS[0];
    generalUIConf.content.font.value = {
        value: `${selectedFont.type}.${selectedFont.id}`,
        label: selectedFont.name
    };
    generalUIConf.content.font.options = Constants_1.PREDEFINED_FONTS.map((f) => ({
        value: `${f.type}.${f.id}`,
        label: f.name
    }));
    let fifoPathTypeLabel = '';
    switch (fifoPathConfig.type) {
        case 'peppyAlsaPlugin':
            fifoPathTypeLabel = PeppyMeterContext_1.default.getI18n('PEPPYMETER_FIFO_PATH_TYPE_PAP');
            break;
        case 'manual':
            fifoPathTypeLabel = PeppyMeterContext_1.default.getI18n('PEPPYMETER_FIFO_PATH_TYPE_MANUAL');
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
    const meterType = PeppyMeterContext_1.default.getConfigValue('meterType');
    const meter = PeppyMeterContext_1.default.getConfigValue('meter');
    let meterValue;
    let meterLabel;
    if (meterType === 'random') {
        meterValue = 'random';
        meterLabel = PeppyMeterContext_1.default.getI18n('PEPPYMETER_RANDOM');
    }
    else if (meterType === 'list') {
        meterValue = '/LIST/';
        meterLabel = PeppyMeterContext_1.default.getI18n('PEPPYMETER_LIST');
    }
    else {
        meterValue = meterLabel = meter.toString();
    }
    meterUIConf.content.meter.value = {
        value: meterValue,
        label: meterLabel
    };
    const meters = (0, MeterTemplate_1.getMeterList)(template);
    if (meters.length > 0) {
        meterUIConf.content.meter.options.push({
            value: 'random',
            label: PeppyMeterContext_1.default.getI18n('PEPPYMETER_RANDOM')
        }, {
            value: '/LIST/',
            label: PeppyMeterContext_1.default.getI18n('PEPPYMETER_LIST')
        }, {
            value: '/SEPARATOR/',
            label: '-'.repeat(PeppyMeterContext_1.default.getI18n('PEPPYMETER_RANDOM').length)
        }, ...meters.map((m) => ({
            value: m,
            label: m
        })));
    }
    if (meterType === 'list') {
        meterUIConf.content.listMeters.value = meter.toString();
    }
    meterUIConf.content.randomChangeInterval.value = PeppyMeterContext_1.default.getConfigValue('changeInterval');
    meterUIConf.content.listChangeInterval.value = PeppyMeterContext_1.default.getConfigValue('changeInterval');
    return uiconf;
}, _ControllerPeppyAlsaPipe_initPeppyAlsaPipePluginListener = function _ControllerPeppyAlsaPipe_initPeppyAlsaPipePluginListener() {
    if (__classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, "f")) {
        __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_instances, "m", _ControllerPeppyAlsaPipe_destroyPeppyAlsaPipePluginListener).call(this);
    }
    __classPrivateFieldSet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, new PeppyAlsaPipePluginListener_1.PeppyAlsaPipePluginListener(), "f");
    __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, "f").on('fifoPathChange', async () => {
        if (PeppyMeterContext_1.default.getConfigValue('fifoPath').type === 'peppyAlsaPlugin') {
            await PeppyMeter_1.default.restart({ policy: 'configChanged' });
        }
    });
    __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, "f").start();
}, _ControllerPeppyAlsaPipe_destroyPeppyAlsaPipePluginListener = function _ControllerPeppyAlsaPipe_destroyPeppyAlsaPipePluginListener() {
    if (__classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, "f")) {
        __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, "f").removeAllListeners();
        __classPrivateFieldGet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, "f").stop();
        __classPrivateFieldSet(this, _ControllerPeppyAlsaPipe_peppyAlsaPipePluginListener, null, "f");
    }
}, _ControllerPeppyAlsaPipe_parseConfigSaveData = function _ControllerPeppyAlsaPipe_parseConfigSaveData(data) {
    const parsed = {};
    for (const [key, value] of Object.entries(data)) {
        // Check if dropdown selection
        if (typeof value === 'object' && value && Reflect.has(value, 'value')) {
            parsed[key] = value.value;
        }
        else {
            parsed[key] = value;
        }
    }
    return parsed;
};
module.exports = ControllerPeppyAlsaPipe;
//# sourceMappingURL=index.js.map