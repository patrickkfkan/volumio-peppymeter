import EventEmitter from 'events';
import pm from '../PeppyMeterContext';

const PEPPY_ALSA_PIPE_EXPORTS_SHARED_VAR_KEY = 'plugin.peppy_alsa_pipe.exports';

export class PeppyAlsaPipePluginListener extends EventEmitter {

  #status: 'started' | 'stopped';
  #fifoPathChangeHandler: (value: any) => void;
  static #lastFIFOPath: string | null;

  constructor() {
    super();
    this.#fifoPathChangeHandler = this.#handleFIFOPathChange.bind(this);
    PeppyAlsaPipePluginListener.#lastFIFOPath = this.#getFIFOPathFromSharedVar();
  }

  #getFIFOPathFromSharedVar(value?: any) {
    if (value === undefined) {
      value = pm.getVolumioSharedVars().get(PEPPY_ALSA_PIPE_EXPORTS_SHARED_VAR_KEY, null);
    }
    if (!value) {
      return null;
    }
    try {
      const exports = JSON.parse(value);
      return exports?.fifoPaths?.meter || null;
    }
    catch (error) {
      return null;
    }
  }

  static getFIFOPath() {
    return this.#lastFIFOPath;
  }

  #handleFIFOPathChange(value: any) {
    const fifoPath = this.#getFIFOPathFromSharedVar(value);
    if (fifoPath !== PeppyAlsaPipePluginListener.#lastFIFOPath) {
      pm.getLogger().info(`[peppymeter] FIFO path obtained from Peppy ALSA Pipe plugin: ${fifoPath}`);
      PeppyAlsaPipePluginListener.#lastFIFOPath = fifoPath;
      this.emit('fifoPathChange', fifoPath);
    }
  }

  start() {
    if (this.#status === 'started') {
      return;
    }

    pm.getVolumioSharedVars().registerCallback(PEPPY_ALSA_PIPE_EXPORTS_SHARED_VAR_KEY, this.#fifoPathChangeHandler);
    this.#status = 'started';
  }

  stop() {
    if (this.#status === 'stopped') {
      return;
    }

    pm.getVolumioSharedVars().callbacks.delete(PEPPY_ALSA_PIPE_EXPORTS_SHARED_VAR_KEY, this.#fifoPathChangeHandler);
    this.#status = 'stopped';
  }

  on(event: 'fifoPathChange', listener: (fifoPath: string | null) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
