"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _FontHelper_resolvePath;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontHelper = void 0;
const path_1 = __importDefault(require("path"));
const PeppyMeterContext_1 = __importDefault(require("../PeppyMeterContext"));
const Constants_1 = require("./Constants");
const System_1 = require("./System");
class FontHelper {
    static getFontDefByConfig(conf) {
        return Constants_1.PREDEFINED_FONTS.find((f) => f.id === conf.id) || null;
    }
    static checkPaths(def) {
        const lightPath = __classPrivateFieldGet(this, _a, "m", _FontHelper_resolvePath).call(this, def, 'light');
        const regularPath = __classPrivateFieldGet(this, _a, "m", _FontHelper_resolvePath).call(this, def, 'regular');
        const boldPath = __classPrivateFieldGet(this, _a, "m", _FontHelper_resolvePath).call(this, def, 'bold');
        let missing = null;
        if (!(0, System_1.fileExists)(lightPath)) {
            missing = lightPath;
        }
        else if (!(0, System_1.fileExists)(regularPath)) {
            missing = regularPath;
        }
        else if (!(0, System_1.fileExists)(boldPath)) {
            missing = boldPath;
        }
        if (missing) {
            PeppyMeterContext_1.default.getLogger().error(`[peppymeter] Font path missing: ${missing}`);
            return false;
        }
        return true;
    }
}
exports.FontHelper = FontHelper;
_a = FontHelper, _FontHelper_resolvePath = function _FontHelper_resolvePath(def, style) {
    const path1 = def.path;
    const path2 = def[style];
    if (!path1.trim()) {
        return path_1.default.resolve(path2);
    }
    let p = path2;
    if (path2.startsWith('/')) {
        p = path2.substring(1);
    }
    return path_1.default.resolve(path1, p);
};
//# sourceMappingURL=FontHelper.js.map