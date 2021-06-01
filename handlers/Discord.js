const {
  readdirSync
} = require("fs");
const ascii = require("ascii-table");
let table = new ascii("Discord");
table.setHeading("Discord", "Load status");
console.log(`Discord Flie`.yellow);
module.exports = (client) => {
  try {
    readdirSync("./Discord/").forEach((dir) => {
      const commands = readdirSync(`./Discord/${dir}/`).filter((file) => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`../Discord/${dir}/${file}`);
        if (pull.name) {
          client.commands.set(pull.name, pull);
          table.addRow(file, "Ready");
        } else {
          table.addRow(file, `error->missing a help.name,or help.name is not a string.`);
          continue;
        }
        if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
      }
    });
    console.log(table.toString().cyan);
  } catch (e) {
    console.log(String(e.stack).bgRed)
  }
};
