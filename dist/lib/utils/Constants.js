"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREDEFINED_FONTS = exports.FONT_TLWG_LAKSAMAN = exports.FONT_NOTO_SANS_CJK = exports.FONT_LATO = exports.PEPPYMETER_RUN_SCRIPT = exports.PEPPYMETER_CONFIG_FILE = exports.PEPPYMETER_CONFIG_TEMPLATE_FILE = exports.METER_TEMPLATE_DIR = void 0;
exports.METER_TEMPLATE_DIR = '/data/INTERNAL/PeppyMeterPlugin/Templates';
exports.PEPPYMETER_CONFIG_TEMPLATE_FILE = '/data/plugins/user_interface/peppymeter/dist/peppymeter/config.txt.tmpl';
exports.PEPPYMETER_CONFIG_FILE = '/data/plugins/user_interface/peppymeter/dist/peppymeter/config.txt';
exports.PEPPYMETER_RUN_SCRIPT = '/data/plugins/user_interface/peppymeter/dist/peppymeter/run_peppymeter.sh';
exports.FONT_LATO = {
    id: 'Lato',
    type: 'predefined',
    name: 'Lato',
    shortName: 'Lato',
    path: '/volumio/http/www3/app/themes/volumio3/assets/variants/volumio/fonts',
    light: '/Lato-Light.ttf',
    regular: '/Lato-Regular.ttf',
    bold: '/Lato-Bold.ttf'
};
exports.FONT_NOTO_SANS_CJK = {
    id: 'NotoSansCJK',
    type: 'predefined',
    name: 'Noto Sans CJK (Chinese / Japanese / Korean)',
    shortName: 'Noto Sans CJK',
    path: '/usr/share/fonts/opentype',
    light: '/noto/NotoSansCJK-Light.ttc',
    regular: '/noto/NotoSansCJK-Regular.ttc',
    bold: '/noto/NotoSansCJK-Bold.ttc'
};
exports.FONT_TLWG_LAKSAMAN = {
    id: 'TLWGLaksaman',
    type: 'predefined',
    name: 'TLWG - Laksaman (Thai)',
    shortName: 'TLWG - Laksaman',
    path: '/usr/share/fonts/truetype',
    light: '/tlwg/Laksaman.ttf',
    regular: '/tlwg/Laksaman.ttf',
    bold: '/tlwg/Laksaman-Bold.ttf'
};
exports.PREDEFINED_FONTS = [
    exports.FONT_LATO,
    exports.FONT_NOTO_SANS_CJK,
    exports.FONT_TLWG_LAKSAMAN
];
//# sourceMappingURL=Constants.js.map