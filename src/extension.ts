import * as vscode from "vscode";
import registerFormatter from "./formatter";

const DOCUMENT_SELECTOR: { language: string; scheme: string }[] = [
  { language: "ruby", scheme: "file" },
  { language: "ruby", scheme: "untitled" },
  { language: "erb", scheme: "file" },
  { language: "erb", scheme: "untitled" },
  { language: "gemfile", scheme: "file" },
  { language: "gemfile", scheme: "untitled" },
];

export function activate(context: vscode.ExtensionContext) {
  let state: "init" | "ready" | "crashed" = "init";

  const callbacks: (() => void)[] = [];

  // register Rufo-based formatter
  registerFormatter(context, DOCUMENT_SELECTOR, () => {
    callbacks.forEach((func) => func());
  })
    .then(() => {
      state = "ready";
    })
    .catch(() => {
      state = "crashed";
    });

  return {
    state: () => state,
    onformat: (func: () => void) => {
      callbacks.push(func);
    },
  };
}

export function deactivate() {}
