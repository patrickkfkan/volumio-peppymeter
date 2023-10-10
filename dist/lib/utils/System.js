"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fifoExists = exports.dirExists = exports.fileExists = void 0;
const fs_1 = __importDefault(require("fs"));
/*Export class ExecCommandError extends Error {
  proc: ChildProcess;

  constructor(proc: ChildProcess, err: Error) {
    super();
    this.name = 'ExecCommandError';
    this.message = err.message;
    this.stack = err.stack;
    this.proc = proc;
  }
}

export function execCommand(cmd: string, sudo = false, logError = true, processCallback?: (proc: ChildProcess) => void) {
  return new Promise<string>((resolve, reject) => {
    pm.getLogger().info(`[peppymeter] Executing ${cmd}`);
    const p = exec(sudo ? `echo volumio | sudo -S ${cmd}` : cmd, { uid: 1000, gid: 1000 }, function (error, stdout, stderr) {
      if (error) {
        if (logError) {
          pm.getLogger().error(pm.getErrorMessage(`[peppymeter] Failed to execute ${cmd}: ${stderr.toString()}`, error));
        }
        reject(new ExecCommandError(p, error));
      }
      else {
        resolve(stdout.toString());
      }
    });
    if (processCallback) {
      processCallback(p);
    }
  });
}
*/
/*Export function spawnCommand(cmd: string, sudo = false, logOutput = true, processCallback?: (proc: ChildProcess) => void) {
  const s = spawn(sudo ? `echo volumio | sudo -S ${cmd}` : cmd, { uid: 1000, gid: 1000 });
  pm.getLogger().info(`[peppymeter] (PID: ${s.pid}) Spawned process for command: ${cmd}`);
  s.stdout.on('data', (msg) => {
    pm.getLogger().info(`[peppymeter] (PID: ${s.pid}) stdout: ${msg.toString()}`);
  });
  s.stderr.on('data', (msg) => {
    pm.getLogger().info(`[peppymeter] (PID: ${s.pid}) stderr: ${msg.toString()}`);
  });
  s.on('close', (code, signal) => {
    pm.getLogger().info(`[peppymeter] (PID: ${s.pid}) Closed - code: ${code}, signal: ${signal}`);
  });
  s.on('error', (err) => {
    pm.getLogger().error(`[peppymeter] (PID: ${s.pid}) Error: ${err.message}`);

  });
}
*/
function fileExists(path) {
    try {
        return fs_1.default.existsSync(path) && fs_1.default.lstatSync(path).isFile();
    }
    catch (error) {
        return false;
    }
}
exports.fileExists = fileExists;
function dirExists(path) {
    try {
        return fs_1.default.existsSync(path) && fs_1.default.lstatSync(path).isDirectory();
    }
    catch (error) {
        return false;
    }
}
exports.dirExists = dirExists;
function fifoExists(path) {
    try {
        return fs_1.default.existsSync(path) && fs_1.default.lstatSync(path).isFIFO();
    }
    catch (error) {
        return false;
    }
}
exports.fifoExists = fifoExists;
//# sourceMappingURL=System.js.map