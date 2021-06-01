const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `추방`,
  category: `🚫 Admin`,
  aliases: [`kick`],
  description: `서버에서 멤버를 추방합니다.`,
  usage: `추방 @유저 [사유]`,
  memberpermissions: [`KICK_MEMBERS`],
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let kickmember = message.mentions.members.first() || message.guild.members.cache.get(args[0] ? args[0] : ``);
      if (!kickmember)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 추방할 멤버를 추가하십시오!`)
          .setDescription(`사용법: \`${prefix}추방 @유저 [사유]\``)
        );

      let reason = args.slice(1).join(` `);
      if (!reason) {
        reason = `사유없음`;
      }

      const memberPosition = kickmember.roles.highest.position;
      const moderationPosition = message.member.roles.highest.position;
      if (moderationPosition <= memberPosition)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 당신보다 위/아래인 사람을 추방할 수 없습니다.`)
        );

      if (!kickmember.kickable)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 멤버는 추방할 수 없습니다.`)
        );

      try {
        kickmember.kick({
          reason: reason
        }).then(() => {
          return message.channel.send(new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${emoji.msg.SUCCESS} 성공 | 추방됨 | ${kickmember.user.tag}`)
            .setDescription(`사유:\n> ${reason}`)
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
