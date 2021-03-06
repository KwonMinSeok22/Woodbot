const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: "λμ",
  category: "π° Info",
  aliases: ["h", "commandinfo", "help", "λμλ§"],
  cooldown: 4,
  usage: "λμ [λͺλ Ήμ΄]",
  description: "λͺλ Ήμ΄λ₯Ό νμΈν©λλ€.",
  run: async (client, message, args, user, text, prefix) => {
    let emojis = ["π°", "π°", "πΆ", "π", "βοΈ"]
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
            .setTitle(`MENU π° **${category.toUpperCase()} [${items.length}]**`)
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
        if (cmd.name) embed.addField("**λͺλ Ήμ΄ μ΄λ¦**", `\`${cmd.name}\``);
        if (cmd.name) embed.setTitle(`λΆ λͺλ Ήμ΄:\`${cmd.name}\``);
        if (cmd.description) embed.addField("**μ€λͺ**", `\`\`\`${cmd.description}\`\`\``);
        if (cmd.aliases) try {
          embed.addField("**λͺλ Ήμ΄**", `\`${cmd.aliases.map((a) => `${a}`).join("`, `")}\``);
        } catch {}
        if (cmd.cooldown) embed.addField("**μΏ¨λ€μ΄**", `\`\`\`${cmd.cooldown} μ΄\`\`\``);
        else embed.addField("**μΏ¨λ€μ΄**", `\`\`\`3 μ΄\`\`\``);
        if (cmd.usage) {
          embed.addField("**μ¬μ©λ²**", `\`\`\`${config.prefix}${cmd.usage}\`\`\``);
          embed.setFooter("μ: <> = νμ, [] = μ΅μ", ee.footericon);
        }
        if (cmd.useage) {
          embed.addField("**μ¬μ©λ²**", `\`\`\`${config.prefix}${cmd.useage}\`\`\``);
          embed.setFooter("μ: <> = νμ, [] = μ΅μ", ee.footericon);
        }
        return message.channel.send(embed);
      } else {
        let userperms = message.member.hasPermission("ADMINISTRATOR");
        let owner = config.ownerIDS.includes(message.author.id);
        let cmduser = message.author.id;

        const baseembed = new MessageEmbed()
          .setColor(ee.color)
          .setFooter("μ΄λͺ¨ν°μ½μ ν΄λ¦­ ν΄μ£ΌμΈμ!", ee.footericon)
          .setTitle("νμΈ νκ³  μΆμ λͺλ Ήμ΄μ μ΄λͺ¨ν°μ½μ ν΄λ¦­ν΄μ£ΌμΈμ!")
          .setDescription(`

π°  **==>** **νλ¦¬λ―Έμ** λͺλ Ήμ΄

π°  **==>** **μ λ³΄** λͺλ Ήμ΄

πΆ  **==>** **μμ** λͺλ Ήμ΄

π  **==>** **μ€λμ€ νν°** λͺλ Ήμ΄

βοΈ  **==>** **μ¬μλͺ©λ‘ (μ»€μ€ν)μ μ₯** λͺλ Ήμ΄
${owner == true ? `\nπ **==>** **μ΄κ΄λ¦¬μ** λͺλ Ήμ΄` : ""}
${userperms == true ? `\nβοΈ **==>** **μ€μ ** λͺλ Ήμ΄

π«  **==>** **κ΄λ¦¬μ** λͺλ Ήμ΄` : ""}
`)

        sendBaseEmbed();

        async function sendBaseEmbed(basemsg) {
          try {
            let msg;
            if (basemsg) msg = await basemsg.edit(baseembed)
            else msg = await message.channel.send(baseembed);

            if (owner) emojis.push("π")
            if (userperms) {
              emojis.push("βοΈ")
              emojis.push("π«")
            }

            for (const emoji of emojis)
              msg.react(emoji).catch(e => console.log("λ°μμ μΆκ°ν  μ μμ"))

            const filter = (reaction, user) => {
              return emojis.includes(reaction.emoji.name) && user.id === cmduser;
            };

            msg.awaitReactions(filter, {
                max: 1,
                time: 30 * 1000,
                errors: ['time']
              })
              .then(collected => {
                collected.first().users.remove(user.id).catch(error => console.error('λ°μμ μ§μ°μ§ λͺ»νμ΅λλ€. '));
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
                  .setTitle(`${emoji.msg.ERROR} μ€λ₯ | μκ°μ΄ μ΄κ³Ό λμμ΅λλ€.  `)
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
              .setTitle(`${emoji.msg.ERROR} μ€λ₯ | μ€λ₯κ° λ°μνμ΅λλ€.`)
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
              .setTitle(`MENU π° **${category.toUpperCase()} [${items.length}]**`)
              .setDescription("*λμλ§λ‘ λμκ°κΈ°:* βͺ")
              .setFooter(`λͺλ Ήμ΄μ μ€λͺ λ° μ λ³΄λ₯Ό λ³΄λ €λ©΄ β ${config.prefix}λμ [λͺλ Ήμ΄]`, client.user.displayAvatarURL());

            if (category.toLowerCase().includes("custom")) {
              const cmd = client.commands.get(items[0].split("`").join("").toLowerCase()) || client.commands.get(client.aliases.get(items[0].split("`").join("").toLowerCase()));
              try {
                embed.addField(`**${category.toUpperCase()} [${items.length}]**`, `> \`${items[0]}\`\n\n**μ¬μ©λ²:**\n> \`${cmd.usage}\``);
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
              msg.react("βͺ")
              emojis.push("βͺ")
              const filter = (reaction, user) => {
                return emojis.includes(reaction.emoji.name) && user.id === cmduser;
              };
              msg.awaitReactions(filter, {
                  max: 1,
                  time: 60 * 1000,
                  errors: ['time']
                })
                .then(collected => {
                  collected.first().users.remove(user.id).catch(error => console.error('λ°μμ μ§μ°μ§ λͺ»νμ΅λλ€. '));
                  var found = false;
                  if (collected.first().emoji.name === "βͺ") return sendBaseEmbed(msg);
                  for (var i = 0; i < client.categories.length && !found; i++) {
                    if (client.categories[i].includes(collected.first().emoji.name)) {
                      sendCategoryEmbed(client.categories[i], msg)
                      break;
                    }
                  }
                })
                .catch(e => {
                  try {
                    message.reactions.removeAll().catch(error => console.error('λ°μμ μ§μ°μ§ λͺ»νμ΅λλ€. '));
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
              .setTitle(`${emoji.msg.ERROR} μ€λ₯ | μ€λ₯κ° λ°μνμ΅λλ€.`)
              .setDescription(`\`\`\`${e.message}\`\`\``)
            );
          }
        }
        /* OLD HELP COMMAND
                 const embed = new MessageEmbed()
                     .setColor(ee.color)
                     .setThumbnail(client.user.displayAvatarURL())
                     .setTitle("HELP MENU π° OTHER Commands")
                     .setFooter(`To see command descriptions and inforamtion, type: ${config.prefix}help [CMD NAME]`, client.user.displayAvatarURL());
                 const embed2 = new MessageEmbed()
                     .setColor(ee.color)
                     .setThumbnail(client.user.displayAvatarURL())
                     .setTitle("HELP MENU -πΆ MUSIC Commands")
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
        .setTitle(`${emoji.msg.ERROR} μ€λ₯ | μ€λ₯κ° λ°μνμ΅λλ€.`)
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
