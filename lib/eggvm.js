let insp = require("util").inspect;
let ins = (x) => insp(x, {depth: null});
const {Value, Word, Apply, json2Ast, j2a} = require('./ast.js');
let fs = require("fs");

let specialForms = Object.create(null); // new Map;

specialForms['if'] = function(args, env) {
  if (args.length != 3) {
    throw new SyntaxError('Bad number of args to if');
  }

  if (args[0].evaluate(env) !== false) {
    return args[1].evaluate(env);
  } else {
    return args[2].evaluate(env);
  }
};

specialForms['while'] = function(args, env) {
  if (args.length != 2) {
    throw new SyntaxError('Bad number of args to while');
  }

  while(args[0].evaluate(env) !== false) {
    args[1].evaluate(env);
  }
  // Egg has no undefined so we return false when there's no meaningful result.
  return false;
};

specialForms['do'] = function(args, env) {
  let value = false;

  args.forEach(function(arg) {
    //console.log(arg)
    value = arg.evaluate(env);
  });

  return value;
};

specialForms['def'] = specialForms['define'] = specialForms[':='] = 
function(args, env) {
  if (args.length != 2 || args[0].type != 'word') {
    throw new SyntaxError('Bad use of define');
  }

  let value = args[1].evaluate(env);
  env[args[0].name] = value;
  return value;
};

/**
 * do(
 *  define(substract, fun(val1, val2,
 *    -(val1,val2)
 *  )),
 * substract(4,3)
 * )
 */
specialForms['->'] = specialForms['fun'] = function(args, env) {
  if (!args.length) {
    throw new SyntaxError('Functions need a body.')
  }

  function name(expr) {
    if (expr.type != 'word') {
      throw new SyntaxError('Arg names must be words');
    }

    return expr.name;
  }

  let argNames = args.slice(0, args.length - 1).map(name);
  let body = args[args.length - 1];

  return function() {
    if (arguments.length != argNames.length) {
      throw new TypeError('Wrong number of arguments');
    }

    let localEnv = Object.create(env);
    for (let i = 0; i < arguments.length; i++) {
      localEnv[argNames[i]] = arguments[i];
    }

    return body.evaluate(localEnv);
  };
};

specialForms["set"] = specialForms['='] = function(args, env) {
  debugger;
  if (args.length != 2 || args[0].type != 'word') {
    throw new SyntaxError('Bad use of set');
  }

  let valName = args[0].name;
  let value = args[1].evaluate(env);
  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, valName)) {
      scope[valName] = value;
      return value;
    }
  }
  throw new ReferenceError(`Tried setting an undefined variable: ${valName}`);
};


let topEnv = Object.create(null); // new Map;
topEnv['true'] = true;
topEnv['false'] = false;

[
  '+', 
  '-', 
  '*', 
  '/', 
  '==', 
  '<', 
  '>',
  '&&',
  '||'
].forEach(op => {
  topEnv[op] = new Function('a, b', `return a ${op} b;`);
});

topEnv['print'] = function(value) {
  debugger;
  console.log(value);
  return value;
};

topEnv["arr"] = topEnv["array"] = function(...args) {
  return args;
};

topEnv["length"] = function(array) {
  return array.length;
};

topEnv["[]"] = topEnv["element"] = topEnv["<-"] =
function(array, n) {
  return array[n];
};

module.exports = {specialForms, topEnv};
//console.log(specialForms);
let parser = require('./parse.js');
let parse = parser.parse;

function loadPlugins(path) {
  const extendedEgg = require(path);
  specialForms = extendedEgg.specialForms;
  topEnv = extendedEgg.topEnv;
}

/**
 * Runs a program
 * @param {*} program 
 * @returns  evaluated program
 */
function run(program) {
  let env = Object.create(topEnv);
  let tree = parse(program);
  // console.log(tree.args[0].args[1])
  debugger;
  // console.log(program);
  // console.log(ins(tree));
  return tree.evaluate(env);
}

/**
 * Runs a program from a given file
 * @param {*} fileName 
 * @returns evaluated program
 */
function runFromFile(fileName) {
  try {
    let program = fs.readFileSync(fileName, 'utf8');
    return run(program);
  }
  catch (err) {
    console.log(err);
  }
}

/**
 * Runs a program from a compiled tree
 * @param {*} fileName 
 * @return evaluation of tree 
 */
function runFromEVM(fileName) {
  try {
    let json = fs.readFileSync(fileName, 'utf8');
    let flatTree = JSON.parse(json);
    let tree = json2Ast(flatTree);
    debugger;
    let env = Object.create(topEnv);
    // console.log(program);
    // console.log(ins(tree));
    return tree.evaluate(env);
  }
  catch (err) {
    console.log(err);
  }
}

module.exports = {
  run,
  runFromFile,
  runFromEVM,
  loadPlugins,
  topEnv,
  specialForms,
  parser,
  // evaluate,
};