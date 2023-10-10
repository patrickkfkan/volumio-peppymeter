import path from 'path';
import pm from './PeppyMeterContext';
import FSMonitor from './utils/FSMonitor';
import chokidar from 'chokidar';
import Queue from 'queue';
import ConfigParser from 'configparser';
import { METER_TEMPLATE_DIR } from './utils/Constants';

export default class MeterTemplateMonitor extends FSMonitor<['addDir', 'unlinkDir']> {

  name = 'MeterTemplateMonitor';

  #templateFolderMonitors: Record<string, ReturnType<typeof chokidar['watch']>>;
  #templates: Array<{name: string; meters: string[]}>;
  #isSorted: boolean;
  #queue: Queue;
  #isTemplateUpdating: boolean;

  constructor() {
    super(METER_TEMPLATE_DIR, [ 'addDir', 'unlinkDir' ]);
    this.#templateFolderMonitors = {};
    this.#templates = [];
    this.#isSorted = false;
    this.#queue = new Queue({
      concurrency: 1,
      autostart: true
    });
    this.#isTemplateUpdating = false;
  }

  getTemplates() {
    if (this.status === 'stopped') {
      pm.getLogger().warn('[peppymeter] MeterTemplateMonitor is not running. Returning empty image list.');
      return [];
    }
    if (!this.#isSorted) {
      this.#sortTemplates();
    }
    return this.#templates;
  }

  async stop() {
    this.#queue.end();
    const closeMonitorPromises = Object.keys(this.#templateFolderMonitors).map((t) => this.#removeTemplateFolderMonitor(t));
    await Promise.all(closeMonitorPromises);
    this.#templateFolderMonitors = {};
    await super.stop();
    this.#templates = [];
    this.#isSorted = false;
    this.#isTemplateUpdating = false;
  }

  async #removeTemplateFolderMonitor(template: string) {
    const monitor = this.#templateFolderMonitors[template];
    if (monitor) {
      try {
        monitor.removeAllListeners();
        await monitor.close();
      }
      catch (error) {
        pm.getLogger().warn(pm.getErrorMessage(
          `[peppymeter] MeterTemplateMonitor failed to close template folder monitor for '${template}':`, error, true));
      }
      finally {
        delete this.#templateFolderMonitors[template];
      }
    }
  }

  protected handleEvent(event: 'addDir' | 'unlinkDir', _path: string): void {
    const { base: template } = path.parse(_path);

    pm.getLogger().info(`[peppymeter] MeterTemplateMonitor captured '${event}': ${template}`);

    switch (event) {
      case 'addDir':
        this.#queue.push(() => this.#addTemplateFolderMonitor(template));
        break;
      case 'unlinkDir':
        this.#queue.push(async () => {
          await this.#removeTemplateFolderMonitor(template);
          this.#removeTemplate(template);
        });
        break;
    }
  }

  #sortTemplates() {
    this.#templates.sort((t1, t2) => t1.name.localeCompare(t2.name));
    this.#isSorted = true;
  }

  async #addTemplateFolderMonitor(template: string) {
    await this.#removeTemplateFolderMonitor(template);
    const templatePath = `${METER_TEMPLATE_DIR}/${template}`;
    const monitor = chokidar.watch(templatePath);
    this.#templateFolderMonitors[template] = monitor;

    const _parseAndAdd = (silent = false) => {
      if (!this.#templates.find((t) => t.name === template)) {
        this.#isTemplateUpdating = true;
        const meters = this.#getMetersFromTemplate(template);
        if (meters) {
          this.#templates.push({
            name: template,
            meters
          });
          this.#isSorted = false;
          if (!silent) {
            pm.getLogger().info(`[peppymeter] Added meter template '${template}'`);
          }
        }
        this.#isTemplateUpdating = false;
      }
    };

    const _remove = (silent = false) => {
      this.#isTemplateUpdating = true;
      this.#removeTemplate(template, silent);
      this.#isTemplateUpdating = false;
    };

    const _refresh = (silent = false) => {
      _remove(true);
      _parseAndAdd(true);
      if (!silent) {
        pm.getLogger().info(`[peppymeter] Refreshed meter template '${template}'`);
      }
    };

    const _isMeterTxt = (_path: string) => {
      const { base } = path.parse(_path);
      return base === 'meters.txt';
    };

    monitor.on('add', (_path: string) => {
      if (_isMeterTxt(_path)) {
        _parseAndAdd();
      }
    });

    monitor.on('unlink', (_path: string) => {
      if (_isMeterTxt(_path)) {
        _remove();
      }
    });

    monitor.on('change', (_path: string) => {
      if (_isMeterTxt(_path)) {
        _refresh();
      }
    });

    return monitor;
  }

  #removeTemplate(template: string, silent = false) {
    const index = this.#templates.findIndex((t) => t.name === template);
    if (index >= 0) {
      this.#templates.splice(index, 1);
      if (!silent) {
        pm.getLogger().info(`[peppymeter] Removed meter template '${template}'`);
      }
    }
  }

  get status() {
    const mainStatus = super.status;
    if (this.#isTemplateUpdating && mainStatus === 'running') {
      return 'updating';
    }
    return mainStatus;
  }

  #getMetersFromTemplate(template: string) {
    const configPath = path.resolve(METER_TEMPLATE_DIR, template, 'meters.txt');
    const config = new ConfigParser();
    try {
      config.read(configPath);
      const sections = config.sections();
      if (sections.length > 0) {
        return sections;
      }

      pm.getLogger().info(`[peppymeter] No meters defined in '${template}`);
      return null;

    }
    catch (error) {
      pm.getLogger().error(
        pm.getErrorMessage(`[peppymeter] Error reading "${configPath}":`, error));
      return null;
    }
  }
}
