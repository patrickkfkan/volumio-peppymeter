import * as SystemUtils from './System';
import pm from '../PeppyMeterContext';
import chokidar from 'chokidar';

export type FSMonitorEvent = 'add' | 'unlink' | 'addDir' | 'unlinkDir';

export default abstract class FSMonitor<T extends FSMonitorEvent[]> {

  abstract name: string;
  #status: 'initializing' | 'running' | 'updating' | 'stopped';
  #events: FSMonitorEvent[];
  #watcher: ReturnType<typeof chokidar['watch']> | null;
  #monitorDir: string;

  constructor(monitorDir: string, events: T) {
    this.#monitorDir = monitorDir;
    this.#events = events;
    this.#status = 'stopped';
    this.#watcher = null;
  }

  start() {
    if (!SystemUtils.dirExists(this.#monitorDir)) {
      pm.getLogger().warn(`[peppymeter] ${this.#monitorDir} does not exist. ${this.name} will not start.`);
      return;
    }
    pm.getLogger().info(`[peppymeter] ${this.name} commencing initial scanning of ${this.#monitorDir}`);
    this.#watcher = chokidar.watch(this.#monitorDir);
    if (this.#events.includes('add')) {
      this.#watcher.on('add', this.#preHandleEvent.bind(this, 'add'));
    }
    if (this.#events.includes('unlink')) {
      this.#watcher.on('unlink', this.#preHandleEvent.bind(this, 'unlink'));
    }
    if (this.#events.includes('addDir')) {
      this.#watcher.on('addDir', this.#preHandleEvent.bind(this, 'addDir'));
    }
    if (this.#events.includes('unlinkDir')) {
      this.#watcher.on('unlinkDir', this.#preHandleEvent.bind(this, 'unlinkDir'));
    }
    this.#watcher.on('ready', () => {
      pm.getLogger().info(`[peppymeter] ${this.name} has completed initial scanning`);
      pm.getLogger().info(`[peppymeter] ${this.name} is now watching ${this.#monitorDir}`);
      this.#status = 'running';
    });
    this.#status = 'initializing';
  }

  #preHandleEvent(event: FSMonitorEvent, path: string) {
    const oldStatus = this.#status;
    if (oldStatus === 'running') {
      this.#status = 'updating';
    }
    this.handleEvent(event, path);
    this.#status = oldStatus;
  }

  async stop() {
    if (this.#watcher) {
      await this.#watcher.close();
      this.#watcher = null;
    }
    this.#status = 'stopped';
    pm.getLogger().warn(`[peppymeter] ${this.name} stopped`);
  }

  get status() {
    return this.#status;
  }

  protected abstract handleEvent(event: T[number], path: string): void;
}
