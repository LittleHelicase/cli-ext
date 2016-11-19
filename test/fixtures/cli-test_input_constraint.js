var cliExt = require('../../index.js')
var fs = require('fs')

var log = (what) => console.log(what)
if (process.argv.length > 2) {
  var outFile = process.argv[process.argv.length - 1]
  var log = (what) => fs.writeFileSync(outFile, what)
}
cliExt.input(null, {verify: (text) => text.length < 7})
.then(log)
.catch((err) => {
  log(err)
  process.exit(1)
})
