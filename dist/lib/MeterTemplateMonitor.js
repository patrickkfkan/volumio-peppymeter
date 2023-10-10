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
var _MeterTemplateMonitor_instances, _MeterTemplateMonitor_templateFolderMonitors, _MeterTemplateMonitor_templates, _MeterTemplateMonitor_isSorted, _MeterTemplateMonitor_queue, _MeterTemplateMonitor_isTemplateUpdating, _MeterTemplateMonitor_removeTemplateFolderMonitor, _MeterTemplateMonitor_sortTemplates, _MeterTemplateMonitor_addTemplateFolderMonitor, _MeterTemplateMonitor_removeTemplate, _MeterTemplateMonitor_getMetersFromTemplate;
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const PeppyMeterContext_1 = __importDefault(require("./PeppyMeterContext"));
const FSMonitor_1 = __importDefault(require("./utils/FSMonitor"));
const chokidar_1 = __importDefault(require("chokidar"));
const queue_1 = __importDefault(require("queue"));
const configparser_1 = __importDefault(require("configparser"));
const Constants_1 = require("./utils/Constants");
class MeterTemplateMonitor extends FSMonitor_1.default {
    constructor() {
        super(Constants_1.METER_TEMPLATE_DIR, ['addDir', 'unlinkDir']);
        _MeterTemplateMonitor_instances.add(this);
        this.name = 'MeterTemplateMonitor';
        _MeterTemplateMonitor_templateFolderMonitors.set(this, void 0);
        _MeterTemplateMonitor_templates.set(this, void 0);
        _MeterTemplateMonitor_isSorted.set(this, void 0);
        _MeterTemplateMonitor_queue.set(this, void 0);
        _MeterTemplateMonitor_isTemplateUpdating.set(this, void 0);
        __classPrivateFieldSet(this, _MeterTemplateMonitor_templateFolderMonitors, {}, "f");
        __classPrivateFieldSet(this, _MeterTemplateMonitor_templates, [], "f");
        __classPrivateFieldSet(this, _MeterTemplateMonitor_isSorted, false, "f");
        __classPrivateFieldSet(this, _MeterTemplateMonitor_queue, new queue_1.default({
            concurrency: 1,
            autostart: true
        }), "f");
        __classPrivateFieldSet(this, _MeterTemplateMonitor_isTemplateUpdating, false, "f");
    }
    getTemplates() {
        if (this.status === 'stopped') {
            PeppyMeterContext_1.default.getLogger().warn('[peppymeter] MeterTemplateMonitor is not running. Returning empty image list.');
            return [];
        }
        if (!__classPrivateFieldGet(this, _MeterTemplateMonitor_isSorted, "f")) {
            __classPrivateFieldGet(this, _MeterTemplateMonitor_instances, "m", _MeterTemplateMonitor_sortTemplates).call(this);
        }
        return __classPrivateFieldGet(this, _MeterTemplateMonitor_templates, "f");
    }
    async stop() {
        __classPrivateFieldGet(this, _MeterTemplateMonitor_queue, "f").end();
        const closeMonitorPromises = Object.keys(__classPrivateFieldGet(this, _MeterTemplateMonitor_templateFolderMonitors, "f")).map((t) => __classPrivateFieldGet(this, _MeterTemplateMonitor_instances, "m", _MeterTemplateMonitor_removeTemplateFolderMonitor).call(this, t));
        await Promise.all(closeMonitorPromises);
        __classPrivateFieldSet(this, _MeterTemplateMonitor_templateFolderMonitors, {}, "f");
        await super.stop();
        __classPrivateFieldSet(this, _MeterTemplateMonitor_templates, [], "f");
        __classPrivateFieldSet(this, _MeterTemplateMonitor_isSorted, false, "f");
        __classPrivateFieldSet(this, _MeterTemplateMonitor_isTemplateUpdating, false, "f");
    }
    handleEvent(event, _path) {
        const { base: template } = path_1.default.parse(_path);
        PeppyMeterContext_1.default.getLogger().info(`[peppymeter] MeterTemplateMonitor captured '${event}': ${template}`);
        switch (event) {
            case 'addDir':
                __classPrivateFieldGet(this, _MeterTemplateMonitor_queue, "f").push(() => __classPrivateFieldGet(this, _MeterTemplateMonitor_instances, "m", _MeterTemplateMonitor_addTemplateFolderMonitor).call(this, template));
                break;
            case 'unlinkDir':
                __classPrivateFieldGet(this, _MeterTemplateMonitor_queue, "f").push(async () => {
                    await __classPrivateFieldGet(this, _MeterTemplateMonitor_instances, "m", _MeterTemplateMonitor_removeTemplateFolderMonitor).call(this, template);
                    __classPrivateFieldGet(this, _MeterTemplateMonitor_instances, "m", _MeterTemplateMonitor_removeTemplate).call(this, template);
                });
                break;
        }
    }
    get status() {
        const mainStatus = super.status;
        if (__classPrivateFieldGet(this, _MeterTemplateMonitor_isTemplateUpdating, "f") && mainStatus === 'running') {
            return 'updating';
        }
        return mainStatus;
    }
}
exports.default = MeterTemplateMonitor;
_MeterTemplateMonitor_templateFolderMonitors = new WeakMap(), _MeterTemplateMonitor_templates = new WeakMap(), _MeterTemplateMonitor_isSorted = new WeakMap(), _MeterTemplateMonitor_queue = new WeakMap(), _MeterTemplateMonitor_isTemplateUpdating = new WeakMap(), _MeterTemplateMonitor_instances = new WeakSet(), _MeterTemplateMonitor_removeTemplateFolderMonitor = async function _MeterTemplateMonitor_removeTemplateFolderMonitor(template) {
    const monitor = __classPrivateFieldGet(this, _MeterTemplateMonitor_templateFolderMonitors, "f")[template];
    if (monitor) {
        try {
            monitor.removeAllListeners();
            await monitor.close();
        }
        catch (error) {
            PeppyMeterContext_1.default.getLogger().warn(PeppyMeterContext_1.default.getErrorMessage(`[peppymeter] MeterTemplateMonitor failed to close template folder monitor for '${template}':`, error, true));
        }
        finally {
            delete __classPrivateFieldGet(this, _MeterTemplateMonitor_templateFolderMonitors, "f")[template];
        }
    }
}, _MeterTemplateMonitor_sortTemplates = function _MeterTemplateMonitor_sortTemplates() {
    __classPrivateFieldGet(this, _MeterTemplateMonitor_templates, "f").sort((t1, t2) => t1.name.localeCompare(t2.name));
    __classPrivateFieldSet(this, _MeterTemplateMonitor_isSorted, true, "f");
}, _MeterTemplateMonitor_addTemplateFolderMonitor = async function _MeterTemplateMonitor_addTemplateFolderMonitor(template) {
    await __classPrivateFieldGet(this, _MeterTemplateMonitor_instances, "m", _MeterTemplateMonitor_removeTemplateFolderMonitor).call(this, template);
    const templatePath = `${Constants_1.METER_TEMPLATE_DIR}/${template}`;
    const monitor = chokidar_1.default.watch(templatePath);
    __classPrivateFieldGet(this, _MeterTemplateMonitor_templateFolderMonitors, "f")[template] = monitor;
    const _parseAndAdd = (silent = false) => {
        if (!__classPrivateFieldGet(this, _MeterTemplateMonitor_templates, "f").find((t) => t.name === template)) {
            __classPrivateFieldSet(this, _MeterTemplateMonitor_isTemplateUpdating, true, "f");
            const meters = __classPrivateFieldGet(this, _MeterTemplateMonitor_instances, "m", _MeterTemplateMonitor_getMetersFromTemplate).call(this, template);
            if (meters) {
                __classPrivateFieldGet(this, _MeterTemplateMonitor_templates, "f").push({
                    name: template,
                    meters
                });
                __classPrivateFieldSet(this, _MeterTemplateMonitor_isSorted, false, "f");
                if (!silent) {
                    PeppyMeterContext_1.default.getLogger().info(`[peppymeter] Added meter template '${template}'`);
                }
            }
            __classPrivateFieldSet(this, _MeterTemplateMonitor_isTemplateUpdating, false, "f");
        }
    };
    const _remove = (silent = false) => {
        __classPrivateFieldSet(this, _MeterTemplateMonitor_isTemplateUpdating, true, "f");
        __classPrivateFieldGet(this, _MeterTemplateMonitor_instances, "m", _MeterTemplateMonitor_removeTemplate).call(this, template, silent);
        __classPrivateFieldSet(this, _MeterTemplateMonitor_isTemplateUpdating, false, "f");
    };
    const _refresh = (silent = false) => {
        _remove(true);
        _parseAndAdd(true);
        if (!silent) {
            PeppyMeterContext_1.default.getLogger().info(`[peppymeter] Refreshed meter template '${template}'`);
        }
    };
    const _isMeterTxt = (_path) => {
        const { base } = path_1.default.parse(_path);
        return base === 'meters.txt';
    };
    monitor.on('add', (_path) => {
        if (_isMeterTxt(_path)) {
            _parseAndAdd();
        }
    });
    monitor.on('unlink', (_path) => {
        if (_isMeterTxt(_path)) {
            _remove();
        }
    });
    monitor.on('change', (_path) => {
        if (_isMeterTxt(_path)) {
            _refresh();
        }
    });
    return monitor;
}, _MeterTemplateMonitor_removeTemplate = function _MeterTemplateMonitor_removeTemplate(template, silent = false) {
    const index = __classPrivateFieldGet(this, _MeterTemplateMonitor_templates, "f").findIndex((t) => t.name === template);
    if (index >= 0) {
        __classPrivateFieldGet(this, _MeterTemplateMonitor_templates, "f").splice(index, 1);
        if (!silent) {
            PeppyMeterContext_1.default.getLogger().info(`[peppymeter] Removed meter template '${template}'`);
        }
    }
}, _MeterTemplateMonitor_getMetersFromTemplate = function _MeterTemplateMonitor_getMetersFromTemplate(template) {
    const configPath = path_1.default.resolve(Constants_1.METER_TEMPLATE_DIR, template, 'meters.txt');
    const config = new configparser_1.default();
    try {
        config.read(configPath);
        const sections = config.sections();
        if (sections.length > 0) {
            return sections;
        }
        PeppyMeterContext_1.default.getLogger().info(`[peppymeter] No meters defined in '${template}`);
        return null;
    }
    catch (error) {
        PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage(`[peppymeter] Error reading "${configPath}":`, error));
        return null;
    }
};
//# sourceMappingURL=MeterTemplateMonitor.js.map