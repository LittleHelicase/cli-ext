
import test from 'ava'
import * as cliExt from '../index'
import {exec} from 'child_process'

test('[input] Can read a file as input', (t) =>
  cliExt.input('test/fixtures/bashrc')
  .then((text) => t.is(text, 'PS1=\'%#%\'')))

test('[input] Rejects if the file does not exist', (t) => t.throws(cliExt.input('NON_EXISTENT_FILE')))

test('[input] Reject with the missing files filename', (t) => {
  t.plan(1)
  return cliExt.input('NON_EXISTENT_FILE')
  .catch((error) => t.regex(error, /NON_EXISTENT_FILE/))
})

test('[input] Accepts file if it fulfills the verify constraints', (t) => {
  t.plan(1)
  return cliExt.input('test/fixtures/bashrc', {verify: (text) => text.length > 1})
  .then(() => t.pass())
})

test('[input] Rejects file if it violates the verify constraints', (t) =>
  t.throws(cliExt.input('test/fixtures/bashrc', {verify: (text) => text.length > 1000})))

test('[input] Verifies input via promises.', (t) => {
  t.plan(1)
  return cliExt.input('test/fixtures/bashrc', {verify: (text) => Promise.resolve(text.length > 1)})
  .then(() => t.pass())
})

test('[input] Rejects input via promises.', (t) => {
  t.throws(cliExt.input('test/fixtures/bashrc', {verify: (text) => Promise.resolve(text.length < 1)}))
})

const runCLI = (prog, args, data) => {
  return new Promise((resolve, reject) => {
    var cli = exec('node ' + prog + ' ' + args,
      (error, stdout, stderr) => {
        if (error) {
          reject({error, stderr})
        } else {
          resolve(stdout.slice(0, -1))
        }
      }
    )
    if (data) {
      if (typeof data !== 'string') {
        data = JSON.stringify(data)
      }
      cli.stdin.write(data)
    }
    cli.stdin.end()
  })
}

test('[input] Accepts STDIN input', (t) =>
  runCLI('test/fixtures/cli-test_input.js', '', 'stdin-text')
  .then((contents) => t.is(contents, 'stdin-text')))

test('[input] Accepts STDIN if is accepted by the verify constraint', (t) => {
  t.plan(1)
  return runCLI('test/fixtures/cli-test_input_constraint.js', '', 'short')
  .then(() => t.pass())
})

test('[input] Rejects STDIN if the input is rejected by the verify constraint', (t) => {
  return t.throws(runCLI('test/fixtures/cli-test_input_constraint.js', '', 'too long'))
})
