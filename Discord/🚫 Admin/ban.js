const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `차단`,
  category: `🚫 Admin`,
  aliases: [`banhammer`, "ban"],
  description: `유저를 차단 합니다. [0-7 일, 0 == 영구] 선택 가능`,
  usage: `차단 @유저 [0-7 일, 0 == 영구] [사유]`,
  memberpermissions: [`BAN_MEMBERS`],
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let kickmember = message.mentions.members.first() || message.guild.members.cache.get(args[0] ? args[0] : ``);
      if (!kickmember)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 차단할 멤버를 입력해주세요!`)
          .setDescription(`사용법: \`${prefix}차단 @유저 [0-7 일, 0 == 영구] [사유]\``)
        );

      let days = args[1];
      if (Number(days) >= 7) days = 7;
      if (Number(days) <= 0) days = 0;

      let reason = args.slice(2).join(` `);
      if (!reason) {
        reason = `사유 없음`;
      }

      const memberPosition = kickmember.roles.highest.rawPosition;
      const moderationPosition = message.member.roles.highest.rawPosition;

      if (moderationPosition <= memberPosition)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 당신보다 높거나 같은 사람을 금지할 수 없습니다.`)
        );

      if (!kickmember.bannable)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 멤버을 금지할 수 없습니다.`)
        );

      try {
        kickmember.ban({
          days: days,
          reason: reason
        }).then(() => {
          return message.channel.send(new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${emoji.msg.SUCCESS} 성공 | 차단되었습니다.`)
            .setDescription(
            `닉네임: ${kickmember.user.tag} 
            처벌: **${days === 0 ? `영구정지` : `${days} 일 정지`}**
            사유:\n> ${reason}`)
          );
        });
      } catch (e) {
        console.log(String(e.stack).red);
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 오류가 발생했습니다.`)
          .setDescription(`\`\`\`${e.message}\`\`\``)
        );
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
};
