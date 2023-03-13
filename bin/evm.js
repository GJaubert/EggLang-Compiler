#!/usr/bin/env node
var {runFromEVM}  = require('../lib/eggvm.js');

const {version} = require('../package.json').version;
const program = require('commander');

program.version(version)
program.description('Lee un árbol compilado del lenguaje egg y devuelve el resultado')
program.usage('<nombre del fichero de entrada>');

program.parse(process.argv);
const fileName = program.args.shift();

if (fileName && fileName.length > 0) runFromEVM(fileName);