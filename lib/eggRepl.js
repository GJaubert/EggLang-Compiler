const XRegExp = require('xregexp');
let inspect = require('util').inspect;
let readline = require('readline');
let egg = require('../lib/eggvm.js');
const {eggExit, help} = require("../lib/extensions");
let topEnv = egg.topEnv;
let specialForms = egg.specialForms;
let parser = egg.parser;
const {BLUE, RED, YELLOW, DEFAULT} = require("../lib/colors.js");
const PROMPT = DEFAULT + '> ';

const ALLWHITE = new XRegExp('^' + parser.WHITES.source + '$');
const LP = parser.LP;
const RP = parser.RP;
const getToken = parser.lex;
const parBalance = function(line) {
  const LP_GLOBAL = new RegExp(LP.source, 'ig');
  const RP_GLOBAL = new RegExp(RP.source, 'ig');
  let matchLP = line.match(LP_GLOBAL);
  let matchRP = line.match(RP_GLOBAL);
  if (!matchLP) {
    matchLP = [];
  }
  if (!matchRP) {
    matchRP = [];
  }
  return matchLP.length - matchRP.length;
}

let version = require('../package.json').version;

function eggRepl() {
  let program = "";
  let stack = 0;
  try {
    topEnv["version"] = version;
    let rl = readline.createInterface({input: process.stdin, output: process.stdout, completer});
    rl.prompt(PROMPT); 
    console.log(BLUE + "Version " + version + DEFAULT);
    rl.prompt(); // probar sin comentar

    rl.on('line', function (line) {
      stack += parBalance(line);
      line = line + '\n';
      program += line;
      if (ALLWHITE.test(program)) {
        console.log(program)
      }

      if (stack <= 0 && !ALLWHITE.test(program)) {
        try {
          let tree = parser.parse(program);
          let r = egg.evaluate(tree, topEnv);
          console.log(YELLOW + String(r) + DEFAULT);
        } catch (e) {
          console.log(RED + e);
        }
        program = "";
        stack = 0;
      }

      rl.setPrompt(PROMPT + "..".repeat(stack));
      rl.prompt();
    });
    rl.on('close', eggExit);
    rl.on('SIGINT', () => {
      rl.prompt();
      rl.clearLine(process.stdout, 0);
      console.log(RED + 'Expression discarded');
      program = "";
      stack = 0;
      rl.setPrompt(PROMPT);
      rl.prompt();
    });

  } catch (e) {
    console.log(RED(err));
    help();
  }
  
  process.stdin.on("end", eggExit);
}

function completer(line) {
  // let tokens = [];
  // token = getToken(line);
  // tokens.push(token);
  // while (token) {
  //   token = getToken(line);
  //   tokens.push(token);
  // }
  let word = line.split(/[^a-zA-Z0-9]/).pop();

  let allKeys = Object.keys(specialForms).concat(Object.keys(topEnv));
  let hits = allKeys.filter((key) => key.startsWith(word));
  return [hits, word];
}

module.exports = eggRepl;