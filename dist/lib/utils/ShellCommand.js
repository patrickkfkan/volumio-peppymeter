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
var _ShellCommand_instances, _ShellCommand_status, _ShellCommand_cmd, _ShellCommand_sudo, _ShellCommand_logging, _ShellCommand_process, _ShellCommand_sigkill, _ShellCommand_reset;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellCommand = void 0;
const child_process_1 = require("child_process");
const pidtree_1 = __importDefault(require("pidtree"));
const PeppyMeterContext_1 = __importDefault(require("../PeppyMeterContext"));
class ShellCommand {
    constructor(cmd, options) {
        _ShellCommand_instances.add(this);
        _ShellCommand_status.set(this, void 0);
        _ShellCommand_cmd.set(this, void 0);
        _ShellCommand_sudo.set(this, void 0);
        _ShellCommand_logging.set(this, void 0);
        _ShellCommand_process.set(this, void 0);
        __classPrivateFieldSet(this, _ShellCommand_cmd, cmd, "f");
        __classPrivateFieldSet(this, _ShellCommand_sudo, options?.sudo !== undefined ? options.sudo : false, "f");
        __classPrivateFieldSet(this, _ShellCommand_logging, options?.logging !== undefined ? options.logging : true, "f");
        __classPrivateFieldSet(this, _ShellCommand_process, null, "f");
        __classPrivateFieldSet(this, _ShellCommand_status, 'ready', "f");
    }
    exec() {
        if (__classPrivateFieldGet(this, _ShellCommand_process, "f")) {
            throw Error('Command execution already in progress');
        }
        return new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _ShellCommand_status, 'running', "f");
            let lastError = null;
            let out = '';
            const s = (0, child_process_1.spawn)(__classPrivateFieldGet(this, _ShellCommand_sudo, "f") ? `echo volumio | sudo -S ${__classPrivateFieldGet(this, _ShellCommand_cmd, "f")}` : __classPrivateFieldGet(this, _ShellCommand_cmd, "f"), { uid: 1000, gid: 1000, shell: true });
            const pid = s.pid;
            if (__classPrivateFieldGet(this, _ShellCommand_logging, "f")) {
                PeppyMeterContext_1.default.getLogger().info(`[peppymeter] (PID: ${pid}) Process spawned for cmd: ${__classPrivateFieldGet(this, _ShellCommand_cmd, "f")}`);
            }
            s.stdout.on('data', (msg) => {
                if (__classPrivateFieldGet(this, _ShellCommand_logging, "f")) {
                    PeppyMeterContext_1.default.getLogger().info(`[peppymeter] (PID: ${pid}) Process stdout: ${msg.toString()}`);
                }
                out += msg.toString();
            });
            s.stderr.on('data', (msg) => {
                if (__classPrivateFieldGet(this, _ShellCommand_logging, "f")) {
                    PeppyMeterContext_1.default.getLogger().info(`[peppymeter] (PID: ${pid}) Process stderr: ${msg.toString()}`);
                }
            });
            s.on('close', (code, signal) => {
                if (__classPrivateFieldGet(this, _ShellCommand_logging, "f")) {
                    const withErr = lastError ? ' with error' : '';
                    PeppyMeterContext_1.default.getLogger().info(`[peppymeter] (PID: ${pid}) Process closed${withErr} - code: ${code}, signal: ${signal}`);
                }
                if (__classPrivateFieldGet(this, _ShellCommand_status, "f") !== 'killing' && lastError) {
                    reject(lastError);
                }
                __classPrivateFieldGet(this, _ShellCommand_instances, "m", _ShellCommand_reset).call(this);
                resolve(out);
            });
            s.on('error', (err) => {
                const isKilling = __classPrivateFieldGet(this, _ShellCommand_status, "f") !== 'killing';
                if (__classPrivateFieldGet(this, _ShellCommand_logging, "f") && !isKilling) {
                    PeppyMeterContext_1.default.getLogger().error(`[peppymeter] (PID: ${pid}) Process error: ${err.message}`);
                }
                if (!isKilling) {
                    lastError = err;
                }
            });
            __classPrivateFieldSet(this, _ShellCommand_process, s, "f");
        });
    }
    setLogging(value) {
        __classPrivateFieldSet(this, _ShellCommand_logging, value, "f");
    }
    async kill() {
        if (__classPrivateFieldGet(this, _ShellCommand_status, "f") !== 'running' || !__classPrivateFieldGet(this, _ShellCommand_process, "f")) {
            throw Error('Command is not running');
        }
        __classPrivateFieldSet(this, _ShellCommand_status, 'killing', "f");
        const proc = __classPrivateFieldGet(this, _ShellCommand_process, "f");
        return new Promise(async (resolve) => {
            try {
                const tree = await (0, pidtree_1.default)(proc.pid, { root: true });
                const target = tree.pop();
                if (target) {
                    PeppyMeterContext_1.default.getLogger().info(`[peppymeter] Killing last child of process tree (pids: ${tree.join(' ')} *${target}*)`);
                    proc.once('close', () => {
                        __classPrivateFieldGet(this, _ShellCommand_instances, "m", _ShellCommand_reset).call(this);
                        resolve();
                    });
                    await __classPrivateFieldGet(this, _ShellCommand_instances, "m", _ShellCommand_sigkill).call(this, target);
                }
            }
            catch (error) {
                PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage('[peppymeter] Failed to kill process - resolving anyway:', error, false));
                __classPrivateFieldGet(this, _ShellCommand_instances, "m", _ShellCommand_reset).call(this);
                resolve();
            }
        });
    }
    get status() {
        return __classPrivateFieldGet(this, _ShellCommand_status, "f");
    }
}
exports.ShellCommand = ShellCommand;
_ShellCommand_status = new WeakMap(), _ShellCommand_cmd = new WeakMap(), _ShellCommand_sudo = new WeakMap(), _ShellCommand_logging = new WeakMap(), _ShellCommand_process = new WeakMap(), _ShellCommand_instances = new WeakSet(), _ShellCommand_sigkill = async function _ShellCommand_sigkill(pid) {
    return new ShellCommand(`/bin/kill -9 ${pid}`).exec();
}, _ShellCommand_reset = function _ShellCommand_reset() {
    if (__classPrivateFieldGet(this, _ShellCommand_process, "f")) {
        __classPrivateFieldGet(this, _ShellCommand_process, "f").stdout?.removeAllListeners();
        __classPrivateFieldGet(this, _ShellCommand_process, "f").stderr?.removeAllListeners();
        __classPrivateFieldGet(this, _ShellCommand_process, "f").removeAllListeners();
        __classPrivateFieldSet(this, _ShellCommand_process, null, "f");
        __classPrivateFieldSet(this, _ShellCommand_status, 'ready', "f");
    }
};
//# sourceMappingURL=ShellCommand.js.map