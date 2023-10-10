"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _PeppyAlsaPipePluginListener_instances, _a, _PeppyAlsaPipePluginListener_status, _PeppyAlsaPipePluginListener_fifoPathChangeHandler, _PeppyAlsaPipePluginListener_lastFIFOPath, _PeppyAlsaPipePluginListener_getFIFOPathFromSharedVar, _PeppyAlsaPipePluginListener_handleFIFOPathChange;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeppyAlsaPipePluginListener = void 0;
const events_1 = __importDefault(require("events"));
const PeppyMeterContext_1 = __importDefault(require("../PeppyMeterContext"));
const PEPPY_ALSA_PIPE_EXPORTS_SHARED_VAR_KEY = 'plugin.peppy_alsa_pipe.exports';
class PeppyAlsaPipePluginListener extends events_1.default {
    constructor() {
        super();
        _PeppyAlsaPipePluginListener_instances.add(this);
        _PeppyAlsaPipePluginListener_status.set(this, void 0);
        _PeppyAlsaPipePluginListener_fifoPathChangeHandler.set(this, void 0);
        __classPrivateFieldSet(this, _PeppyAlsaPipePluginListener_fifoPathChangeHandler, __classPrivateFieldGet(this, _PeppyAlsaPipePluginListener_instances, "m", _PeppyAlsaPipePluginListener_handleFIFOPathChange).bind(this), "f");
        __classPrivateFieldSet(PeppyAlsaPipePluginListener, _a, __classPrivateFieldGet(this, _PeppyAlsaPipePluginListener_instances, "m", _PeppyAlsaPipePluginListener_getFIFOPathFromSharedVar).call(this), "f", _PeppyAlsaPipePluginListener_lastFIFOPath);
    }
    static getFIFOPath() {
        return __classPrivateFieldGet(this, _a, "f", _PeppyAlsaPipePluginListener_lastFIFOPath);
    }
    start() {
        if (__classPrivateFieldGet(this, _PeppyAlsaPipePluginListener_status, "f") === 'started') {
            return;
        }
        PeppyMeterContext_1.default.getVolumioSharedVars().registerCallback(PEPPY_ALSA_PIPE_EXPORTS_SHARED_VAR_KEY, __classPrivateFieldGet(this, _PeppyAlsaPipePluginListener_fifoPathChangeHandler, "f"));
        __classPrivateFieldSet(this, _PeppyAlsaPipePluginListener_status, 'started', "f");
    }
    stop() {
        if (__classPrivateFieldGet(this, _PeppyAlsaPipePluginListener_status, "f") === 'stopped') {
            return;
        }
        PeppyMeterContext_1.default.getVolumioSharedVars().callbacks.delete(PEPPY_ALSA_PIPE_EXPORTS_SHARED_VAR_KEY, __classPrivateFieldGet(this, _PeppyAlsaPipePluginListener_fifoPathChangeHandler, "f"));
        __classPrivateFieldSet(this, _PeppyAlsaPipePluginListener_status, 'stopped', "f");
    }
    on(event, listener) {
        return super.on(event, listener);
    }
}
exports.PeppyAlsaPipePluginListener = PeppyAlsaPipePluginListener;
_a = PeppyAlsaPipePluginListener, _PeppyAlsaPipePluginListener_status = new WeakMap(), _PeppyAlsaPipePluginListener_fifoPathChangeHandler = new WeakMap(), _PeppyAlsaPipePluginListener_instances = new WeakSet(), _PeppyAlsaPipePluginListener_getFIFOPathFromSharedVar = function _PeppyAlsaPipePluginListener_getFIFOPathFromSharedVar(value) {
    if (value === undefined) {
        value = PeppyMeterContext_1.default.getVolumioSharedVars().get(PEPPY_ALSA_PIPE_EXPORTS_SHARED_VAR_KEY, null);
    }
    if (!value) {
        return null;
    }
    try {
        const exports = JSON.parse(value);
        return exports?.fifoPaths?.meter || null;
    }
    catch (error) {
        return null;
    }
}, _PeppyAlsaPipePluginListener_handleFIFOPathChange = function _PeppyAlsaPipePluginListener_handleFIFOPathChange(value) {
    const fifoPath = __classPrivateFieldGet(this, _PeppyAlsaPipePluginListener_instances, "m", _PeppyAlsaPipePluginListener_getFIFOPathFromSharedVar).call(this, value);
    if (fifoPath !== __classPrivateFieldGet(PeppyAlsaPipePluginListener, _a, "f", _PeppyAlsaPipePluginListener_lastFIFOPath)) {
        PeppyMeterContext_1.default.getLogger().info(`[peppymeter] FIFO path obtained from Peppy ALSA Pipe plugin: ${fifoPath}`);
        __classPrivateFieldSet(PeppyAlsaPipePluginListener, _a, fifoPath, "f", _PeppyAlsaPipePluginListener_lastFIFOPath);
        this.emit('fifoPathChange', fifoPath);
    }
};
_PeppyAlsaPipePluginListener_lastFIFOPath = { value: void 0 };
//# sourceMappingURL=PeppyAlsaPipePluginListener.js.map