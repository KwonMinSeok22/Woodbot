const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `경고초기화`,
  category: `🚫 Admin`,
  aliases: [`removeallwarn`, `removeallwarnings`, `removeallwarns`],
  description: `경고를 초기화 합니다.`,
  usage: `경고초기화 @유저`,
  memberpermissions: [`KICK_MEMBERS`],
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let warnmember = message.mentions.members.first() || message.guild.members.cache.get(args[0] ? args[0] : ``);
      if (!warnmember)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 경고를 해제할 멤버을 입력해주세요!`)
          .setDescription(`사용법: \`${prefix}경고차감 @유저 <경고ID>\``)
        );

      const memberPosition = warnmember.roles.highest.position;
      const moderationPosition = message.member.roles.highest.position;

      if (moderationPosition <= memberPosition)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 당신보다 높거나 같은 사람에게 경고할 수 없습니다.`)
        );

      try {
        client.userProfiles.ensure(warnmember.user.id, {
          id: message.author.id,
          guild: message.guild.id,
          totalActions: 0,
          warnings: [],
          kicks: []
        });

        const warnIDs = client.userProfiles.get(warnmember.user.id, 'warnings');
        if (!warnIDs)
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${emoji.msg.ERROR} 오류 | 사용자에게 경고가 없습니다.`)
          );

        client.userProfiles.set(warnmember.user.id, [], 'warnings')


        warnmember.send(new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setAuthor(`${message.author.tag}님의 경고가 모두 초기화 되었습니다.`, message.author.displayAvatarURL({
            dynamic: true
          }))
          .setDescription(`경고초기화: ${warnIDs.length} 회`)

        ).catch(e => console.log(e.message))

        message.channel.send(new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.SUCCESS} 성공 | ${warnIDs.length}회 경고 초기화 | 닉네임: ${warnmember.user.tag}`)
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