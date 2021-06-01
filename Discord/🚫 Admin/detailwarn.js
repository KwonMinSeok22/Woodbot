const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `경고정보`,
  category: `🚫 Admin`,
  aliases: [`warninfo`, `snipe`, `infowarn`, `infowarning`, `detailwarning`, `warninginfo`, `detailwarn`],
  description: `Shows details about one warn Command of a Member`,
  usage: `warn @User [Reason]`,
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let warnmember = message.mentions.members.first() || message.guild.members.cache.get(args[0] ? args[0] : ``);
      if (!warnmember)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 경고를 해제할 멤버를 입력해주세요!`)
          .setDescription(`사용법: \`${prefix}경고차감 @유저 <경고ID>\``)
        );

      if (!args[1])
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 멤버의 경고를 차감할 ID를 입력해주세요!.`)
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
        if (Number(args[1]) >= warnIDs.length || Number(args[1]) < 0)
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${emoji.msg.ERROR} 오류 | 값이 범위를 벗어남`)
            .setDescription(`사용법: \`${prefix}경고차감 @유저 <경고ID>\` 가장 높은 ID: ${warnIDs.length - 1}`)
          );

        const warnData = warnIDs.map(id => client.modActions.get(id));
        let warning = warnData[parseInt(args[1])]
        let warned_by = message.guild.members.cache.get(warning.moderator) ? `${message.guild.members.cache.get(warning.moderator).user.tag} (${warning.moderator})` : warning.moderator;
        let warned_in = client.guilds.cache.get(warning.guild) ? `${client.guilds.cache.get(warning.guild).name} (${warning.guild})` : warning.guild;

        message.channel.send(new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setAuthor(`${warnmember.user.tag}`, warnmember.user.displayAvatarURL({
            dynamic: true
          }))
          .setDescription(`**사유:**\n\`\`\`${warning.reason.length > 2030 ? warning.reason.substr(0, 2030) + ` ...` : warning.reason}\`\`\``)
          .addField(`경고:`, `\`${parseInt(args[1]) + 1}\` | **${warnIDs.length} 회**`, true)
          .addField(`처리자:`, `\`${warned_by}\``, true)
          .addField(`경고 일:`, `\`${warning.when}\``, true)
          .addField(`경고 위치:`, `\`${warned_in}\``, true)
          .addField(`이전 축소 이미지 URL`, `[\`클릭\`](${warning.oldthumburl})`, true)
          .addField(`이전 최고 역할:`, `${message.guild.roles.cache.get(warning.oldhighesrole.id) ? `<@&`+message.guild.roles.cache.get(warning.oldhighesrole.id)+`>` : `\`${warning.oldhighesrole.name} (${warning.oldhighesrole.id})\``}`, true)
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