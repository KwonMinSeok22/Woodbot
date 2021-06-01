
const {
  MessageEmbed
} = require("discord.js")
const config = require("../botconfig/config.json")
const ee = require("../botconfig/embed.json")
const {
  format,
  delay,
  isrequestchannel,
  edit_request_message_queue_info,
  edit_request_message_track_info,
  arrayMove
} = require("../handlers/functions")
module.exports = async (client, message, args, type) => {
  let method = type.includes(":") ? type.split(":") : Array(type)
  if (!message.guild) return;
  //just visual for the console
  try {
    let guildstring = ` - ${message.guild ? message.guild.name : "Unknown Guild Name"} `.substr(0, 22)
    let userstring = ` - ${message.author.tag} `.substr(0, 22)

    const stringlength = 69;
    console.log("\n")
    console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + `노래: `.bold.green + " ".repeat(-1 + stringlength - ` ┃ `.length - `노래: `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + ` - ${args.join(" ")}`.substr(0, 60).bold.cyan + " ".repeat(-1 + stringlength - ` ┃ `.length - ` - ${args.join(" ")}`.substr(0, 60).length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + `요청자: `.bold.green + " ".repeat(-1 + stringlength - ` ┃ `.length - `요청자: `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + userstring.bold.cyan + "━".repeat(stringlength / 3 - userstring.length).bold.brightRed + "━━>".bold.brightRed + ` ${message.author.id}`.bold.cyan + " ".repeat(-1 + stringlength - ` ┃ `.length - userstring.length - "━━>".length - ` ${message.author.id}`.length - "━".repeat(stringlength / 3 - userstring.length).length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + `요청 위치: `.bold.green + " ".repeat(-1 + stringlength - ` ┃ `.length - `요청 위치: `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + guildstring.bold.cyan + "━".repeat(stringlength / 3 - guildstring.length).bold.brightRed + "━━>".bold.brightRed + ` ${message.guild.id}`.bold.cyan + " ".repeat(-1 + stringlength - ` ┃ `.length - guildstring.length - "━━>".length - ` ${message.guild.id}`.length - "━".repeat(stringlength / 3 - guildstring.length).length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightRed)
    console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.bold.brightRed)
    console.log("\n")
  } catch (e) {
    console.log(e) /* */
  }

  let {
    channel
  } = message.member.voice;
  const permissions = channel.permissionsFor(client.user);

  if (!permissions.has("CONNECT"))
    return message.channel.send(new MessageEmbed()
      .setColor(ee.wrongcolor)
      .setFooter(ee.footertext, ee.footericon)
      .setTitle("❌ 오류 | 채널에 참가하려면 권한이 필요합니다.")
    );
  if (!permissions.has("SPEAK"))
    return message.channel.send(new MessageEmbed()
      .setColor(ee.wrongcolor)
      .setFooter(ee.footertext, ee.footericon)
      .setTitle("❌ 오류 | 채널에서 말할 수 있는 권한이 필요합니다.")
    );

  if (method[0] === "song")
    require("./playermanagers/song")(client, message, args, type); 
  else if (method[0] === "request")
    require("./playermanagers/request")(client, message, args, type);  
  else if (method[0] === "playlist")
    require("./playermanagers/playlist")(client, message, args, type);
  else if (method[0] === "similar")
    require("./playermanagers/similar")(client, message, args, type);
  else if (method[0] === "search")
    require("./playermanagers/search")(client, message, args, type);
  else if (method[0] === "skiptrack")
  require("./playermanagers/skiptrack")(client, message, args, type); 
  else
    return message.channel.send(new MessageEmbed()
      .setColor(ee.wrongcolor)
      .setFooter(ee.footertext, ee.footericon)
      .setTitle("❌ Error | 문제가 발생하였나요? 총개발자: `MinSeok_P#3582` 으로 문의 주세요!")
    );
}
