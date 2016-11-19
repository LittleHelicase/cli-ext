var cliExt = require('../../index.js')
var fs = require('fs')

var outFile = process.argv[process.argv.length - 1]
fs.writeFileSync(outFile, '')
cliExt.editContent('', '.json')
.then((contents) => fs.appendFileSync(outFile, contents))
.catch((err) => fs.appendFileSync(outFile, err))
