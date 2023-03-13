let {egg, topEnv, specialForms} = require('./public.js');


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

module.exports = {specialForms, topEnv};