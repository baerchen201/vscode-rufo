import * as path from "path";
import * as Mocha from "mocha";
import * as vscode from "vscode";
import { glob } from "glob";
import { platform } from "os";

export async function run(): Promise<void> {
  const configs = vscode.workspace.getConfiguration("rufo");
  switch (platform()) {
    case "win32":
      await configs.update("exe", "cmd", true);
      await configs.update("args", ["/c", "rufo.bat"], true);
      break;

    default:
      break;
  }

  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    timeout: 5000,
  });

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((resolve, reject) => {
    glob("**/**.test.js", { cwd: testsRoot })
      .then((files) => {
        // Add files to the test suite
        files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
          mocha.run((failures) => {
            if (failures > 0) {
              reject(new Error(`${failures} tests failed.`));
            } else {
              resolve();
            }
          });
        } catch (err) {
          console.error(err);
          reject(err);
        }
      })
      .catch((err) => reject);
  });
}
