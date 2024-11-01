import * as assert from "assert";
import * as vscode from "vscode";
import Rufo from "../../formatter/rufo";
import { EOL } from "os";

suite("Rufo Tests", () => {
  const FIXTURE = `class  NeedsChanges\n  def a_method( with_bizarre_formatting)\n    non_latin='你好'\n  end\nend`;
  const CORRECT = `class NeedsChanges\n  def a_method(with_bizarre_formatting)\n    non_latin = "你好"\n  end\nend\n`;
  const PARTIALLY = `class  NeedsChanges\ndef a_method(with_bizarre_formatting)\n  non_latin = "你好"\nend\n\nend`;
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  test("test detects rufo", () => {
    const rufo = new Rufo();
    return rufo.test();
  });

  test("formats text via rufo", () => {
    return new Promise((resolve, reject) => {
      const rufo = new Rufo();
      rufo.format("echo  'a'", undefined).then((result: string) => {
        assert.strictEqual(result, 'echo "a"' + EOL);
        resolve(result);
      });
    });
  });

  test("formats whole documents", () => {
    let document: vscode.TextDocument;
    return vscode.workspace
      .openTextDocument({ language: "ruby", content: FIXTURE })
      .then((doc) => {
        document = doc;
        return vscode.window.showTextDocument(doc);
      })
      .then(() => wait(1500)) // we need to wait a little bit until rufo is loaded
      .then(() =>
        vscode.commands.executeCommand("editor.action.formatDocument")
      )
      .then(() => wait(500)) // wait until rufo executed
      .then(() => {
        assert.strictEqual(document.getText(), CORRECT);
      });
  }).timeout(20000);

  test("formats text selection", () => {
    let document: vscode.TextDocument;
    let textEdit: vscode.TextEditor;
    return vscode.workspace
      .openTextDocument({ language: "ruby", content: FIXTURE })
      .then((doc) => {
        document = doc;
        return vscode.window.showTextDocument(doc);
      })
      .then((text) => {
        textEdit = text;
        return new Promise(async (resolve) => {
          while (1) {
            if (
              vscode.extensions
                .getExtension("baer1.vscode-rufo")
                ?.exports["state"]() === "ready"
            ) {
              return resolve(undefined);
            } else {
              await wait(50);
            }
          }
        });
      })
      .then(async () => {
        const selection = new vscode.Selection(1, 0, 3, 5);
        textEdit.selection = selection;
        return new Promise((resolve) => {
          vscode.extensions
            .getExtension("baer1.vscode-rufo")!
            .exports["onformat"](() => {
              setTimeout(resolve, 50); // I could not hate this line more
            });
          vscode.commands.executeCommand("editor.action.formatSelection");
        });
      })
      .then(() => {
        assert.strictEqual(document.getText(), PARTIALLY);
      });
  });
});
