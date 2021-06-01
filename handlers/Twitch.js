const {
  readdirSync
} = require("fs");
const ascii = require("ascii-table");
let table = new ascii("Twitch");
table.setHeading("Twitch", "Load status");
console.log(`Twitch Flie`.yellow);
module.exports = (client) => {
  try {
    readdirSync("./Twitch/").forEach((dir) => {
      const commands = readdirSync(`./Twitch/${dir}/`).filter((file) => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`../Twitch/${dir}/${file}`);
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
