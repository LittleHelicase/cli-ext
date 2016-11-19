
import test from 'ava'
import pty from 'pty.js'
import tempfile from 'tempfile'
import fs from 'fs'
import * as cliExt from '../index.js'
import {dropWhile, negate} from 'lodash'

// use a custom bashrc to ensure determinism

const isBashLine = (line) => line.indexOf('%#%') === 0

const filterOutput = (output) => {
  return dropWhile(output.split('\r\n'), negate(isBashLine))
    .filter(negate(isBashLine))
    .join('\n')
}

const getOutput = (call) => {
  var term = pty.spawn('bash', ['--rcfile', 'test/fixtures/bashrc'])
  var termCall = call + '\n'

  return new Promise((resolve) => {
    term.on('data', (data) => {
      resolve(filterOutput(data))
    })
    term.write(termCall)
  })
}

const writeContentsTo = (contents, call, tmpFile) => {
  return new Promise((resolve) => {
    var term = pty.spawn('bash', ['--rcfile', 'test/fixtures/bashrc'])

    term.on('data', (data) => {
      if (data.indexOf('exit') === -1) {
        setTimeout(() => term.write('exit\n'), 1000)
      }
      if(data === 'exit\r\n') {
        term.destroy()
      }
    })
    term.on('close', () => {
      resolve(fs.readFileSync(tmpFile, 'utf8'))
    })
    term.write(call + ' ' + tmpFile + '\ni' + contents + '\x1B:wq\n')
  })
}

const writeContents = (contents) => {
  var tmpFile = tempfile()
  return writeContentsTo(contents, 'vi', tmpFile)
}

test('[pty] Terminal emulator works', async (t) => {
  t.is(await getOutput('pwd'), process.cwd())
})

test.cb('[pty] Calls close after exiting the shell', (t) => {
  var term = pty.spawn('bash', ['--rcfile', 'test/fixtures/bashrc'])

  term.on('close', () => {
    t.end()
  })
  term.write('exit\n')
})

test('[pty] Can spawn vi and close it', async (t) => {
  await writeContents('')
  t.pass()
})

test('[pty] Can write contents in vi', async(t) => {
  var contents = await writeContents('written via pty')
  t.is(contents, 'written via pty\n')
})

test('[editContents] Prompts the user for input', async (t) => {
  process.env.EDITOR = 'vi' // ensure vi usage
  var tmpFile = tempfile()
  var contents = await writeContentsTo('edit', 'node test/fixtures/cli-test.js', tmpFile)
  t.is(contents, 'edit\n')
})
