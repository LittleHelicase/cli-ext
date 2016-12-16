
const fs = require('fs')
const getStdin = require('get-stdin')
const spawn = require('child_process').spawn
const tempfile = require('tempfile')
const prompt = require('prompt-promise')
const resolvePath = require('path').resolve

function getFileContents (file) {
  return new Promise((resolve, reject) => {
    fs.exists(file, (exists) => {
      if (exists) {
        fs.readFile(file, 'utf8', (err, contents) => {
          if (err) {
            reject(err)
          } else {
            resolve(contents)
          }
        })
      } else {
        reject('File does not exist: ' + resolvePath(file))
      }
    })
  })
}

function trimNewLine (str) {
  if (str[str.length -1] === '\n') {
    return str.slice(0, -1)
  }
  return str
}

const edit = (file) => {
  return new Promise((resolve, reject) => {
    var editorCmd = process.env.EDITOR || 'nano'
    var editor = spawn(editorCmd, [file], {stdio: 'inherit'})
    editor.on('exit', () => {
      fs.readFile(file, 'utf8', (err, contents) => {
        if (err) {
          reject(err)
        } else {
          resolve(contents)
        }
      })
    })
  }).then(trimNewLine)
}

const editContent = (initialContent, fileType, verify) => {
  var tmpFile = tempfile(fileType)
  fs.writeFileSync(tmpFile, initialContent, 'utf8')
  return edit(tmpFile)
  .then((content) => ((!verify) ? Promise.resolve(true) : Promise.resolve(verify(content)))
    .then((isOk) => {
      if (isOk) {
        fs.unlinkSync(tmpFile)
        return content
      } else {
        return prompt('You entered a not valid document. Do you want to continue (c), reset (r) or abort (a): ')
        .then((res) => {
          process.stdin.pause()
          if (res === 'c') {
            return editContent(content, fileType, verify)
          } else if (res === 'r') {
            return editContent(initialContent, fileType, verify)
          } else {
            throw new Error('User aborted editing.')
          }
        })
      }
    })
  )
}

function fileStdinOrEdit (file, {inStream = process.stdin, fileType = '.json', defaultContent = '', verify = null}) {
  if (file && file.length > 0) {
    return getFileContents(file)
    .then((text) => (!verify || verify(text)) ? text : Promise.reject('Contents do not satisfy constraints.'))
  } else if (!process.stdin.isTTY) {
    return getStdin().then(trimNewLine)
    .then((text) => (!verify || verify(text)) ? text : Promise.reject('Contents do not satisfy constraints.'))
  } else {
    return editContent(defaultContent, fileType, verify)
  }
}

/**
 * Gets the input for a CLI process by
 *
 *  1. Checking if the input file is given and okay.
 *  2. If no input file is given: Look for input on stdin
 *  3. Else start an editor to get user input. It will spawn the editor specified by
 *     the `EDITOR` environment variable or if none is set it will try to spawn nano.
 *
 * @params {string} file The path to a file.
 * @params [inStream] An input stream. If none is given `process.stdin` will be used.
 * @returns {Promise<string>} Returns a promise that resolves the input string
 */
function input (file, conf) {
  conf = conf || {}
  return fileStdinOrEdit(file, conf)
}

module.exports = {
  input,
  edit,
  editContent
}
