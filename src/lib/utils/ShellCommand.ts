import { ChildProcess, spawn } from 'child_process';
import pidtree from 'pidtree';
import pm from '../PeppyMeterContext';

export interface ShellCommandOptions {
  sudo?: boolean;
  logging?: boolean;
}

export class ShellCommand {

  #status: 'ready' | 'running' | 'killing';
  #cmd: string;
  #sudo: boolean;
  #logging: boolean;
  #process: ChildProcess | null;

  constructor(cmd: string, options?: ShellCommandOptions) {
    this.#cmd = cmd;
    this.#sudo = options?.sudo !== undefined ? options.sudo : false;
    this.#logging = options?.logging !== undefined ? options.logging : true;
    this.#process = null;
    this.#status = 'ready';
  }

  exec() {
    if (this.#process) {
      throw Error('Command execution already in progress');
    }
    return new Promise<string>((resolve, reject) => {
      this.#status = 'running';
      let lastError: Error | null = null;
      let out = '';

      const s = spawn(this.#sudo ? `echo volumio | sudo -S ${this.#cmd}` : this.#cmd, { uid: 1000, gid: 1000, shell: true });
      const pid = s.pid;

      if (this.#logging) {
        pm.getLogger().info(`[peppymeter] (PID: ${pid}) Process spawned for cmd: ${this.#cmd}`);
      }

      s.stdout.on('data', (msg) => {
        if (this.#logging) {
          pm.getLogger().info(`[peppymeter] (PID: ${pid}) Process stdout: ${msg.toString()}`);
        }
        out += msg.toString();
      });
      s.stderr.on('data', (msg) => {
        if (this.#logging) {
          pm.getLogger().info(`[peppymeter] (PID: ${pid}) Process stderr: ${msg.toString()}`);
        }
      });
      s.on('close', (code, signal) => {
        if (this.#logging) {
          const withErr = lastError ? ' with error' : '';
          pm.getLogger().info(`[peppymeter] (PID: ${pid}) Process closed${withErr} - code: ${code}, signal: ${signal}`);
        }
        if (this.#status !== 'killing' && lastError) {
          reject(lastError);
        }
        this.#reset();
        resolve(out);
      });
      s.on('error', (err) => {
        const isKilling = this.#status !== 'killing';
        if (this.#logging && !isKilling) {
          pm.getLogger().error(`[peppymeter] (PID: ${pid}) Process error: ${err.message}`);
        }
        if (!isKilling) {
          lastError = err;
        }
      });

      this.#process = s;
    });
  }

  setLogging(value: boolean) {
    this.#logging = value;
  }

  async kill() {
    if (this.#status !== 'running' || !this.#process) {
      throw Error('Command is not running');
    }
    this.#status = 'killing';
    const proc = this.#process;
    return new Promise<void>(async (resolve) => {
      try {
        const tree = await pidtree(proc.pid, { root: true });
        const target = tree.pop();
        if (target) {
          pm.getLogger().info(`[peppymeter] Killing last child of process tree (pids: ${tree.join(' ')} *${target}*)`);
          proc.once('close', () => {
            this.#reset();
            resolve();
          });
          await this.#sigkill(target);
        }
      }
      catch (error) {
        pm.getLogger().error(
          pm.getErrorMessage('[peppymeter] Failed to kill process - resolving anyway:', error, false));
        this.#reset();
        resolve();
      }
    });
  }

  async #sigkill(pid: number) {
    return new ShellCommand(`/bin/kill -9 ${pid}`).exec();
  }

  #reset() {
    if (this.#process) {
      this.#process.stdout?.removeAllListeners();
      this.#process.stderr?.removeAllListeners();
      this.#process.removeAllListeners();
      this.#process = null;
      this.#status = 'ready';
    }
  }

  get status() {
    return this.#status;
  }
}
