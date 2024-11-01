# vscode-rufo

### This extension is a fork of [jnbt/vscode-rufo](https://github.com/jnbt/vscode-rufo)

This Visual Studio Code extension provides formatting via
[Rufo](https://github.com/ruby-formatter/rufo). It will be used
with files that have the “Ruby” syntax. Supports setups via [RVM](http://rvm.io)
or [rbenv](https://github.com/rbenv/rbenv).

## Installation

This extension can currently not be installed.
Please consider installing the original for now: [jnbt/vscode-rufo](https://github.com/jnbt/vscode-rufo#installation)

### `rufo` installation

Before using this plugin, you must ensure that `rufo`, version 0.10.0 or
higher, is installed on your system. To install `rufo`, do the following:

1.  Install [Ruby](https://www.ruby-lang.org/).

2.  Install [Rufo](https://github.com/ruby-formatter/rufo#installation) by typing the
    following in a terminal:

    ```shell
    gem install rufo
    ```

If you're are using [RVM](http://rvm.io) or [rbenv](https://github.com/rbenv/rbenv), seek
for more information below.

If you are using Windows, please use the settings [below](#on-windows).

## Settings

You can configure vscode-rufo in your workspace or user settings. You can either

a) Open VS Code settings menu, select "Extensions" and scroll down to "Rufo"

b) Manually adjust your settings via your `settings.json` file:

```js
{
  ...
  "rufo.exe": "rufo",  // can be an absolute path
  "rufo.args": [],
  "rufo.useBundler": false,
}
```

**Attention:** Restart Visual Studio Code after you have made changes to the settings.

### **On Windows:**

- `"rufo.exe": "cmd"`
- `"rufo.args": ["/c", "rufo.bat"]`

### Using RVM

If your setup instruments [RVM](http://rvm.io) to install Ruby version
you might receive errors indicating Rufo can't be found. Because `rufo`
might not be in your current PATH, you need to change the executable
to the RVM-wrapped one:

```js
"rufo.exe": "/Users/You/.rvm/gems/ruby-2.3.6/wrappers/rufo"
```

### Using `rbenv`

If your setup instruments [rbenv](https://github.com/rbenv/rbenv), you should
point the executable to the Rufo shim generated by rbenv. This way the extension
will continue to work after you upgrade your Ruby:

```js
"rufo.exe": "/Users/You/.rbenv/shims/rufo"
```

## Develop

- Use Visual Studio Code to develop this extension
- Run `npm install` to install the dependencies
- Press `F5` to open a new window with the extension loaded
- Open a Ruby file or paste some Ruby code into the window
- Open the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac)
- Choose either "Format Document" for "Format Selection".
- Find output from the extension in the debug console.

## Testing

- Open the debug viewlet (`Ctrl+Shift+D` or `Cmd+Shift+D` on Mac) and from the launch configuration dropdown pick `Launch Tests`
- Press `F5` to run the tests in a new window with your extension loaded
- See the output of the test result in the debug console

## Contributing

1. [Fork it](https://github.com/baerchen201/vscode-rufo/fork)
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request
