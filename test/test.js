let fs = require('fs');
let should = require('chai').should();
let e2t = require('@ull-esit-pl/example2test');
let eggvm = require('../lib/eggvm.js');

const TESTS = [
  'one', 'scope', 'arithmetic', 'array', 'expcomma', 'fun', 'if',
  'string', 'sum', 'two', 'bracket-array', 'brackets-fun', 'bracket-expcomma', 'multiline-comment',
  'fun-set-alias', 'element-define-alias', 'reto'
];

describe("Console.log Stubbing", function() {
  let originalLog;
  let output = [];

  let tests = new Map();

  tests.set('test/examples/one.egg', [50]);
  tests.set('test/examples/two.egg', [4, 6]);
  tests.set('test/examples/scope-err.egg', ReferenceError);

  beforeEach(function() {
    originalLog = console.log;
    console.log = function (...args) { 
      originalLog(...args); 
      output.push(...args);
      return args;
    };
  });
  
  afterEach(function() {
    console.log = originalLog;
    output = [];
  });

  tests.forEach ((result, file) => {
    it("Trying " + file, function() {
      let program = fs.readFileSync(file, 'utf8');
      if (result instanceof Array) {
        let r = eggvm.run(program);
        for (let i = 0; i < output.length; i++) {
          output[i].should.equal(result[i]);
        }
      } else {
        (() => { eggvm.run(program); }).should.throw(result);
      }
    });
  });
});

describe("Testing without stubbing", function() {
  let runTest = (programName, done) => {
    e2t({
      exampleInput: programName + '.egg',
      executable: 'node bin/egg.js',
      assertion: (result, expected) => result.replace(/\s+/g,'').should.eql(expected.replace(/\s+/g,'')),
      done: done,
    });
  };

  it("should not allow the use of non declared variables", function() {
    let program = fs.readFileSync('examples/scope-err.egg', 'utf8');
    (() => { eggvm.run(program); }).should.throw(/setting.+undefined.+variable/i);
  });

  it("Number as fun error", function() {
    let program = fs.readFileSync('test/examples/number-as-fun-err.egg', 'utf8');
    (() => { eggvm.run(program); }).should.throw(/.*unexpected input.*/i);
  });

  for (let test of TESTS) {
    it(`testing ${test}.egg`, function(done) {
      runTest(test, done);
    });
  }
});

describe("Testing evm", function() {
  let runTest = (programName, done) => {
    e2t({
      exampleInput: programName,
      executable: 'node bin/evm.js',
      assertion: (result, expected) => result.replace(/\s+/g,'').should.eql(expected.replace(/\s+/g,'')),
      done: done,
    });
  };

  it(`testing one.egg.evm`, function(done) {
    runTest('one.egg.evm', done);
  });
});