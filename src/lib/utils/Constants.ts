import { FontDef } from '../config/PluginConfig';

export const METER_TEMPLATE_DIR = '/data/INTERNAL/PeppyMeterPlugin/Templates';
export const PEPPYMETER_CONFIG_TEMPLATE_FILE = '/data/plugins/user_interface/peppymeter/dist/peppymeter/config.txt.tmpl';
export const PEPPYMETER_CONFIG_FILE = '/data/plugins/user_interface/peppymeter/dist/peppymeter/config.txt';
export const PEPPYMETER_RUN_SCRIPT = '/data/plugins/user_interface/peppymeter/dist/peppymeter/run_peppymeter.sh';

export const FONT_LATO: FontDef = {
  id: 'Lato',
  type: 'predefined',
  name: 'Lato',
  shortName: 'Lato',
  path: '/volumio/http/www3/app/themes/volumio3/assets/variants/volumio/fonts',
  light: '/Lato-Light.ttf',
  regular: '/Lato-Regular.ttf',
  bold: '/Lato-Bold.ttf'
};

export const FONT_NOTO_SANS_CJK: FontDef = {
  id: 'NotoSansCJK',
  type: 'predefined',
  name: 'Noto Sans CJK (Chinese / Japanese / Korean)',
  shortName: 'Noto Sans CJK',
  path: '/usr/share/fonts/opentype',
  light: '/noto/NotoSansCJK-Light.ttc',
  regular: '/noto/NotoSansCJK-Regular.ttc',
  bold: '/noto/NotoSansCJK-Bold.ttc'
};

export const FONT_TLWG_LAKSAMAN: FontDef = {
  id: 'TLWGLaksaman',
  type: 'predefined',
  name: 'TLWG - Laksaman (Thai)',
  shortName: 'TLWG - Laksaman',
  path: '/usr/share/fonts/truetype',
  light: '/tlwg/Laksaman.ttf',
  regular: '/tlwg/Laksaman.ttf',
  bold: '/tlwg/Laksaman-Bold.ttf'
};

export const PREDEFINED_FONTS: FontDef[] = [
  FONT_LATO,
  FONT_NOTO_SANS_CJK,
  FONT_TLWG_LAKSAMAN
];
