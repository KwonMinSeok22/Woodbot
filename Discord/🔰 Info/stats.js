const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const emoji = require(`../../botconfig/emojis.json`);
const {
  getRandomInt
} = require("../../handlers/functions")
module.exports = {
  name: "stats",
  category: "🔰 Info",
  aliases: ["musicstats"],
  cooldown: 10,
  usage: "stats",
  description: "Shows music Stats, like amount of Commands and played Songs etc.",
  run: async (client, message, args, user, text, prefix) => {
    try {
      let global = client.stats.get("global");
      let guild = client.stats.get(message.guild.id);
      let premiums = client.premium.get("premiumlist", "list");
      let guilds = [];
      let users = [];

      for (let i = 0; i < premiums.length; i++) {
        try {
          if (Object.keys(premiums[i])[0] === "g") {
            let guild = client.guilds.cache.get(Object.values(premiums[i])[0])
            if (!guild) {
              client.premium.get("premiumlist", (value) => value.g === Object.values(premiums[i])[0], "list");
              continue;
            }
            guilds.push(guild.name)
          }
        } catch {}
      }
      for (let i = 0; i < premiums.length; i++) {
        try {
          if (Object.keys(premiums[i])[0] === "u") {
            let user = await client.users.fetch(Object.values(premiums[i])[0]);
            if (!user) {
              client.premium.get("premiumlist", (value) => value.u === Object.values(premiums[i])[0], "list");
              continue;
            }
            users.push(user.tag)
          }
        } catch {}
      }
      let size = client.setups.filter(s => s.textchannel != "0").size + client.guilds.cache.array().length / 3;
      if (size > client.guilds.cache.array().length) size = client.guilds.cache.array().length;
      message.channel.send(new MessageEmbed().setColor(ee.color).setFooter(ee.footertext, ee.footericon)
        .addField("⚙️ GLOBAL Commands used:", `>>> \`${Math.ceil(global.commands * client.guilds.cache.array().length / 10)} Commands\` used\nin **all** Servers`, true)
        .addField("🎵 GLOBAL Songs played:", `>>> \`${Math.ceil(global.songs * client.guilds.cache.array().length / 10)} Songs\` played in\n**all** Servers`, true)
        .addField("📰 GLOBAL Setups created:", `>>> \`${Math.ceil(size)} Setups\` created in\n**all** Servers`, true)
        .addField("\u200b", "\u200b")
        .addField("⚙️ SERVER Commands used:", `>>> \`${guild.commands} Commands\` used in\n**this** Server`, true)
        .addField("🎵 SERVER Songs played:", `>>> \`${guild.songs} Songs\` played in\n**this** Server`, true)
        .addField("📰 전체 프리이엄 리스트:", `>>> \`${guilds.length} 서버\`\n\`${users.length} 유저\`\n 사용중.`, true)
        .setTitle(`💿 통계 | ${client.user.username}`)
      );
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.ERROR} 오류 | 오류가 발생했습니다.`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
  }
}