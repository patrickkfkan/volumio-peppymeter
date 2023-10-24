"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeterList = exports.getTemplateFolderList = void 0;
const path_1 = __importDefault(require("path"));
const Constants_1 = require("./Constants");
const System_1 = require("./System");
const configparser_1 = __importDefault(require("configparser"));
const PeppyMeterContext_1 = __importDefault(require("../PeppyMeterContext"));
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
    const configPath = path_1.default.resolve(Constants_1.METER_TEMPLATE_DIR, template, 'meters.txt');
    const config = new configparser_1.default();
    try {
        config.read(configPath);
        const sections = config.sections();
        if (sections.length > 0) {
            sections.sort();
            return sections;
        }
        PeppyMeterContext_1.default.getLogger().info(`[peppymeter] No meters defined in '${configPath}`);
        PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_NO_METERS', template));
        return [];
    }
    catch (error) {
        PeppyMeterContext_1.default.getLogger().error(PeppyMeterContext_1.default.getErrorMessage(`[peppymeter] Error reading "${configPath}":`, error));
        PeppyMeterContext_1.default.toast('error', PeppyMeterContext_1.default.getI18n('PEPPYMETER_ERR_READ_METERS', PeppyMeterContext_1.default.getErrorMessage('', error, false)));
        return [];
    }
}
exports.getMeterList = getMeterList;
function sort(elements) {
    elements.sort((t1, t2) => t1.localeCompare(t2));
}
//# sourceMappingURL=MeterTemplate.js.map