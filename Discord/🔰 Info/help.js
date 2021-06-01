const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: "도움",
  category: "🔰 Info",
  aliases: ["h", "commandinfo", "help", "도움말"],
  cooldown: 4,
  usage: "도움 [명령어]",
  description: "명령어를 확인합니다.",
  run: async (client, message, args, user, text, prefix) => {
    let emojis = ["💰", "🔰", "🎶", "👀", "⚜️"]
    try {
      if (args[0]) {
        const embed = new MessageEmbed();
        const cmd = client.commands.get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()));
        var cat = false;
        if (!cmd) {
          cat = client.categories.find(cat => cat.toLowerCase().includes(args[0].toLowerCase()))
        }
        if (!cmd && (!cat || cat == null)) {
          return message.channel.send(embed.setColor(ee.wrongcolor).setDescription(`No Information found for command **${args[0].toLowerCase()}**`));
        } else if (!cmd && cat) {
          var category = cat;
          const items = client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
          const n = 3;
          const result = [
            [],
            [],
            []
          ];
          const wordsPerLine = Math.ceil(items.length / 3);
          for (let line = 0; line < n; line++) {
            for (let i = 0; i < wordsPerLine; i++) {
              const value = items[i + line * wordsPerLine];
              if (!value) continue;
              result[line].push(value);
            }
          }

          const embed = new MessageEmbed()
            .setColor(ee.color)
            .setThumbnail(client.user.displayAvatarURL())
            .setTitle(`MENU 🔰 **${category.toUpperCase()} [${items.length}]**`)
            .setFooter(`To see command Descriptions and Inforamtion, type: ${config.prefix}help [CMD NAME]`, client.user.displayAvatarURL());

          if (category.toLowerCase().includes("custom")) {
            const cmd = client.commands.get(items[0].split("`").join("").toLowerCase()) || client.commands.get(client.aliases.get(items[0].split("`").join("").toLowerCase()));
            try {
              embed.addField(`**${category.toUpperCase()} [${items.length}]**`, `> \`${items[0]}\`\n\n**Usage:**\n> \`${cmd.usage}\``);
            } catch {}
          } else {
            try {
              embed.addField(`\u200b`, `> ${result[0].join("\n> ")}`, true);
            } catch {}
            try {
              embed.addField(`\u200b`, `${result[1].join("\n") ? result[1].join("\n") : "\u200b"}`, true);
            } catch {}
            try {
              embed.addField(`\u200b`, `${result[2].join("\n") ? result[2].join("\n") : "\u200b"}`, true);
            } catch {}
          }
          return message.channel.send(embed)
        }
        if (cmd.name) embed.addField("**명령어 이름**", `\`${cmd.name}\``);
        if (cmd.name) embed.setTitle(`부 명령어:\`${cmd.name}\``);
        if (cmd.description) embed.addField("**설명**", `\`\`\`${cmd.description}\`\`\``);
        if (cmd.aliases) try {
          embed.addField("**명령어**", `\`${cmd.aliases.map((a) => `${a}`).join("`, `")}\``);
        } catch {}
        if (cmd.cooldown) embed.addField("**쿨다운**", `\`\`\`${cmd.cooldown} 초\`\`\``);
        else embed.addField("**쿨다운**", `\`\`\`3 초\`\`\``);
        if (cmd.usage) {
          embed.addField("**사용법**", `\`\`\`${config.prefix}${cmd.usage}\`\`\``);
          embed.setFooter("예: <> = 필수, [] = 옵션", ee.footericon);
        }
        if (cmd.useage) {
          embed.addField("**사용법**", `\`\`\`${config.prefix}${cmd.useage}\`\`\``);
          embed.setFooter("예: <> = 필수, [] = 옵션", ee.footericon);
        }
        return message.channel.send(embed);
      } else {
        let userperms = message.member.hasPermission("ADMINISTRATOR");
        let owner = config.ownerIDS.includes(message.author.id);
        let cmduser = message.author.id;

        const baseembed = new MessageEmbed()
          .setColor(ee.color)
          .setFooter("이모티콘을 클릭 해주세요!", ee.footericon)
          .setTitle("확인 하고 싶은 명령어의 이모티콘을 클릭해주세요!")
          .setDescription(`

💰  **==>** **프리미엄** 명령어

🔰  **==>** **정보** 명령어

🎶  **==>** **음악** 명령어

👀  **==>** **오디오 필터** 명령어

⚜️  **==>** **재생목록 (커스텀)저장** 명령어
${owner == true ? `\n👑 **==>** **총관리자** 명령어` : ""}
${userperms == true ? `\n⚙️ **==>** **설정** 명령어

🚫  **==>** **관리자** 명령어` : ""}
`)

        sendBaseEmbed();

        async function sendBaseEmbed(basemsg) {
          try {
            let msg;
            if (basemsg) msg = await basemsg.edit(baseembed)
            else msg = await message.channel.send(baseembed);

            if (owner) emojis.push("👑")
            if (userperms) {
              emojis.push("⚙️")
              emojis.push("🚫")
            }

            for (const emoji of emojis)
              msg.react(emoji).catch(e => console.log("반응을 추가할 수 없음"))

            const filter = (reaction, user) => {
              return emojis.includes(reaction.emoji.name) && user.id === cmduser;
            };

            msg.awaitReactions(filter, {
                max: 1,
                time: 30 * 1000,
                errors: ['time']
              })
              .then(collected => {
                collected.first().users.remove(user.id).catch(error => console.error('반응을 지우지 못했습니다. '));
                var found = false;
                for (var i = 0; i < client.categories.length && !found; i++) {
                  if (client.categories[i].includes(collected.first().emoji.name)) {
                    sendCategoryEmbed(client.categories[i], msg)
                    break;
                  }
                }
              })
              .catch(e => {
                return message.channel.send(new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setFooter(ee.footertext, ee.footericon)
                  .setTitle(`${emoji.msg.ERROR} 오류 | 시간이 초과 되었습니다.  `)
                  .setDescription(`\`\`\`${e.message}\`\`\``)
                ).then(msg => msg.delete({
                  timeout: 4000
                }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey)))
              });
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

        function sendCategoryEmbed(category, message) {

          try {
            const items = client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
            const n = 3;
            const result = [
              [],
              [],
              []
            ];
            const wordsPerLine = Math.ceil(items.length / 3);
            for (let line = 0; line < n; line++) {
              for (let i = 0; i < wordsPerLine; i++) {
                const value = items[i + line * wordsPerLine];
                if (!value) continue;
                result[line].push(value);
              }
            }

            const embed = new MessageEmbed()
              .setColor(ee.color)
              .setThumbnail(client.user.displayAvatarURL())
              .setTitle(`MENU 🔰 **${category.toUpperCase()} [${items.length}]**`)
              .setDescription("*도움말로 돌아가기:* ⏪")
              .setFooter(`명령어와 설명 및 정보를 보려면 → ${config.prefix}도움 [명령어]`, client.user.displayAvatarURL());

            if (category.toLowerCase().includes("custom")) {
              const cmd = client.commands.get(items[0].split("`").join("").toLowerCase()) || client.commands.get(client.aliases.get(items[0].split("`").join("").toLowerCase()));
              try {
                embed.addField(`**${category.toUpperCase()} [${items.length}]**`, `> \`${items[0]}\`\n\n**사용법:**\n> \`${cmd.usage}\``);
              } catch {}
            } else {
              try {
                embed.addField(`\u200b`, `> ${result[0].join("\n> ")}`, true);
              } catch {}
              try {
                embed.addField(`\u200b`, `${result[1].join("\n") ? result[1].join("\n") : "\u200b"}`, true);
              } catch {}
              try {
                embed.addField(`\u200b`, `${result[2].join("\n") ? result[2].join("\n") : "\u200b"}`, true);
              } catch {}
            }
            message.edit(embed).then(msg => {
              msg.react("⏪")
              emojis.push("⏪")
              const filter = (reaction, user) => {
                return emojis.includes(reaction.emoji.name) && user.id === cmduser;
              };
              msg.awaitReactions(filter, {
                  max: 1,
                  time: 60 * 1000,
                  errors: ['time']
                })
                .then(collected => {
                  collected.first().users.remove(user.id).catch(error => console.error('반응을 지우지 못했습니다. '));
                  var found = false;
                  if (collected.first().emoji.name === "⏪") return sendBaseEmbed(msg);
                  for (var i = 0; i < client.categories.length && !found; i++) {
                    if (client.categories[i].includes(collected.first().emoji.name)) {
                      sendCategoryEmbed(client.categories[i], msg)
                      break;
                    }
                  }
                })
                .catch(e => {
                  try {
                    message.reactions.removeAll().catch(error => console.error('반응을 지우지 못했습니다. '));
                  } catch {
                    /* */
                  }
                });
            })
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
        /* OLD HELP COMMAND
                 const embed = new MessageEmbed()
                     .setColor(ee.color)
                     .setThumbnail(client.user.displayAvatarURL())
                     .setTitle("HELP MENU 🔰 OTHER Commands")
                     .setFooter(`To see command descriptions and inforamtion, type: ${config.prefix}help [CMD NAME]`, client.user.displayAvatarURL());
                 const embed2 = new MessageEmbed()
                     .setColor(ee.color)
                     .setThumbnail(client.user.displayAvatarURL())
                     .setTitle("HELP MENU -🎶 MUSIC Commands")
                     .setFooter(`To see command descriptions and inforamtion, type: ${config.prefix}help [CMD NAME]`, client.user.displayAvatarURL());
                 const commands = (category) => {
                     return client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
                 };
                 try {
                   for (let i = 0; i < client.categories.length; i += 1) {
                     const current = client.categories[i];
                     const items = commands(current);
                     const n = 3;
                     const result = [[], [], []];
                     const wordsPerLine = Math.ceil(items.length / 3);
                     for (let line = 0; line < n; line++) {
                         for (let i = 0; i < wordsPerLine; i++) {
                             const value = items[i + line * wordsPerLine];
                             if (!value) continue;
                             result[line].push(value);
                         }
                     }
                     if (current.toLowerCase().includes("administration")) {
                         if (!message.member.hasPermission("ADMINISTRATOR")) continue;
                     }
                     if (current.toLowerCase().includes("owner")) {
                         if (!config.ownerIDS.includes(message.author.id)) continue;
                     }
                     if (current.toLowerCase().includes("music") || current.toLowerCase().includes("filter")){
                       try{embed2.addField(`**${current.toUpperCase()} [${items.length}]**`, `> ${result[0].join("\n> ")}`, true);}catch{}
                       try{embed2.addField(`\u200b`, `${result[1].join("\n") ? result[1].join("\n") : "\u200b"}`, true);}catch{}
                       try{embed2.addField(`\u200b`, `${result[2].join("\n") ? result[2].join("\n") : "\u200b"}`, true);}catch{}
                       continue;
                     }
                     if (current.toLowerCase().includes("custom")){
                       const cmd = client.commands.get(items[0].split("`").join("").toLowerCase()) || client.commands.get(client.aliases.get(items[0].split("`").join("").toLowerCase()));
                       if (!cmd) {
                           continue;
                       }
                       try{embed2.addField(`**${current.toUpperCase()} [${items.length}]**`, `> \`${items[0]}\`\n**Usage:**\n> \`${cmd.usage}\``);}catch{}
                       continue;
                     }
                     try{embed.addField(`**${current.toUpperCase()} [${items.length}]**`, `> ${result[0].join("\n> ")}`, true);}catch{}
                     try{embed.addField(`\u200b`, `${result[1].join("\n") ? result[1].join("\n") : "\u200b"}`, true);}catch{}
                     try{embed.addField(`\u200b`, `${result[2].join("\n") ? result[2].join("\n") : "\u200b"}`, true);}catch{}
                   }
                 } catch (e) {
                     console.log(String(e.stack).red);
                 }
                 message.channel.send(embed);
                 return message.channel.send(embed2);*/
      }
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
/**
 * @INFO
 * Bot Coded by Tomato#6966 | https://github.com/Tomato6966/discord-js-lavalink-Music-Bot-erela-js
 * @INFO
 * Work for Milrato Development | https://milrato.eu
 * @INFO
 * Please mention Him / Milrato Development, when using this Code!
 * @INFO
 */
