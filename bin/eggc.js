#!/usr/bin/env node
var {parseFromFile}  = require('../lib/parse.js');
const {version} = require('../package.json').version;
const program = require('commander');

program.version(version)
program.description('Lee un programa en lenguaje egg y devuelve un árbol con el programa compilado')
program.usage('<nombre del fichero de entrada>');

program.parse(process.argv);
const fileName = program.args.shift();

if (fileName && fileName.length > 0) parseFromFile(fileName);
