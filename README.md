# cliExt

A package for cli input handling. This package simplifies the hassle to allow file
input, piped input. It even supports editor inputs when no input is given.

# Installation

Via npm

```
npm install cli-ext
```

# Usage

```js
import * as cliExt from 'cli-ext'

// get stdin input or if none is given open an editor
cliExt.input()
.then((contents) => console.log('stdin or editor input: ', contents))

// if the second process argument is a file it opens that file
// otherwise check stdin
// default to an editor if none of the above is set
cliExt.input(process.argv[2])
.then((contents) => console.log(contents))

// opens an editor to edit the file `config.json`
cliExt.edit('./config.json')
.then((json) => ...)

// opens an editor to edit the given text
cliExt.editContent('text to display in the editor')
.then((text) => ...)
```

# API

This package exports three methods:

| Method | Description|
|------------------------|------------------|
| `.input(file, config)` | Try to read the `file` if none is given look for stdin input. If there is no stdin input open the editor specified by the environment variable $EDITOR (default nano). Returns a promise with the resulting text. The configuration `config` accepts the following keys.<br><br><ul><li>`fileType`: Specify the file type for syntax highlighting in the editor. [Default: '.json']<li> - `defaultContent`: Specify the contents of the editor if it defaults to the editor. [Default: '']<li> - `verify`: A function that is used to test the input. If the test fails and the input is specified via a file or stdin, the Promise will be rejected. If the user wrote the contents in an editor `.input` will prompt the user to *abort*, or *review* the contents. [Default: null = constant true]. |</ul> 
| `edit(file, verify)`           | Opens an editor to edit the given `file`. It is possible to specify a `verify` function that checks the user input and prompts the user to *abort*, or *review* when `verify` returns `false`. |
| `editContent(content, verify)` | Opens an editor with the given `content`. It is possible to specify a `verify` function that checks the user input and prompts the user to *abort*, or *review* when `verify` returns `false`. |
