const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `경고`,
  category: `🚫 Admin`,
  aliases: [`warn`],
  cooldown: 0.5,
  description: `멤버에게 경고를 부여합니다.`,
  usage: `경고 @유저 [사유]`,
  memberpermissions: [`KICK_MEMBERS`],
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let warnmember = message.mentions.members.first() || message.guild.members.cache.get(args[0] ? args[0] : ``);
      if (!warnmember)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 경고하려는 멤버를 입력해주세요!`)
          .setDescription(`사용법: \`${prefix}경고 @유저 [사유]\``)
        );

      let reason = args.slice(1).join(` `);
      if (!reason) {
        reason = `사유없음`;
      }

      const memberPosition = warnmember.roles.highest.position;
      const moderationPosition = message.member.roles.highest.position;

      if (moderationPosition <= memberPosition)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 당신보다 높거나 같은 멤버에게 경고할 수 없습니다.`)
        );

      try {
        client.userProfiles.ensure(warnmember.user.id, {
          id: message.author.id,
          guild: message.guild.id,
          totalActions: 0,
          warnings: [],
          kicks: []
        });
        const newActionId = client.modActions.autonum;
        client.modActions.set(newActionId, {
          user: warnmember.user.id,
          guild: message.guild.id,
          type: 'warning',
          moderator: message.author.id,
          reason: reason,
          when: new Date().toLocaleString(`de`),
          oldhighesrole: warnmember.roles ? warnmember.roles.highest : `역할이 없었습니다.`,
          oldthumburl: warnmember.user.displayAvatarURL({
            dynamic: true
          })
        });
        // Push the action to the user's warnings
        client.userProfiles.push(warnmember.user.id, newActionId, 'warnings');
        client.userProfiles.inc(warnmember.user.id, 'totalActions');
        const warnIDs = client.userProfiles.get(warnmember.user.id, 'warnings');
        warnmember.send(new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setAuthor(`경고 부여: ${message.author.tag}`, message.author.displayAvatarURL({
            dynamic: true
          }))
          .setDescription(`**${warnIDs.length}회**\n\n사유:\n> ${reason}`)).catch(e => console.log(e.message))

        return message.channel.send(new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.SUCCESS} 성공 | ${warnmember.user.tag} < 경고 부여`)
          .setThumbnail(warnmember.user.displayAvatarURL({
            dynamic: true
          }))
          .setDescription(`**${warnIDs.length}회**\n\n사유:\n> ${reason}`.substr(0, 2048))
        );
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