import path from 'path';
import { METER_TEMPLATE_DIR } from './Constants';
import { listDirectories } from './System';
import ConfigParser from 'configparser';
import pm from '../PeppyMeterContext';

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
  const configPath = path.resolve(METER_TEMPLATE_DIR, template, 'meters.txt');
  const config = new ConfigParser();
  try {
    config.read(configPath);
    const sections = config.sections();
    if (sections.length > 0) {
      sections.sort();
      return sections;
    }

    pm.getLogger().info(`[peppymeter] No meters defined in '${configPath}`);
    pm.toast('error', pm.getI18n('PEPPYMETER_ERR_NO_METERS', template));
    return [];
  }
  catch (error) {
    pm.getLogger().error(
      pm.getErrorMessage(`[peppymeter] Error reading "${configPath}":`, error));
    pm.toast('error', pm.getI18n('PEPPYMETER_ERR_READ_METERS', pm.getErrorMessage('', error, false)));
    return [];
  }
}

function sort(elements: string[]) {
  elements.sort((t1, t2) => t1.localeCompare(t2));
}