
import test from 'ava'
import pty from 'pty.js'
import tempfile from 'tempfile'
import fs from 'fs'
// import * as cliExt from '../index.js'

const getOutput = (call) => {
  var term = pty.spawn('bash', ['--rcfile', 'test/fixtures/bashrc'])
  var termCall = call + '\r\n'

  return new Promise((resolve) => {
    term.on('data', (data) => {
      resolve(data.slice(termCall.length, -4))
    })
    term.write(termCall)
  })
}

const writeContents = (contents) => {
  return new Promise((resolve) => {
    var term = pty.spawn('bash', ['--rcfile', 'test/fixtures/bashrc'])

    var tmpFile = tempfile()
    var cnt = 0
    term.on('data', (data) => {
      if (data.indexOf('exit') === -1) {
        setTimeout(() => term.write('exit\n'), 100)
      }
      if(data === 'exit\r\n') {
        term.destroy()
      }
    })
    term.on('close', () => {
      resolve(fs.readFileSync(tmpFile, 'utf8'))
    })
    term.write('vi ' + tmpFile + '\ni' + contents + '\x1B:wq\n')
  })
}

test('Terminal emulator works', async (t) => {
  t.is(await getOutput('pwd'), process.cwd())
})

test.cb('Calls close after exiting the shell', (t) => {
  var term = pty.spawn('bash', ['--rcfile', 'test/fixtures/bashrc'])

  term.on('close', () => {
    t.end()
  })
  term.write('exit\n')
})

test('Can spawn vi and close it', async (t) => {
  await writeContents('')
  t.pass()
})

test('Can write contents in vi', async(t) => {
  var contents = await writeContents('written via pty')
  t.is(contents, 'written via pty\n')
})
