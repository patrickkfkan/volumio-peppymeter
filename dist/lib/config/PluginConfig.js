"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLUGIN_CONFIG_SCHEMA = void 0;
const Constants_1 = require("../utils/Constants");
const defaultFontConfig = {
    id: Constants_1.FONT_LATO.id,
    type: Constants_1.FONT_LATO.type
};
exports.PLUGIN_CONFIG_SCHEMA = {
    startDelay: { defaultValue: 3, json: false },
    template: { defaultValue: '', json: false },
    meterType: { defaultValue: 'random', json: false },
    meter: { defaultValue: 'random', json: false },
    changeInterval: { defaultValue: 60, json: false },
    screenSize: { defaultValue: { type: 'auto', width: 0, height: 0 }, json: true },
    useCache: { defaultValue: false, json: false },
    smoothBufferSize: { defaultValue: 8, json: false },
    mouseSupport: { defaultValue: true, json: false },
    font: { defaultValue: defaultFontConfig, json: true },
    exitOnPauseStop: { defaultValue: { enabled: true, delay: 0 }, json: true },
    fifoPath: { defaultValue: { type: 'peppyAlsaPlugin', path: '' }, json: true }
};
//# sourceMappingURL=PluginConfig.js.map