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
var _a, _PeppyMeterConfig_configTmpl, _PeppyMeterConfig_configValues, _PeppyMeterConfig_validationErrors, _PeppyMeterConfig_lastCommitedValues, _PeppyMeterConfig_assertConfigTmplLoaded, _PeppyMeterConfig_getDimensionsFromFiles, _PeppyMeterConfig_getFIFOPathFromPeppyAlsaPipePlugin;
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const System_1 = require("../utils/System");
const image_size_1 = __importDefault(require("image-size"));
const deep_equal_1 = __importDefault(require("deep-equal"));
const PeppyMeterContext_1 = __importDefault(require("../PeppyMeterContext"));
const path_1 = __importDefault(require("path"));
const Constants_1 = require("../utils/Constants");
const PeppyAlsaPipePluginListener_1 = require("./PeppyAlsaPipePluginListener");
const FontHelper_1 = require("../utils/FontHelper");
const CONFIG_KEYS = [
    'template',
    'meter',
    'changeInterval',
    'useCache',
    'smoothBufferSize',
    'mouseSupport',
    'font',
    'fifoPath',
    'screenWidth',
    'screenHeight'
];
const CONFIG_TMPL_KEY_MAP = {
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
};
class PeppyMeterConfig {
    static load() {
        __classPrivateFieldSet(this, _a, {}, "f", _PeppyMeterConfig_validationErrors);
        if (!(0, System_1.fileExists)(Constants_1.PEPPYMETER_CONFIG_TEMPLATE_FILE)) {
            throw Error('PeppyMeter config template missing');
        }
        __classPrivateFieldSet(this, _a, (0, fs_1.readFileSync)(Constants_1.PEPPYMETER_CONFIG_TEMPLATE_FILE, { encoding: 'utf-8' }), "f", _PeppyMeterConfig_configTmpl);
        __classPrivateFieldGet(this, _a, "m", _PeppyMeterConfig_assertConfigTmplLoaded).call(this);
        this.set('template', PeppyMeterContext_1.default.getConfigValue('template'), true);
        this.set('meter', PeppyMeterContext_1.default.getConfigValue('meter'), true);
        this.set('changeInterval', PeppyMeterContext_1.default.getConfigValue('changeInterval'), true);
        this.set('useCache', PeppyMeterContext_1.default.getConfigValue('useCache'), true);
        this.set('smoothBufferSize', PeppyMeterContext_1.default.getConfigValue('smoothBufferSize'), true);
        this.set('mouseSupport', PeppyMeterContext_1.default.getConfigValue('mouseSupport'), true);
        this.set('font', PeppyMeterContext_1.default.getConfigValue('font'), true);
        this.set('fifoPath', PeppyMeterContext_1.default.getConfigValue('fifoPath'), true);
        if (Object.keys(__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)).length > 0) {
            return {
                errors: __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)
            };
        }
        return {
            errors: false
        };
    }
    static set(field, value, force = false) {
        __classPrivateFieldGet(this, _a, "m", _PeppyMeterConfig_assertConfigTmplLoaded).call(this);
        if ((0, deep_equal_1.default)(__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configValues)[field], value)) {
            return;
        }
        if (field === 'template') {
            delete __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field];
            const folder = path_1.default.resolve(Constants_1.METER_TEMPLATE_DIR, value);
            let dimensions = null;
            if (!folder) {
                __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] = 'No folder specified';
            }
            else if (!(0, System_1.dirExists)(folder)) {
                __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] = `Folder '${value}' does not exist`;
            }
            else {
                const files = (0, fs_1.readdirSync)(folder);
                dimensions = __classPrivateFieldGet(this, _a, "m", _PeppyMeterConfig_getDimensionsFromFiles).call(this, folder, files, ['-ext.', '_ext.', '-bgr.', '_bgr.']);
            }
            if (!__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] && (!dimensions || !dimensions.width || !dimensions.height)) {
                __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] = `Could not obtain valid screen dimensions from '${value}'`;
            }
            if (!__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] || force) {
                __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configValues)[field] = value;
                this.set('screenWidth', dimensions?.width || null);
                this.set('screenHeight', dimensions?.height || null);
            }
            else {
                throw Error(__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field]);
            }
        }
        else if (field === 'changeInterval') {
            delete __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field];
            if (typeof value !== 'number' || value < 10) {
                __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] = 'Meter Change Interval must be 10 or greater';
            }
            if (!__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] || force) {
                __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configValues)[field] = value;
            }
            else {
                throw Error(__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field]);
            }
        }
        else if (field === 'fifoPath') {
            delete __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field];
            const fifoPathConfig = value;
            if (fifoPathConfig.type === 'manual' && !fifoPathConfig.path) {
                __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] = 'FIFO path not specified';
            }
            if (!__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field] || force) {
                __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configValues)[field] = value;
            }
            else {
                throw Error(__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)[field]);
            }
        }
        else {
            __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configValues)[field] = value;
        }
    }
    static commit(dryRun = false) {
        __classPrivateFieldGet(this, _a, "m", _PeppyMeterConfig_assertConfigTmplLoaded).call(this);
        const errFields = Object.keys(__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors));
        if (errFields.length > 0) {
            throw Error(`PeppyMeter config has invalid values for: ${errFields.join(', ')}`);
        }
        const missingFields = CONFIG_KEYS.filter((f) => __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configValues)[f] == undefined);
        if (missingFields.length > 0) {
            throw Error(`PeppyMeter config is missing the following fields: ${missingFields.join(', ')}`);
        }
        const checkedFieldValues = __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configValues);
        const fontConfig = checkedFieldValues['font'];
        const fontDef = FontHelper_1.FontHelper.getFontDefByConfig(fontConfig);
        if (!fontDef) {
            throw Error(`Could not obtain font definition for '${fontConfig.id}'`);
        }
        else if (!FontHelper_1.FontHelper.checkPaths(fontDef)) {
            throw Error(`Font path missing for '${fontDef.shortName}'`);
        }
        const fifoPathConfig = checkedFieldValues['fifoPath'];
        let fifoPath = null;
        if (fifoPathConfig.type === 'manual') {
            fifoPath = fifoPathConfig.path;
        }
        else if (fifoPathConfig.type === 'peppyAlsaPlugin') {
            fifoPath = __classPrivateFieldGet(this, _a, "m", _PeppyMeterConfig_getFIFOPathFromPeppyAlsaPipePlugin).call(this);
            if (!fifoPath) {
                throw Error('Could not obtain FIFO path from Peppy ALSA Pipe plugin');
            }
        }
        if (!fifoPath || !(0, System_1.fifoExists)(fifoPath)) {
            throw Error('FIFO path empty or does not exist');
        }
        const commitValues = {
            template: checkedFieldValues.template,
            meter: checkedFieldValues.meter.toString(),
            changeInterval: checkedFieldValues.changeInterval,
            screenWidth: checkedFieldValues.screenWidth,
            screenHeight: checkedFieldValues.screenHeight,
            useCache: checkedFieldValues.useCache,
            smoothBufferSize: checkedFieldValues.smoothBufferSize,
            mouseSupport: checkedFieldValues.mouseSupport,
            fontPath: fontDef.path,
            fontLight: fontDef.light,
            fontRegular: fontDef.regular,
            fontBold: fontDef.bold,
            fifoPath: fifoPath
        };
        if (__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_lastCommitedValues) && (0, deep_equal_1.default)(__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_lastCommitedValues), commitValues)) {
            // Return value `false`:  config has not changed.
            return false;
        }
        if (!dryRun) {
            let out = __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configTmpl);
            for (const [key, value] of Object.entries(commitValues)) {
                const tmplKey = `\${${CONFIG_TMPL_KEY_MAP[key]}}`;
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
            (0, fs_1.writeFileSync)(Constants_1.PEPPYMETER_CONFIG_FILE, out, { encoding: 'utf-8' });
            __classPrivateFieldSet(this, _a, commitValues, "f", _PeppyMeterConfig_lastCommitedValues);
        }
        // Return value `true`: config has changed.
        return true;
    }
    static getValidationErrors() {
        if (Object.keys(__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors)).length > 0) {
            return __classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_validationErrors);
        }
        return null;
    }
    static unload() {
        __classPrivateFieldSet(this, _a, null, "f", _PeppyMeterConfig_configTmpl);
        __classPrivateFieldSet(this, _a, {}, "f", _PeppyMeterConfig_configValues);
        __classPrivateFieldSet(this, _a, {}, "f", _PeppyMeterConfig_validationErrors);
        __classPrivateFieldSet(this, _a, null, "f", _PeppyMeterConfig_lastCommitedValues);
    }
}
exports.default = PeppyMeterConfig;
_a = PeppyMeterConfig, _PeppyMeterConfig_assertConfigTmplLoaded = function _PeppyMeterConfig_assertConfigTmplLoaded() {
    if (__classPrivateFieldGet(this, _a, "f", _PeppyMeterConfig_configTmpl) === null) {
        throw Error('PeppyMeter config template not loaded');
    }
    return true;
}, _PeppyMeterConfig_getDimensionsFromFiles = function _PeppyMeterConfig_getDimensionsFromFiles(folder, files, pattern) {
    if (Array.isArray(pattern)) {
        const patterns = [...pattern];
        let dimensions = null;
        while (!dimensions && patterns.length > 0) {
            const p = patterns.shift();
            if (p) {
                dimensions = __classPrivateFieldGet(this, _a, "m", _PeppyMeterConfig_getDimensionsFromFiles).call(this, folder, files, p);
            }
        }
        return dimensions;
    }
    let dimensions = null;
    for (const file of files) {
        if (file.indexOf(pattern) >= 0) {
            dimensions = (0, image_size_1.default)(path_1.default.resolve(folder, file));
            if (dimensions.width && dimensions.height) {
                break;
            }
            dimensions = null;
        }
    }
    return dimensions;
}, _PeppyMeterConfig_getFIFOPathFromPeppyAlsaPipePlugin = function _PeppyMeterConfig_getFIFOPathFromPeppyAlsaPipePlugin() {
    return PeppyAlsaPipePluginListener_1.PeppyAlsaPipePluginListener.getFIFOPath();
};
_PeppyMeterConfig_configTmpl = { value: null };
_PeppyMeterConfig_configValues = { value: {} };
_PeppyMeterConfig_validationErrors = { value: {} };
_PeppyMeterConfig_lastCommitedValues = { value: null };
//# sourceMappingURL=PeppyMeterConfig.js.map