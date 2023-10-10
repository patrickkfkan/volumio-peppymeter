import io from 'socket.io-client';
import pm from './PeppyMeterContext';
import PeppyMeterConfig from './config/PeppyMeterConfig';
import { PEPPYMETER_RUN_SCRIPT } from './utils/Constants';
import { ShellCommand } from './utils/ShellCommand';

export interface PeppyMeterRestartOptions {
  policy?: 'always' | 'configChanged'
}

// Volumio state
interface PlayerState {
  service: string;
  status: 'play' | 'pause' | 'stop';
  title?: string;
  artist?: string;
  album?: string;
  albumart?: string;
  uri: '';
  trackType?: string;
  seek?: number;
  duration?: number;
  samplerate?: string;
  bitdepth?: string;
  bitrate?: string;
  channels?: number;
  volume?: number;
  mute?: boolean;
  isStreaming?: boolean;
  repeat?: boolean;
  repeatSingle?: boolean;
  random?: boolean;
  position?: number;
}

const HOST = 'http://localhost:3000';

export default class PeppyMeterManager {

  static #socket: SocketIOClient.Socket | null = null;
  static #lastPlayerState: PlayerState | null = null;
  static #startTimer: NodeJS.Timeout | null = null;
  static #command = this.#initCommand();
  static #restarting = false;

  static #initCommand() {
    return new ShellCommand(PEPPYMETER_RUN_SCRIPT);
  }

  static enable() {
    if (!this.#socket) {
      this.#socket = io.connect(HOST, { autoConnect: false });
      this.#socket.on('connect', this.#handleSocketConnect.bind(this));
      this.#socket.on('pushState', this.#handlePlayerStateChange.bind(this));
      this.#socket.connect();
    }
  }

  static async disable() {
    this.#clearStartTimer();
    if (this.#socket) {
      this.#socket.removeAllListeners();
      this.#socket.disconnect();
      this.#socket = null;
    }
    this.#lastPlayerState = null;

    return this.stop();
  }

  static #handleSocketConnect() {
    if (this.#socket) {
      this.#socket.emit('getState');
    }
  }

  static #clearStartTimer() {
    if (this.#startTimer) {
      clearTimeout(this.#startTimer);
      this.#startTimer = null;
    }
  }

  static #handlePlayerStateChange(state: PlayerState) {
    if (!this.isEnabled() || this.#restarting) {
      return;
    }

    const lastStateIsPlaying = (this.#lastPlayerState && this.#lastPlayerState.status === 'play');
    if (state.status === 'play' && !lastStateIsPlaying) {
      const timeout = pm.getConfigValue('startDelay');
      pm.getLogger().info(`[peppymeter] PeppyMeter will start in ${timeout} seconds`);
      this.#startTimer = setTimeout(async () => {
        if (this.#command.status !== 'ready') {
          pm.getLogger().info('[peppymeter] PeppyMeter process already running');
          return;
        }
        await this.#start();
      }, timeout * 1000);

    }
    else if (state.status !== 'play' && lastStateIsPlaying) {
      this.#clearStartTimer();
    }

    this.#lastPlayerState = state;
  }

  static isEnabled() {
    return !!this.#socket;
  }

  static async #start(callback?: () => void) {
    try {
      PeppyMeterConfig.commit();
    }
    catch (error) {
      pm.getLogger().error(
        pm.getErrorMessage('[peppymeter] PeppyMeter configuration error:', error, false));
      pm.toast('error', pm.getI18n('PEPPYMETER_ERR_START', pm.getErrorMessage('', error, false)));
      if (callback) {
        callback();
      }
      return;
    }
    try {
      pm.getLogger().info('[peppymeter] Starting PeppyMeter process');
      const execPromise = this.#command.exec();
      if (callback) {
        callback();
      }
      await execPromise;
    }
    catch (error) {
      pm.getLogger().error(
        pm.getErrorMessage('[peppymeter] PeppyMeter process error:', error, true));
      pm.toast('error', pm.getI18n('PEPPYMETER_ERR_START', pm.getErrorMessage('', error, false)));
    }
  }

  static async stop() {
    if (this.#command.status === 'running') {
      return this.#command.kill();
    }
  }

  static async restart(options: PeppyMeterRestartOptions = { policy: 'always' }) {
    const restartPolicy = options.policy || 'always';
    if (restartPolicy === 'configChanged') {
      let configChanged: boolean;
      try {
        configChanged = PeppyMeterConfig.commit(true);
      }
      catch (error) {
        // Proceed even if there are errors, so they can be handled later in `start()`.
        configChanged = true;
      }
      if (!configChanged) {
        return;
      }
    }

    const onEnd = () => {
      this.#restarting = false;
      pm.getLogger().info('[peppymeter] PeppyMeter restart end');
    };

    if (this.#restarting) {
      return;
    }
    pm.getLogger().info('[peppymeter] PeppyMeter restart begin');
    this.#clearStartTimer();
    this.#restarting = true;
    await this.stop();
    const state = pm.getVolumioState();
    if (state && state.status === 'play') {
      await this.#start(() => {
        onEnd();
      });
    }
    else {
      onEnd();
    }
  }

  static isRunning() {
    return this.#command.status === 'running';
  }
}
