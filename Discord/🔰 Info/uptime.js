const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const emoji = require(`../../botconfig/emojis.json`);
const {
  duration
} = require("../../handlers/functions")
module.exports = {
  name: "μνμ",
  category: "π° Info",
  aliases: [""],
  cooldown: 10,
  usage: "μνμ",
  description: "Botμ΄ μ¨λΌμΈ μνμΈ μκ°μ νμΈν©λλ€.",
  run: async (client, message, args, user, text, prefix) => {
    try {
      message.channel.send(new MessageEmbed()
        .setColor(ee.color)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`:white_check_mark: **${client.user.username}** | ${duration(client.uptime)}`)
      );
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.ERROR} μ€λ₯ | μ€λ₯κ° λ°μνμ΅λλ€.`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
  }
}