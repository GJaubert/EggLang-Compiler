const inspect = require("util").inspect;
let ins = (x) => inspect(x, {depth: null});
const {Value, Word, Apply} = require('./ast.js');
let fs = require("fs");
// Cuando es word entra en parseApply, y este devuelve un objeto, que tendrá como argumentos un vector de más objetos.
//  el rollo es que cada objeto se puede representar escrito como un nodo
const WHITES = /(?<WHITES>(\s|[#;].*|\/\*(.|\n)*?\*\/)+)/;
const STRING = /(?<STRING>"((?:[^"\\]|\\.)*)")/;
const NUMBER = /(?<NUMBER>([-+]?\d*\.?\d+([eE][-+]?\d+)?))/;
const WORD   = /(?<WORD>([^\s(){},"]+))/; // No se niega el dígito ni el signo
const LP     = /(?<LP>([({]))/;
const RP     = /(?<RP>[)}])/;
const COMMA  = /(?<COMMA>(,))/;
const NEWLINE = /(?<NEWLINE>\r\n|\r|\n)/;

const myTokens = [
  NEWLINE, WHITES, STRING, NUMBER,
  WORD, LP, RP, COMMA
];

let program;
let lookahead;
let lineno = 1;
let offset = 0;
let col = 1;

/**
 * Sets program line at 1
 * @param {*} prg 
 * @return {vector} program and line number
 */

let setProgram = function(prg) {
  program = prg;
  lineno = 1;
  return {program, lineno}
};

/**
 * Returns program
 * @return program and line number
 */
let getProgram = function() {
  return {program, lineno}
};

const regexp = regExpUnify(myTokens)
let lex = buildLexer(regexp);

// function lex() {
//     let match;

//     match = WHITES.exec(program);
//     if (NEWLINE.test(match[0])) {
//       lineno += match[0].split(NEWLINE).length-1;
//     }
//     program = program.slice(match[0].length);

//     if (program.length > 0) {
//       if (match = STRING.exec(program)) {
//         lookahead = { type: "STRING", value: match[1]}
//       } else if (match = NUMBER.exec(program)) {
//         lookahead = {type: "NUMBER", value: Number(match[1])};
//       } else if (match = LP.exec(program)) { 
//         lookahead = {type: "LP", value: match[1]};
//       } else if (match = COMMA.exec(program)) {
//         lookahead = {type: "COMMA", value: match[1]};
//       } else if (match = RP.exec(program)) {
//         lookahead = {type: "RP", value: match[0]};
//       } else if (match = WORD.exec(program)) {
//         lookahead = {type: "WORD", value: match[1]};
//       } else {
//         throw new SyntaxError(`Unexpect syntax line ${lineno}: ${program.slice(0,10)}`);
//       }
//       program = program.slice(match[0].length);
//     }
//     else {
//       lookahead = null; // End of input reached!
//     }
//     return lookahead;
// }

function buildLexer(regexp) {
  return function() {
    let match;
    let lastIndex = regexp.lastIndex;
    if (match = regexp.exec(program)) {
      if (match) { // comprobamos que ha casado y no es nulo
        offset += match[0].length;
        col += match[0]. length;
      }
      let t = getTokenName(match.groups);
      if ((t === 'NEWLINE') || (t === 'WHITES')) {
        if (t === 'NEWLINE') {
          lineno++;
          col = 1;
        }
        return lex();
      } else {
        let lexerObject; 
        if (t == 'NUMBER') {
          lexerObject = { 'type': t, 'value': Number(match.groups[t]), 'offset': offset };
        } else {
          lexerObject = { 'type': t, 'value': match.groups[t], 'offset': offset };
        }
        return lexerObject;
      }
    } else {
      if (offset < program.length) {
        let lexerObject;
        if (program.slice(lastIndex).search(/\s/) === -1) {
          lexerObject = { 'type': 'ERROR', 'value': program.substring(offset)};
        } else {
          lexerObject = { 'type': 'ERROR', 'value': program.substring(offset, program.slice(lastIndex).search(/\s/) + lastIndex)};
        }
        lexerObject.offset = offset;
        return lexerObject;
      } else {
        lookahead = null;
      }
    }
    return lookahead; // end of input
  }
}


/**
 * Unifies all regexs
 * @param {vector} vector of regexp
 */
function regExpUnify(regexps) {
  const sources = regexps.map(r => r.source);
  const union = sources.join('|');
  return new RegExp(union, 'uy');
}

/**
 * Extracts name of group of a given match
 * @param {*} matchGroups groups of matches
 * @returns token name
 */
const getTokenName = (matchGroups) => {
  for (let key in matchGroups) {
    if (typeof matchGroups[key] !== 'undefined') {
      return key;
    }
  }
  return;
};

/**
 * Parses a given expression
 * @return Expression or parseApply
 */
function parseExpression() {
  let expr;
  //lookahead = lex();
  // if (!lookahead) { //significa que es white o undefined
  //   lookahead = lex();
  // }
  if (lookahead.type == "STRING") {
    expr = new Value({type: "value", value: lookahead.value});
    lookahead = lex();
    return expr;
  } else if (lookahead.type == "NUMBER") {
    expr = new Value({type: "value", value: lookahead.value});
    lookahead = lex();
    return expr;
  } else if (lookahead.type == "WORD") {
    expr = new Word({type: "word", name: lookahead.value});
    lookahead = lex();
    return parseApply(expr);
  } else if (lookahead.type == "ERROR") {
    throw new SyntaxError(`Unexpected syntax line ${lineno}, col ${col}: ${lookahead.value}`);
  } else {
    throw new SyntaxError(`Unexpected syntax line ${lineno}, col ${col}: ${program.slice(offset, offset + 10)}`);
  }
}

/**
 * Parse and apply production rule
 * @param {*} tree 
 * @return object tree
 */
function parseApply(tree) {
  // if (!lookahead) return tree;   // apply: /* vacio */
  // if (lookahead.type !== "LP") return tree; // apply: /* vacio */

  if (!lookahead) return tree; // End of input: apply: /* vacio */
  if ((lookahead.type === "RP")|| (lookahead.type === 'COMMA')) // apply: /* vacio */
    return tree;

  if (lookahead.type !== "LP") throw new SyntaxError(`Error: Found ${lookahead.type}, Expected ',' or '(' or ')' on line ${lineno}, col ${col}`);

  lookahead = lex();

  tree = new Apply({type: 'apply', operator: tree, args: []});
  while (lookahead && lookahead.type !== "RP") {
    let arg = parseExpression();
    tree.args.push(arg);

    if (lookahead && lookahead.type == "COMMA") {
      lookahead = lex();
    } else if (!lookahead || lookahead.type !== "RP") {
      throw new SyntaxError(`Expected ',' or ')'  at line ${lineno}, col ${col}: ... ${program.slice(offset, offset + 10)}`);
    }
  }
  if (!lookahead)  throw new SyntaxError(`Expected ')'  at line ${lineno}, col ${col}: ... ${program.slice(offset, offset + 10)}`);
  lookahead = lex();

  return parseApply(tree);
}

/**
 * Parses a program
 * @param {*} p 
 * @return {object} tree - results
 */
function parse(p) {
  setProgram(p);
  lookahead = lex();
  let result = parseExpression();
  if (lookahead !== null) 
    throw new SyntaxError(`Unexpected input after reached the end of parsing ${lineno}, col ${col}: ${program.slice(offset, offset + 10)}`);
  return result;
}

/**
 * Compiles a program and writes it in other file
 * @param {*} fileName 
 */
function parseFromFile(fileName) {
  try {
    let program = fs.readFileSync(fileName, 'utf8');
    let tree = parse(program);
    let json = JSON.stringify(tree, null, "  ");
    fs.writeFileSync(fileName+".evm", json);
  }
  catch (err) {
    console.log(err);
  }
}

module.exports = {
  getProgram,
  lex,
  parse,
  parseApply,
  parseExpression,
  parseFromFile,
  setProgram,
  WHITES,
  STRING,
  NUMBER,
  WORD,
  LP,
  RP,
  COMMA,
  NEWLINE
};