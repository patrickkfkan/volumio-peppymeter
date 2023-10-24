import path from 'path';
import { METER_TEMPLATE_DIR } from './Constants';
import { listDirectories } from './System';
import ConfigParser from 'configparser';
import pm from '../PeppyMeterContext';
import imageSize from 'image-size';
import { Dimensions } from '../config/PeppyMeterConfig';

export async function getTemplateFolderList() {
  try {
    const dirs = await listDirectories(METER_TEMPLATE_DIR);
    sort(dirs);
    return dirs;
  }
  catch (error) {
    pm.getLogger().error(
      pm.getErrorMessage(`[peppymeter] Error getting template folder list from ${METER_TEMPLATE_DIR}:`, error));
    pm.toast('error', pm.getI18n('PEPPYMETER_ERR_READ_TEMPLATE_FOLDERS', pm.getErrorMessage('', error, false)));
    return [];
  }
}

export function getMeterList(template: string) {
  try {
    const config = getMeterConfig(template);
    const sections = config.sections();
    if (sections.length > 0) {
      sections.sort();
      return sections;
    }

    pm.getLogger().info(`[peppymeter] No meters defined in '${template}`);
    pm.toast('error', pm.getI18n('PEPPYMETER_ERR_NO_METERS', template));
    return [];
  }
  catch (error) {
    return [];
  }
}

export function getMeterScreenSize(template: string, meter: string): Dimensions | null {
  let config: ConfigParser;
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
    let meterList: string[];
    if (meter.includes(',')) {
      meterList = meter.split(',').map((m) => m.trim());
    }
    else if (meter === 'random') {
      meterList = getMeterList(template);
    }
    else {
      meterList = [ meter ];
    }
    const __getImgFile = (key: string) => {
      let value: string | undefined;
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
      const imgPath = path.resolve(METER_TEMPLATE_DIR, template, imgFile);
      const result = imageSize(imgPath);
      pm.getLogger().info(`[peppymeter] Meter screen size for ${template} -> ${meter}: ${result.width}x${result.height}px (obtained from ${imgFile})`);
      return result;
    }

    return null;
  }
  catch (error) {
    pm.getLogger().error(
      pm.getErrorMessage(`[peppymeter] Error getting meter screen size for ${template} -> ${meter}:`, error));
    return null;
  }
}

function getMeterConfig(template: string) {
  const configPath = path.resolve(METER_TEMPLATE_DIR, template, 'meters.txt');
  const config = new ConfigParser();
  try {
    config.read(configPath);
    return config;
  }
  catch (error) {
    pm.getLogger().error(
      pm.getErrorMessage(`[peppymeter] Error reading "${configPath}":`, error));
    pm.toast('error', pm.getI18n('PEPPYMETER_ERR_READ_METERS', pm.getErrorMessage('', error, false)));
    throw error;
  }
}

function sort(elements: string[]) {
  elements.sort((t1, t2) => t1.localeCompare(t2));
}
