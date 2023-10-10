import path from 'path';
import pm from '../PeppyMeterContext';
import { FontConfig, FontDef } from '../config/PluginConfig';
import { PREDEFINED_FONTS } from './Constants';
import { fileExists } from './System';

export class FontHelper {

  static getFontDefByConfig(conf: FontConfig) {
    return PREDEFINED_FONTS.find((f) => f.id === conf.id) || null;
  }

  static checkPaths(def: FontDef) {
    const lightPath = this.#resolvePath(def, 'light');
    const regularPath = this.#resolvePath(def, 'regular');
    const boldPath = this.#resolvePath(def, 'bold');
    let missing: string | null = null;
    if (!fileExists(lightPath)) {
      missing = lightPath;
    }
    else if (!fileExists(regularPath)) {
      missing = regularPath;
    }
    else if (!fileExists(boldPath)) {
      missing = boldPath;
    }
    if (missing) {
      pm.getLogger().error(`[peppymeter] Font path missing: ${missing}`);
      return false;
    }

    return true;
  }

  static #resolvePath(def: FontDef, style: 'light' | 'regular' | 'bold') {
    const path1 = def.path;
    const path2 = def[style];
    if (!path1.trim()) {
      return path.resolve(path2);
    }
    let p = path2;
    if (path2.startsWith('/')) {
      p = path2.substring(1);
    }
    return path.resolve(path1, p);
  }
}
