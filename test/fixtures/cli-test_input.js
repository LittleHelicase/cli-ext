var cliExt = require('../../index.js')
var fs = require('fs')

var outFile = process.argv[process.argv.length - 1]
cliExt.input()
.then((contents) => fs.writeFileSync(outFile, contents))
.catch((err) => fs.writeFileSync(outFile, err))
