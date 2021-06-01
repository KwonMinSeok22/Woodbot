const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `경고확인`,
  category: `🚫 Admin`,
  aliases: [`warns`, `warnlist`, `warn-list`, `warnings`],
  description: `경고를 부여한 멤버의 경고 횟수 또는 사유를 확인합니다.`,
  usage: `경고확인 @유저`,
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let warnmember = message.mentions.members.first() || message.guild.members.cache.get(args[0] ? args[0] : ``);
      if (!warnmember)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 경고를 확인하려는 멤버를 입력해주세요!`)
          .setDescription(`사용법: \`${prefix}경고 @유저 [사유]\``)
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
        const warnData = warnIDs.map(id => client.modActions.get(id));
        if (!warnIDs || !warnData || !warnIDs.length)
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${emoji.msg.ERROR} 오류 | 멤버에게 경고가 없습니다.`)
          );

        let warnings = warnData
        let warnembed = new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${warnIDs.length} | ${warnmember.user.tag}`)
        let string = ``;
        for (let i = 0; i < warnings.length; i++) {
          string +=
            `================================
**경고 ID:** \`${i}\`
**경고 일:** \`${warnings[i].when}\`
**처리자:** \`${message.guild.members.cache.get(warnings[i].moderator) ? message.guild.members.cache.get(warnings[i].moderator).user.tag :  warnings[i].moderator}\`
**사유:** \`${warnings[i].reason.length > 50 ? warnings[i].reason.substr(0, 50) + ` ...` : warnings[i].reason}\`
`
        }
        warnembed.setDescription(string)
        let k = warnembed.description
        for (let i = 0; i < k.length; i += 2048) {
          message.channel.send(warnembed.setDescription(k.substr(i, i + 2048)))
        }

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
