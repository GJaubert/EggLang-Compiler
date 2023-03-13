#!/usr/bin/env node
const eggRepl = require('../lib/eggRepl.js');
var {runFromFile, loadPlugins}  = require('../lib/eggvm.js');
const {version} = require('../package.json').version;
const program = require('commander');

program.version(version)
program.description('Lee un programa en lenguaje egg y devuelve el resultado')
program.usage('[opciones]')
program.option('<nombreFicheroEntrada>', 'Si se añade un nombre de fichero, se leerá en vez de ejecutar el bucle relp');
program.option('-p <ruta del fichero>', 'Añade plugins a tu programa');

program.parse(process.argv);
const fileName = program.args.shift();
const options = program.opts();
if (fileName) {
  if (fileName && fileName.length > 0) {
    if (options.p) {
      loadPlugins(options.p);
    }
    runFromFile(fileName)
  }
} else {
  eggRepl();
}