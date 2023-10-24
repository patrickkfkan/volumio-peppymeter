"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeterScreenSize = exports.getMeterList = exports.getTemplateFolderList = void 0;
const path_1 = __importDefault(require("path"));
const Constants_1 = require("./Constants");
const System_1 = require("./System");
const configparser_1 = __importDefault(require("configparser"));
const PeppyMeterContext_1 = __importDefault(require("../PeppyMeterContext"));
const image_size_1 = __importDefault(require("image-size"));
async function getTemplateFolderList() {
    try {
        const dirs = await (0, System_1.listDirectories)(Constants_1.METER_TEMPLATE_DIR);
        sort(dirs);
        return dirs;
    }
    catch (error) {
        PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage(`[peppymeter] Error getting template folder list from ${Constants_1.METER_TEMPLATE_DIR}:`, error));
        PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_READ_TEMPLATE_FOLDERS', PeppyMeterContext_1.default.getErrorMessage('', error, false)));
        return [];
    }
}
exports.getTemplateFolderList = getTemplateFolderList;
function getMeterList(template) {
    try {
        const config = getMeterConfig(template);
        const sections = config.sections();
        if (sections.length > 0) {
            sections.sort();
            return sections;
        }
        PeppyMeterContext_1.default.getLogger().info(`[peppymeter] No meters defined in '${template}`);
        PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_NO_METERS', template));
        return [];
    }
    catch (error) {
        return [];
    }
}
exports.getMeterList = getMeterList;
function getMeterScreenSize(template, meter) {
    let config;
    try {
        config = getMeterConfig(template);
    }
    catch (error) {
        return null;
    }
    try {
        const sections = config.sections();
        if (sections.length === 0) {
            return null;
        }
        let meterList;
        if (meter.includes(',')) {
            meterList = meter.split(',').map((m) => m.trim());
        }
        else if (meter === 'random') {
            meterList = getMeterList(template);
        }
        else {
            meterList = [meter];
        }
        const __getImgFile = (key) => {
            let value;
            for (const m of meterList) {
                value = config.get(m, key);
                if (value) {
                    break;
                }
            }
            return value;
        };
        const imgFile = __getImgFile('screen.bgr') || __getImgFile('bgr.filename');
        if (imgFile) {
            const imgPath = path_1.default.resolve(Constants_1.METER_TEMPLATE_DIR, template, imgFile);
            const result = (0, image_size_1.default)(imgPath);
            PeppyMeterContext_1.default.getLogger().info(`[peppymeter] Meter screen size for ${template} -> ${meter}: ${result.width}x${result.height}px (obtained from ${imgFile})`);
            return result;
        }
        return null;
    }
    catch (error) {
        PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage(`[peppymeter] Error getting meter screen size for ${template} -> ${meter}:`, error));
        return null;
    }
}
exports.getMeterScreenSize = getMeterScreenSize;
function getMeterConfig(template) {
    const configPath = path_1.default.resolve(Constants_1.METER_TEMPLATE_DIR, template, 'meters.txt');
    const config = new configparser_1.default();
    try {
        config.read(configPath);
        return config;
    }
    catch (error) {
        PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage(`[peppymeter] Error reading "${configPath}":`, error));
        PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_READ_METERS', PeppyMeterContext_1.default.getErrorMessage('', error, false)));
        throw error;
    }
}
function sort(elements) {
    elements.sort((t1, t2) => t1.localeCompare(t2));
}
//# sourceMappingURL=MeterTemplate.js.map