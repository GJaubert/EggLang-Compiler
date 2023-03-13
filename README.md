Egg

> Gabriel García Jaubert  
> Egg language compiler
> 20/04/2021

  =========

  A small library providing utility methods for running programs in egg language

  ## Installation
  
  npm install @ull-esit-pl-2021/egg-alu0101240374 --save (deprecated)

  Globally:

  npm install -g @ull-esit-pl-2021/egg-alu0101240374 (deprecated)

  ## Usage

  If you install this module locally in your directory, you should place yourself in it in order tu execute these commands.

  Executes _one.egg_ program
  ```
  $ npx egg example/one.egg
  ```
  Executes repl program
  ```
  $ npx egg
  ```
  Compile program
  ```
  $ npx eggc example/one.egg
  ```
  Execute compiled program
  ```
  $ npx evm example/two.egg.evm
  ```

  For any additional help write --help after any executable for example:    
  ```
  $ npx egg --help
  ```
  
  ### Input

  You should write a program with a syntax valid for egg language. for example: 

  ```
  do(
    define(x, 4),
      define(setx, fun(val, 
          set(x, val)
        )
    ),
  setx(50),
  print(x)
  )
  ```

  ### Output
  ```
  50
  ```

  ## Contributing

  In lieu of a formal styleguide, take care to maintain the existing coding style.
  Add unit tests for any new or changed functionality. Lint and test your code.

   ### Tests

    npm run test

   ### Adding plugins

   With this version of Egg, you can add plugins and new features to the language. Just follow the next steps:  

   - Create a _registry.js_ file.
   - Import the components you want to modify from 'lib/public.js'. For example: 

   ```js
    let {topEnv} = require('lib/public.js');
   ```

  The next step is adding the features to your code. In this example we will add the require functionality that will allow us to execute an external code using require(argument) and providing a path as an argument:  

  ```js
    const requireResults = new Map();

    topEnv["require"] = (path) => {
      debugger;
        if (typeof path !== 'string') {
          throw new Error('invalid argument for require, expected a string');
        }
        if (requireResults.has(path)) {
          return requireResults.get(path);
        } 
        else {
          const result = egg.runFromFile(path.replace(/\"/g,''));
          requireResults.set(path, result);
          return result;
        }
    }
  ```

  The next step is to export all the components you have modified:

  ```js
    module.exports = {topEnv};
  ```
  
  Now your code won't work if you execute it normally. For making this work, you must add the _-p <fileName>_ option at the execution instruction:  

  ```
  node bin/egg.js examples/one.egg -p ../lib/registry.js
  ```

  ## Release history

  * 1.0.0 Initial release
  * 1.1.0 Sticky added and comments
  * 1.2.0 Offset added
  * 1.2.1 Relp fixed
  * 1.2.2 Doc fixed
  * 1.3.0 Brackets work as parenthesis
  * 1.4.0 Supports multiline comments
  * 1.5.0 New aliases supported
  * 1.6.0 Classes added
  * 1.6.1 EVM bug fixed(now you can use evm files)
