const { specialForms } = require("./eggvm");
const {BLUE, RED, DEFAULT} = require("./colors.js");

const eggExit = specialForms['exit'] = () => {
  console.log(BLUE + 'goodbye' + DEFAULT);
  process.exit(0);
}

const HELP = [
  (BLUE + 'help()' + DEFAULT + " - Muestra la ayuda"),
  (BLUE + 'exit() o CTRL + D' + DEFAULT + " - Sale del bucle REPL"),
  (BLUE + 'CTRL + C' + DEFAULT + " - Descarta la línea actual"),
];

const help = specialForms["help"] = () => {
  for (let h of HELP) {
    console.log(h);
  }
  return "-".repeat(HELP[0].length - 10);
}

module.exports = {eggExit, help}