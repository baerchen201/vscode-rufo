import * as cp from 'child_process';
import { platform } from 'os';
import * as vscode from 'vscode';

type RufoOptions = {
  batchFile: boolean,
  exe: string,
  useBundler: boolean
};

const DEFAULT_OPTIONS: RufoOptions = {
  batchFile: false,
  exe: "rufo",
  useBundler: false
};

function cleanUpError(message: string) {
  return message.replace('STDIN is invalid code. ', '');
}

export default class Rufo {
  public test(): Promise<void> {
    return new Promise((resolve, reject) => {
      const rufo = this.spawn(['-v']);

      if (rufo.stderr === null) {
        const msg = "Couldn't initialize STDERR";
        console.warn(msg);
        vscode.window.showErrorMessage(msg);
        reject(msg);
        return;
      }

      rufo.on('error', err => {
        console.warn(err);

        if (err.message.includes('ENOENT')) {
          vscode.window.showErrorMessage(`couldn't find ${this.exe} for formatting (ENOENT)`);
        } else {
          vscode.window.showErrorMessage(`couldn't run ${this.exe} '${err.message}'`);
        }
        reject(err);
      });

      rufo.stderr.on('data', data => {
        // for debugging
        console.log(`Rufo stderr ${data}`);
      });

      rufo.on('exit', code => {
        if (code) {
          vscode.window.showErrorMessage(`Rufo failed with exit code: ${code}`);
          return reject();
        }
        resolve();
      });
    });
  }

  public format(data: string, fileName: string | undefined): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = ["-x"]; // Simple exit codes: 1 or 0

      if(fileName) {
        args.push(`--filename=${fileName}`);
      }

      const rufo = this.spawn(args);

      if (rufo.stdin === null || rufo.stdout === null || rufo.stderr === null) {
        const msg = "Couldn't initialize STDIN, STDOUT or STDERR";
        console.warn(msg);
        vscode.window.showErrorMessage(msg);
        reject(msg);
        return;
      }

      // we need to assume UTF-8, because vscode's extension API doesn't provide
      // functionality to retrieve or set the current encoding:
      // https://github.com/microsoft/vscode/issues/824
      rufo.stdin.setDefaultEncoding('utf-8');
      rufo.stdout.setEncoding('utf-8');

      let result = '';
      let error = '';
      rufo.on('error', err => {
        console.warn(err);
        vscode.window.showErrorMessage(`couldn't run ${this.exe} '${err.message}'`);
        reject(err);
      });
      rufo.stdout.on('data', data => {
        result += data.toString();
      });
      rufo.stderr.on('data', data => {
        console.warn(`Rufo STDERR: ${data}`);
        error += data.toString();
      });
      rufo.on('exit', code => {
        if (code) {
          const cleanedError = cleanUpError(error);
          const msg = cleanedError.length ? cleanedError : `Rufo failed with exit code: ${code}`;
          vscode.window.showErrorMessage(msg);
          return reject();
        }
        resolve(result);
      });
      rufo.stdin.write(data);
      rufo.stdin.end();
    });
  }

  private get exe(): string[] {
    const {exe, useBundler} = this.options;
    if (this.options.batchFile) {
      const bat = exe.endsWith(".bat") || exe.endsWith(".cmd") ? exe : `${exe}.bat`;
      return useBundler ? [`bundle exec cmd /c ${bat}`] : [`cmd /c ${bat}`];
    } else {
      return useBundler ? [`bundle exec ${exe}`] : [exe];
    }
  }

  private get options(): RufoOptions {
    const config = vscode.workspace.getConfiguration('rufo');
    if (typeof config.get("rufo.batchFile") !== "boolean") {
      config.update("rufo.batchFile", platform() === "win32", true);
    }
    const opts = Object.assign({}, DEFAULT_OPTIONS, config);
    return opts;
  }

  private spawn = (args: string[], spawnOpt: cp.SpawnOptions = {}): cp.ChildProcess => {
    const exe = this.exe;

    if (!spawnOpt.cwd) {
      spawnOpt.cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    }

    if (!spawnOpt.env) {
      // also here we need to assume UTF-8 (see above)
      spawnOpt.env = { ...process.env, LANG: "en_US.UTF-8" }; // eslint-disable-line @typescript-eslint/naming-convention
    }

    console.log(exe, args);

    const cmd = exe.shift() as string;
    return cp.spawn(cmd, exe.concat(args), spawnOpt);
  };
}
