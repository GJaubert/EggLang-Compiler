class Value {
  constructor(token) {
    this.type = token.type;
    this.value = token.value;
  }
  evaluate(env) {
    return this.value;
  }
}

class Word {
  constructor(token) {
    this.type = token.type;
    this.name = token.name;
  }

  evaluate(env) {
    if (this.name in env) {
      return env[this.name];
    } else {
      throw new ReferenceError(`Undefined variable: ${this.name}`);
    }
  }
}

class Apply {
  constructor(tree) {
    this.type = tree.type;
    this.operator = tree.operator;
    this.args = tree.args;
  }

  evaluate(env) {
    const {specialForms} = require('./eggvm.js');
    if (this.operator.type == 'word' && this.operator.name in specialForms) {
      return specialForms[this.operator.name](this.args, env);
    }
    try {
      debugger;
      let op = this.operator.evaluate(env);
      let argsProcessed = this.args.map((arg) => arg.evaluate(env));
      if ((typeof op == 'function')) {
        return op(...argsProcessed);
      }
    } catch (err) {
      throw new TypeError('Applying not a function or method ' + err);
    }
  }
}

let j2a = Object.create(null);

j2a['value'] = (node) => new Value(node);
j2a['word'] = (node) => new Word(node);
j2a['apply'] = (node) => {
  let apply = new Apply({
    type: "apply",
    args: [],
    operator: json2Ast(node.operator)
  });
  node.args.forEach(element => {
    apply.args.push(json2Ast(element));
  });
  return apply;
}

function json2Ast(node) {
  if (node && node.type && j2a[node.type])
    return j2a[node.type](node);
  else
    throw 'Not valid AST tree';
}

module.exports = {Value, Word, Apply, json2Ast, j2a};