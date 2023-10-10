import fs from 'fs';

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
export function fileExists(path: string) {
  try {
    return fs.existsSync(path) && fs.lstatSync(path).isFile();
  }
  catch (error) {
    return false;
  }
}

export function dirExists(path: string) {
  try {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
  }
  catch (error) {
    return false;
  }
}

export function fifoExists(path: string) {
  try {
    return fs.existsSync(path) && fs.lstatSync(path).isFIFO();
  }
  catch (error) {
    return false;
  }
}