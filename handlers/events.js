const fs = require("fs");
const ascii = require("ascii-table");
let table = new ascii("Events");
table.setHeading("Events", "Load status");
const allevents = [];
module.exports = async (client) => {

    const load_dir = (dir) => {
      const event_files = fs.readdirSync(`./events/${dir}`).filter((file) => file.endsWith(".js"));
      for (const file of event_files) {
        const event = require(`../events/${dir}/${file}`)
        let eventName = file.split(".")[0];
        allevents.push(eventName);
        client.on(eventName, event.bind(null, client));
      }
    }
    await ["client", "guild", "server"].forEach(e => load_dir(e));
    for (let i = 0; i < allevents.length; i++) {
      try {
        table.addRow(allevents[i], "Ready");
      } catch (e) {
        console.log(String(e.stack).red);
      }
    }
    console.log(table.toString().cyan);

      const stringlength = 69;

      console.log("\n")
      console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.bold.brightGreen)
      console.log(`     ┃ `.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightGreen)
      console.log(`     ┃ `.bold.brightGreen + `서비스 목록`.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length - `서비스 목록`.length) + "┃".bold.brightGreen)
      console.log(`     ┃ `.bold.brightGreen + `  /-/ https://discord.gg/3EyfukUaXu /-/`.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length - `  /-/ https://discord.gg/3EyfukUaXu /-/`.length) + "┃".bold.brightGreen)
      console.log(`     ┃ `.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightGreen)
      console.log(`     ┃ `.bold.brightGreen + `  /-/ Discord: MinSeok_P#3582 /-/`.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length - `  /-/ By Discord: MinSeok_P#3582 /-/`.length) + "   ┃".bold.brightGreen)
      console.log(`     ┃ `.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightGreen)
      console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.bold.brightGreen)
      console.log("\n")
      console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.bold.yellow)
      console.log(`     ┃ `.bold.yellow + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.yellow)
      console.log(`     ┃ `.bold.yellow + `로그인`.bold.yellow + " ".repeat(-1 + stringlength - ` ┃ `.length - `로그인`.length) + "┃".bold.yellow)
      console.log(`     ┃ `.bold.yellow + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.yellow)
      console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.bold.yellow)

};