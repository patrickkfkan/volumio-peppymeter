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
var _a, _PeppyMeterManager_socket, _PeppyMeterManager_lastPlayerState, _PeppyMeterManager_startTimer, _PeppyMeterManager_command, _PeppyMeterManager_restarting, _PeppyMeterManager_initCommand, _PeppyMeterManager_handleSocketConnect, _PeppyMeterManager_clearStartTimer, _PeppyMeterManager_handlePlayerStateChange, _PeppyMeterManager_start;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const PeppyMeterContext_1 = __importDefault(require("./PeppyMeterContext"));
const PeppyMeterConfig_1 = __importDefault(require("./config/PeppyMeterConfig"));
const Constants_1 = require("./utils/Constants");
const ShellCommand_1 = require("./utils/ShellCommand");
const HOST = 'http://localhost:3000';
class PeppyMeterManager {
    static enable() {
        if (!__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket)) {
            __classPrivateFieldSet(this, _a, socket_io_client_1.default.connect(HOST, { autoConnect: false }), "f", _PeppyMeterManager_socket);
            __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket).on('connect', __classPrivateFieldGet(this, _a, "m", _PeppyMeterManager_handleSocketConnect).bind(this));
            __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket).on('pushState', __classPrivateFieldGet(this, _a, "m", _PeppyMeterManager_handlePlayerStateChange).bind(this));
            __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket).connect();
        }
    }
    static async disable() {
        __classPrivateFieldGet(this, _a, "m", _PeppyMeterManager_clearStartTimer).call(this);
        if (__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket)) {
            __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket).removeAllListeners();
            __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket).disconnect();
            __classPrivateFieldSet(this, _a, null, "f", _PeppyMeterManager_socket);
        }
        __classPrivateFieldSet(this, _a, null, "f", _PeppyMeterManager_lastPlayerState);
        return this.stop();
    }
    static isEnabled() {
        return !!__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket);
    }
    static async stop() {
        if (__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_command).status === 'running') {
            return __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_command).kill();
        }
    }
    static async restart(options = { policy: 'always' }) {
        const restartPolicy = options.policy || 'always';
        if (restartPolicy === 'configChanged') {
            let configChanged;
            try {
                configChanged = PeppyMeterConfig_1.default.commit(true);
            }
            catch (error) {
                // Proceed even if there are errors, so they can be handled later in `start()`.
                configChanged = true;
            }
            if (!configChanged) {
                return;
            }
        }
        const onEnd = () => {
            __classPrivateFieldSet(this, _a, false, "f", _PeppyMeterManager_restarting);
            PeppyMeterContext_1.default.getLogger().info('[peppymeter] PeppyMeter restart end');
        };
        if (__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_restarting)) {
            return;
        }
        PeppyMeterContext_1.default.getLogger().info('[peppymeter] PeppyMeter restart begin');
        __classPrivateFieldGet(this, _a, "m", _PeppyMeterManager_clearStartTimer).call(this);
        __classPrivateFieldSet(this, _a, true, "f", _PeppyMeterManager_restarting);
        await this.stop();
        const state = PeppyMeterContext_1.default.getVolumioState();
        if (state && state.status === 'play') {
            await __classPrivateFieldGet(this, _a, "m", _PeppyMeterManager_start).call(this, () => {
                onEnd();
            });
        }
        else {
            onEnd();
        }
    }
    static isRunning() {
        return __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_command).status === 'running';
    }
}
exports.default = PeppyMeterManager;
_a = PeppyMeterManager, _PeppyMeterManager_initCommand = function _PeppyMeterManager_initCommand() {
    return new ShellCommand_1.ShellCommand(Constants_1.PEPPYMETER_RUN_SCRIPT);
}, _PeppyMeterManager_handleSocketConnect = function _PeppyMeterManager_handleSocketConnect() {
    if (__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket)) {
        __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_socket).emit('getState');
    }
}, _PeppyMeterManager_clearStartTimer = function _PeppyMeterManager_clearStartTimer() {
    if (__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_startTimer)) {
        clearTimeout(__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_startTimer));
        __classPrivateFieldSet(this, _a, null, "f", _PeppyMeterManager_startTimer);
    }
}, _PeppyMeterManager_handlePlayerStateChange = function _PeppyMeterManager_handlePlayerStateChange(state) {
    if (!this.isEnabled() || __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_restarting)) {
        return;
    }
    const lastStateIsPlaying = (__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_lastPlayerState) && __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_lastPlayerState).status === 'play');
    if (state.status === 'play' && !lastStateIsPlaying) {
        const timeout = PeppyMeterContext_1.default.getConfigValue('startDelay');
        PeppyMeterContext_1.default.getLogger().info(`[peppymeter] PeppyMeter will start in ${timeout} seconds`);
        __classPrivateFieldSet(this, _a, setTimeout(async () => {
            if (__classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_command).status !== 'ready') {
                PeppyMeterContext_1.default.getLogger().info('[peppymeter] PeppyMeter process already running');
                return;
            }
            await __classPrivateFieldGet(this, _a, "m", _PeppyMeterManager_start).call(this);
        }, timeout * 1000), "f", _PeppyMeterManager_startTimer);
    }
    else if (state.status !== 'play' && lastStateIsPlaying) {
        __classPrivateFieldGet(this, _a, "m", _PeppyMeterManager_clearStartTimer).call(this);
    }
    __classPrivateFieldSet(this, _a, state, "f", _PeppyMeterManager_lastPlayerState);
}, _PeppyMeterManager_start = async function _PeppyMeterManager_start(callback) {
    try {
        PeppyMeterConfig_1.default.commit();
    }
    catch (error) {
        PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage('[peppymeter] PeppyMeter configuration error:', error, false));
        PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_START', PeppyMeterContext_1.default.getErrorMessage('', error, false)));
        if (callback) {
            callback();
        }
        return;
    }
    try {
        PeppyMeterContext_1.default.getLogger().info('[peppymeter] Starting PeppyMeter process');
        const execPromise = __classPrivateFieldGet(this, _a, "f", _PeppyMeterManager_command).exec();
        if (callback) {
            callback();
        }
        await execPromise;
    }
    catch (error) {
        PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage('[peppymeter] PeppyMeter process error:', error, true));
        PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_START', PeppyMeterContext_1.default.getErrorMessage('', error, false)));
    }
};
_PeppyMeterManager_socket = { value: null };
_PeppyMeterManager_lastPlayerState = { value: null };
_PeppyMeterManager_startTimer = { value: null };
_PeppyMeterManager_command = { value: __classPrivateFieldGet(_a, _a, "m", _PeppyMeterManager_initCommand).call(_a) };
_PeppyMeterManager_restarting = { value: false };
//# sourceMappingURL=PeppyMeter.js.map